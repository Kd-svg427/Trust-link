// ============================================
// TrustLink — Terms and Conditions
// ============================================

async function renderTermsPage() {
  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="max-width:800px;margin:0 auto">
        <h1 style="font-size:2rem;font-weight:800;margin-bottom:0.5rem">Terms and Conditions</h1>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:2rem">Last updated: 5 September 2026</p>

        <div class="glass-card" style="padding:2rem;line-height:1.7;color:var(--text-secondary)">
          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">1. Agreement</h3>
          <p style="margin-bottom:1.5rem">By creating an account or placing an order on TrustLink you agree to these terms and Ghanaian law. If you do not agree, do not use the service.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">2. Accounts</h3>
          <p style="margin-bottom:1.5rem">You must provide accurate information and keep your password secure. Buyer, vendor and admin roles have different permissions enforced by database policies. Vendors must provide a valid MoMo/WhatsApp number and are responsible for their store information.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">3. Vendor approval</h3>
          <p style="margin-bottom:1.5rem">Vendors are reviewed before listing. Approval does not guarantee sales. Vendors may not list counterfeit, illegal or misrepresented products. TrustLink may suspend stores that violate policy.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">4. Orders, payments and pricing</h3>
          <p style="margin-bottom:1.5rem">Prices are set by vendors in Ghanaian Cedis and include stock limits. Orders are confirmed on payment via MoMo, Vodafone Cash, AirtelTigo Money or card. Payment status is tracked as pending, paid, failed or refunded. TrustLink is not the seller of record; vendors fulfill orders.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">5. Delivery and returns</h3>
          <p style="margin-bottom:1.5rem">Delivery times and fees are set per vendor and shown at checkout. Buyers should inspect goods on receipt. Returns are handled directly with the vendor according to their stated policy, within 7 days for defective items.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">6. Reviews</h3>
          <p style="margin-bottom:1.5rem">Reviews must be based on verified purchases and be truthful. TrustLink may remove reviews that are abusive or fraudulent.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">7. Limitation of liability</h3>
          <p style="margin-bottom:1.5rem">TrustLink provides the platform as is. We are not liable for vendor product quality, delivery delays, or payment provider outages, except as required by law.</p>

          <h3 style="font-weight:700;color:var(--text-primary);margin-bottom:0.75rem">8. Contact and governing law</h3>
          <p>These terms are governed by the laws of Ghana. Contact: <a href="mailto:support@trustlink.example" style="color:var(--primary-light)">support@trustlink.example</a>.</p>
        </div>
      </div>
    </div>
  `;
}

async function initTermsPage() {
  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
