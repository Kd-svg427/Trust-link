// ============================================
// TrustLink — Theme Loader
// Fetches published theme from Supabase and
// applies colors, fonts, logo, favicon live.
// ============================================

const ThemeLoader = {
  defaults: {
    site_name: 'TrustLink',
    logo_url: '',
    favicon_url: '',
    primary_color: '#1B5E20',
    secondary_color: '#4CAF50',
    accent_color: '#FFB300',
    font_family: 'Plus Jakarta Sans',
    banner_image: '',
    banner_heading: 'Up to 40% Off Tech & Home Essentials',
    banner_subtext: 'Accra verified vendors · MoMo instant checkout · Escrow protected',
    banner_button_text: 'Shop Deals →',
    banner_button_link: '#/products',
    footer_text: "Ghana's most trusted e-commerce marketplace. Shop from verified vendors with confidence.",
    footer_links: [
      { label: 'Home', url: '#/' },
      { label: 'All Products', url: '#/products' },
      { label: 'Cart', url: '#/cart' },
      { label: 'Login / Register', url: '#/login' },
    ],
    social_links: { facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: '' },
  },

  current: null,

  async load() {
    try {
      if (typeof sb === 'undefined') return this.apply(this.defaults);

      // Check for preview mode: ?preview=draft in hash
      const hash = window.location.hash || '';
      const isPreview = hash.includes('preview=draft');
      const status = isPreview ? 'draft' : 'published';

      const { data, error } = await sb.from('theme_settings')
        .select('*').eq('status', status).maybeSingle();

      if (error) {
        console.warn('ThemeLoader: could not fetch theme settings:', error.message);
        this.apply(this.defaults);
        return;
      }

      this.apply(data || this.defaults);

      if (isPreview) {
        console.log('%c[ThemeLoader] Preview mode — showing draft theme', 'color: #FFB300; font-weight: bold');
      }
    } catch (err) {
      console.warn('ThemeLoader error:', err);
      this.apply(this.defaults);
    }
  },

  apply(theme) {
    this.current = theme;
    window.TrustLinkTheme = theme;

    const root = document.documentElement;

    // ── Colors ──
    if (theme.primary_color) {
      root.style.setProperty('--primary', theme.primary_color);
      root.style.setProperty('--primary-dark', this.darken(theme.primary_color, 25));
    }
    if (theme.secondary_color) {
      root.style.setProperty('--primary-light', theme.secondary_color);
      root.style.setProperty('--primary-lighter', this.lighten(theme.secondary_color, 20));
    }
    if (theme.accent_color) {
      root.style.setProperty('--gold', theme.accent_color);
      root.style.setProperty('--gold-light', this.lighten(theme.accent_color, 15));
      root.style.setProperty('--gold-dark', this.darken(theme.accent_color, 15));
    }

    // Glow shadows based on new colors
    if (theme.secondary_color) {
      root.style.setProperty('--shadow-glow-green', `0 0 20px ${theme.secondary_color}4D`);
    }
    if (theme.accent_color) {
      root.style.setProperty('--shadow-glow-gold', `0 0 20px ${theme.accent_color}4D`);
    }

    // ── Typography ──
    if (theme.font_family) {
      // Font family lands in a CSS value and a Google Fonts URL — restrict
      // it to safe characters (letters, digits, spaces, hyphens).
      const fontFamily = String(theme.font_family).replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 60);
      if (fontFamily) {
        const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800&display=swap`;
        // Load font if not already loaded
        if (!document.querySelector(`link[href*="${encodeURIComponent(fontFamily)}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = fontUrl;
          document.head.appendChild(link);
        }
        document.body.style.fontFamily = `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      }
    }

    // ── Favicon ──
    if (theme.favicon_url && safeUrl(theme.favicon_url)) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = safeUrl(theme.favicon_url);
    }

    // ── Site title ──
    if (theme.site_name) {
      document.title = theme.site_name;
    }
  },

  // Apply theme data to the header (called after header is rendered)
  applyHeader() {
    const theme = this.current;
    if (!theme) return;

    // Update logo
    if (safeUrl(theme.logo_url)) {
      const logoImgs = document.querySelectorAll('#navbar-logo img, .drawer-header img');
      logoImgs.forEach(img => { img.src = safeUrl(theme.logo_url); });
    }
    // Update site name in navbar
    if (theme.site_name) {
      const logoText = document.querySelector('#navbar-logo span');
      if (logoText) logoText.textContent = theme.site_name;
      const drawerText = document.querySelector('.drawer-header span');
      if (drawerText) drawerText.textContent = theme.site_name;
    }
  },

  // Apply theme data to the footer (called after footer is rendered)
  applyFooter() {
    const theme = this.current;
    if (!theme) return;
    const footer = document.getElementById('app-footer');
    if (!footer) return;

    // Update logo
    if (safeUrl(theme.logo_url)) {
      const logoImg = footer.querySelector('.footer-brand img');
      if (logoImg) logoImg.src = safeUrl(theme.logo_url);
    }

    // Update site name in footer
    if (theme.site_name) {
      const brandName = footer.querySelector('.footer-brand span');
      if (brandName) brandName.textContent = theme.site_name;
    }

    // Update description
    if (theme.footer_text) {
      const desc = footer.querySelector('.footer-brand > p');
      if (desc) desc.textContent = theme.footer_text;
    }

    // Update social links
    const social = theme.social_links || {};
    const socialContainer = footer.querySelector('.footer-social');
    if (socialContainer) {
      const socialLinks = socialContainer.querySelectorAll('a');
      const platforms = ['facebook', 'twitter', 'instagram', 'youtube'];
      socialLinks.forEach((a, i) => {
        const platform = platforms[i];
        if (platform && social[platform] && safeUrl(social[platform])) {
          a.href = safeUrl(social[platform]);
          a.target = '_blank';
          a.rel = 'noopener';
        }
      });
    }

    // Update footer bottom text
    if (theme.site_name) {
      const bottomP = footer.querySelector('.footer-bottom p');
      if (bottomP) {
        bottomP.textContent = `© ${new Date().getFullYear()} ${theme.site_name} Ghana. Bank of Ghana compliant escrow infrastructure.`;
      }
    }
  },

  // Apply theme to the homepage banner (called after home page is rendered)
  applyBanner() {
    const theme = this.current;
    if (!theme) return;

    const promo = document.querySelector('.promo-card');
    if (!promo) return;

    // Update banner background image
    if (safeUrl(theme.banner_image)) {
      const cssUrl = safeUrl(theme.banner_image).replace(/["'\\]/g, '');
      promo.style.backgroundImage = `linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.25)), url("${cssUrl}")`;
      promo.style.backgroundSize = 'cover';
      promo.style.backgroundPosition = 'center';
    }

    // Update heading
    if (theme.banner_heading) {
      const h2 = promo.querySelector('h2');
      if (h2) h2.textContent = theme.banner_heading;
    }

    // Update subtext
    if (theme.banner_subtext) {
      const p = promo.querySelector('p');
      if (p) p.textContent = theme.banner_subtext;
    }

    // Update button
    if (theme.banner_button_text) {
      const btn = promo.querySelector('.btn');
      if (btn) {
        btn.textContent = theme.banner_button_text;
        if (theme.banner_button_link && safeUrl(theme.banner_button_link)) {
          btn.href = safeUrl(theme.banner_button_link);
        }
      }
    }
  },

  // Color helpers
  darken(hex, percent) {
    return this.adjustBrightness(hex, -percent);
  },

  lighten(hex, percent) {
    return this.adjustBrightness(hex, percent);
  },

  adjustBrightness(hex, percent) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + Math.round(2.55 * percent);
    let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
    let b = (num & 0x0000FF) + Math.round(2.55 * percent);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
};
