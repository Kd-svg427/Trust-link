import { useEffect, useState, useRef } from 'react';
import { Save, Upload, Eye, RotateCcw, Rocket, Palette, Type, Image, FileText, Globe, X, Loader2, Check, Plus, Trash2 } from 'lucide-react';
import { getThemeDraft, saveThemeDraft, publishTheme, resetThemeToDefault, uploadThemeAsset, THEME_DEFAULTS } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

const SECTIONS = [
  { key: 'branding', label: 'Branding', icon: Globe },
  { key: 'colors', label: 'Colors', icon: Palette },
  { key: 'typography', label: 'Typography', icon: Type },
  { key: 'banner', label: 'Homepage Banner', icon: Image },
  { key: 'footer', label: 'Footer', icon: FileText },
];

const FONTS = [
  'Plus Jakarta Sans', 'Inter', 'Roboto', 'Outfit', 'Poppins',
  'Nunito', 'Open Sans', 'Lato', 'Montserrat', 'DM Sans',
];

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export default function ThemePage() {
  const toast = useToast();
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [section, setSection] = useState('branding');
  const [confirmReset, setConfirmReset] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const draft = await getThemeDraft();
        setTheme(draft);
      } catch (err) {
        toast.error('Failed to load theme settings: ' + err.message);
        setTheme({ ...THEME_DEFAULTS });
      } finally { setLoading(false); }
    })();
  }, []);

  const update = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateNested = (parentKey, childKey, value) => {
    setTheme(prev => ({
      ...prev,
      [parentKey]: { ...(prev[parentKey] || {}), [childKey]: value }
    }));
    setDirty(true);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saved = await saveThemeDraft(theme);
      setTheme(saved);
      setDirty(false);
      toast.success('Draft saved!');
    } catch (err) { toast.error('Save failed: ' + err.message); }
    finally { setSaving(false); }
  };

  const validate = () => {
    const errors = [];
    if (!theme.site_name?.trim()) errors.push('Site name is required');
    if (!HEX_REGEX.test(theme.primary_color)) errors.push('Invalid primary color hex');
    if (!HEX_REGEX.test(theme.secondary_color)) errors.push('Invalid secondary color hex');
    if (!HEX_REGEX.test(theme.accent_color)) errors.push('Invalid accent color hex');
    return errors;
  };

  const handlePublish = async () => {
    const errors = validate();
    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
      return;
    }
    setPublishing(true);
    try {
      // Save draft first, then publish
      await saveThemeDraft(theme);
      await publishTheme(theme);
      setDirty(false);
      toast.success('🚀 Theme published! Changes are now live on the storefront.');
    } catch (err) { toast.error('Publish failed: ' + err.message); }
    finally { setPublishing(false); }
  };

  const handleReset = async () => {
    try {
      const defaults = await resetThemeToDefault();
      setTheme({ ...defaults, status: 'draft' });
      setDirty(false);
      setConfirmReset(false);
      toast.success('Theme reset to defaults and published');
    } catch (err) { toast.error('Reset failed: ' + err.message); }
  };

  const handlePreview = async () => {
    // Save draft first, then open storefront with preview param
    try {
      await saveThemeDraft(theme);
      setDirty(false);
      toast.info('Opening preview…');
      window.open(`${window.location.origin}${window.location.pathname}#/?preview=draft`, '_blank');
    } catch (err) { toast.error('Could not save draft for preview'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Theme Editor</h2>
          <p className="text-sm text-slate-500 mt-0.5">Customize how your storefront looks to buyers</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handlePreview}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSaveDraft} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-brand-ring px-3.5 py-2 text-xs font-semibold text-brand hover:bg-brand-soft transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button onClick={handlePublish} disabled={publishing}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      {dirty && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-medium text-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          You have unsaved changes
        </div>
      )}

      {/* Section tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const active = section === s.key;
          return (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                active ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}>
              <Icon className="w-4 h-4" /> {s.label}
            </button>
          );
        })}
      </div>

      {/* Section content */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {section === 'branding' && <BrandingSection theme={theme} update={update} toast={toast} />}
        {section === 'colors' && <ColorsSection theme={theme} update={update} />}
        {section === 'typography' && <TypographySection theme={theme} update={update} />}
        {section === 'banner' && <BannerSection theme={theme} update={update} toast={toast} />}
        {section === 'footer' && <FooterSection theme={theme} update={update} updateNested={updateNested} />}
      </div>

      {/* Reset confirm */}
      {confirmReset && (
        <div className="modal-overlay" onClick={() => setConfirmReset(false)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset to Defaults?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This will discard your draft and reset the live storefront to the original default theme. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmReset(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleReset} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Reset & Publish Defaults</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Image uploader helper
// ============================================
function ImageUploader({ label, value, onChange, toast }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PNG, JPEG, WebP, and SVG files are allowed');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be under 2 MB');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadThemeAsset(file);
      onChange(url);
      toast.success(`${label} uploaded!`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally { setUploading(false); }
  };

  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</label>
      <div className="flex items-start gap-3">
        <div
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-brand-ring transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : value ? (
            <img src={value} alt={label} className="w-full h-full object-contain" />
          ) : (
            <Upload className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input className="admin-input text-xs" placeholder="https://..." value={value || ''} onChange={e => onChange(e.target.value)} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-xs font-medium text-brand hover:underline">
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
          <span className="text-[10px] text-slate-400 ml-2">PNG, JPG, WebP, SVG · Max 2 MB</span>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ============================================
// Color picker helper
// ============================================
function ColorInput({ label, value, onChange }) {
  const [hex, setHex] = useState(value || '');

  useEffect(() => { setHex(value || ''); }, [value]);

  const handleHexChange = (v) => {
    setHex(v);
    if (HEX_REGEX.test(v)) onChange(v);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#000000'} onChange={e => { onChange(e.target.value); setHex(e.target.value); }}
          className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200 p-0.5" />
        <input className={`admin-input font-mono text-xs flex-1 ${!HEX_REGEX.test(hex) && hex ? 'border-red-300 focus:border-red-500' : ''}`}
          value={hex} onChange={e => handleHexChange(e.target.value)} placeholder="#1B5E20" maxLength={7} />
        {value && (
          <div className="h-8 w-8 rounded-lg border border-slate-200" style={{ background: value }} title={value} />
        )}
      </div>
      {!HEX_REGEX.test(hex) && hex && <p className="text-[10px] text-red-500 mt-1">Invalid hex color</p>}
    </div>
  );
}

// ============================================
// Section: Branding
// ============================================
function BrandingSection({ theme, update, toast }) {
  return (
    <div className="space-y-5 max-w-lg">
      <h3 className="text-base font-bold text-slate-900 mb-1">Branding</h3>
      <p className="text-xs text-slate-500 mb-4">Set your site name, logo, and favicon.</p>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Site Name *</label>
        <input className="admin-input" value={theme.site_name || ''} onChange={e => update('site_name', e.target.value)} placeholder="TrustLink" />
      </div>
      <ImageUploader label="Logo" value={theme.logo_url} onChange={v => update('logo_url', v)} toast={toast} />
      <ImageUploader label="Favicon" value={theme.favicon_url} onChange={v => update('favicon_url', v)} toast={toast} />
    </div>
  );
}

// ============================================
// Section: Colors
// ============================================
function ColorsSection({ theme, update }) {
  return (
    <div className="max-w-lg">
      <h3 className="text-base font-bold text-slate-900 mb-1">Colors</h3>
      <p className="text-xs text-slate-500 mb-4">Choose your brand colors. These apply across the entire storefront.</p>
      <div className="space-y-5">
        <ColorInput label="Primary Color" value={theme.primary_color} onChange={v => update('primary_color', v)} />
        <ColorInput label="Secondary Color" value={theme.secondary_color} onChange={v => update('secondary_color', v)} />
        <ColorInput label="Accent Color" value={theme.accent_color} onChange={v => update('accent_color', v)} />
      </div>
      {/* Live preview */}
      <div className="mt-6 rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-500 mb-3">Preview</div>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg" style={{ background: theme.primary_color }} />
          <div className="h-10 w-10 rounded-lg" style={{ background: theme.secondary_color }} />
          <div className="h-10 w-10 rounded-lg" style={{ background: theme.accent_color }} />
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg px-4 py-2 text-xs font-semibold text-white" style={{ background: theme.primary_color }}>Primary Button</button>
          <button className="rounded-lg px-4 py-2 text-xs font-semibold text-white" style={{ background: theme.secondary_color }}>Secondary</button>
          <button className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-900" style={{ background: theme.accent_color }}>Accent</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section: Typography
// ============================================
function TypographySection({ theme, update }) {
  return (
    <div className="max-w-lg">
      <h3 className="text-base font-bold text-slate-900 mb-1">Typography</h3>
      <p className="text-xs text-slate-500 mb-4">Select the font family for the storefront.</p>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Font Family</label>
        <select className="admin-input admin-select" value={theme.font_family || 'Plus Jakarta Sans'} onChange={e => update('font_family', e.target.value)}>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-500 mb-3">Preview</div>
        <div style={{ fontFamily: `'${theme.font_family}', sans-serif` }}>
          <div className="text-2xl font-bold text-slate-900 mb-1">The quick brown fox</div>
          <div className="text-lg font-semibold text-slate-700 mb-1">jumps over the lazy dog</div>
          <div className="text-sm text-slate-500">0123456789 — Ghana's most trusted marketplace</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section: Banner
// ============================================
function BannerSection({ theme, update, toast }) {
  return (
    <div className="max-w-lg">
      <h3 className="text-base font-bold text-slate-900 mb-1">Homepage Banner</h3>
      <p className="text-xs text-slate-500 mb-4">Customize the hero banner that buyers see first.</p>
      <div className="space-y-4">
        <ImageUploader label="Banner Image" value={theme.banner_image} onChange={v => update('banner_image', v)} toast={toast} />
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Heading</label>
          <input className="admin-input" value={theme.banner_heading || ''} onChange={e => update('banner_heading', e.target.value)} placeholder="Up to 40% Off..." />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Subtext</label>
          <textarea className="admin-input" rows={2} value={theme.banner_subtext || ''} onChange={e => update('banner_subtext', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Button Text</label>
            <input className="admin-input" value={theme.banner_button_text || ''} onChange={e => update('banner_button_text', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Button Link</label>
            <input className="admin-input" value={theme.banner_button_link || ''} onChange={e => update('banner_button_link', e.target.value)} placeholder="#/products" />
          </div>
        </div>
      </div>
      {/* Banner preview */}
      <div className="mt-6 rounded-xl border border-slate-200 overflow-hidden">
        <div className="text-xs font-semibold text-slate-500 px-4 pt-3 mb-2">Preview</div>
        <div className="relative px-4 pb-4">
          <div className="rounded-xl p-6 text-white" style={{
            background: theme.banner_image
              ? `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${theme.banner_image}) center/cover`
              : `linear-gradient(135deg, ${theme.primary_color || '#1B5E20'}, ${theme.secondary_color || '#4CAF50'})`
          }}>
            <div className="text-lg font-bold mb-1">{theme.banner_heading || 'Banner Heading'}</div>
            <div className="text-xs opacity-80 mb-3">{theme.banner_subtext || 'Banner subtext'}</div>
            {theme.banner_button_text && (
              <span className="inline-block rounded-lg px-4 py-1.5 text-xs font-semibold" style={{ background: theme.accent_color || '#FFB300', color: '#111' }}>
                {theme.banner_button_text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section: Footer
// ============================================
function FooterSection({ theme, update, updateNested }) {
  const links = Array.isArray(theme.footer_links) ? theme.footer_links : [];
  const social = theme.social_links || {};

  const addLink = () => {
    update('footer_links', [...links, { label: '', url: '' }]);
  };

  const removeLink = (index) => {
    update('footer_links', links.filter((_, i) => i !== index));
  };

  const updateLink = (index, field, value) => {
    const updated = links.map((l, i) => i === index ? { ...l, [field]: value } : l);
    update('footer_links', updated);
  };

  return (
    <div className="max-w-lg">
      <h3 className="text-base font-bold text-slate-900 mb-1">Footer</h3>
      <p className="text-xs text-slate-500 mb-4">Customize the footer text, links, and social media.</p>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Footer Description</label>
          <textarea className="admin-input" rows={3} value={theme.footer_text || ''}
            onChange={e => update('footer_text', e.target.value)} />
        </div>

        {/* Quick links */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600">Quick Links</label>
            <button type="button" onClick={addLink} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
              <Plus className="w-3 h-3" /> Add Link
            </button>
          </div>
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className="admin-input flex-1 text-xs" placeholder="Label" value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} />
                <input className="admin-input flex-1 text-xs" placeholder="URL (#/products)" value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} />
                <button type="button" onClick={() => removeLink(i)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Social links */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Social Links</label>
          <div className="space-y-2">
            {['facebook', 'twitter', 'instagram', 'youtube', 'whatsapp'].map(platform => (
              <div key={platform} className="flex items-center gap-2">
                <span className="w-20 text-xs font-medium text-slate-500 capitalize">{platform}</span>
                <input className="admin-input flex-1 text-xs" placeholder={`https://${platform}.com/...`}
                  value={social[platform] || ''} onChange={e => updateNested('social_links', platform, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
