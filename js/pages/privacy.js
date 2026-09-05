// ============================================
// TrustLink — Privacy Policy
// ============================================

async function renderPrivacyPage() {
  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="max-width:800px;margin:0 auto">
        <h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem">Privacy Policy</h1>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:2rem">Last updated: 5 September 2026</p>

        <div class="glass-card" style="padding:2rem;line-height:1.7;color:var(--text-secondary)">
          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">1. Overview</h3>
          <p style="margin-bottom:1.5rem">TrustLink operates as a marketplace connecting buyers and verified vendors in Ghana. This policy explains what data we collect, how we use it, and your rights. We do not sell your data.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">2. Data we collect</h3>
          <ul style="margin-bottom:1.5rem;padding-left:1.25rem;list-style:disc">
            <li>Account: name, email, phone, password (hashed)</li>
            <li>Orders: delivery address, city, payment method, order items</li>
            <li>Vendor: store name, logo, MoMo and WhatsApp numbers</li>
            <li>Technical: device, browser, IP, cookies for session and cart (localStorage)</li>
          </ul>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">3. How we use data</h3>
          <p style="margin-bottom:1.5rem">To create and secure accounts, process orders, enable vendor-buyer communication via WhatsApp, improve the service, and comply with Ghanaian law. Payments via MTN MoMo, Vodafone Cash, AirtelTigo Money and cards are processed by your chosen provider; we do not store card numbers.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">4. Storage and sharing</h3>
          <p style="margin-bottom:1.5rem">Data is stored in Supabase (Postgres) with Row Level Security. Vendors see only their orders. Admins see aggregated data for support. We share data only with delivery partners and payment providers as needed to fulfill orders.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">5. Cookies and local storage</h3>
          <p style="margin-bottom:1.5rem">We use essential cookies for authentication and localStorage for the cart (<code>trustlink_cart</code>). No third-party tracking cookies.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">6. Your rights</h3>
          <p style="margin-bottom:1.5rem">You may request access, correction, or deletion of your account by contacting support. You can update your profile in the dashboard. Deletion removes orders only where legally permitted to retain records.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">7. Contact</h3>
          <p>Questions: <a href="mailto:support@trustlink.example" style="color:var(--primary-light)">support@trustlink.example</a> — WhatsApp support available via the footer link.</p>
        </div>
      </div>
    </div>
  `;
}

async function initPrivacyPage() {
  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
