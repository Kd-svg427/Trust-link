// ============================================
// TrustLink — Footer Component
// ============================================

function renderFooter() {
  return `
    <footer class="footer" id="app-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
            <img src="icons/icon-192.png" alt="TrustLink" width="32" height="32" style="border-radius:6px">
            <span style="font-size:1.25rem;font-weight:800;background:linear-gradient(135deg,var(--primary-light),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent">TrustLink</span>
          </div>
          <p>Ghana's most trusted e-commerce marketplace. Shop from verified vendors with confidence. Fast delivery, secure payments, and quality guaranteed.</p>
          <div class="footer-social" style="margin-top:1rem">
            <a href="#" aria-label="Facebook"><i data-lucide="facebook" class="w-4 h-4"></i></a>
            <a href="#" aria-label="Twitter"><i data-lucide="twitter" class="w-4 h-4"></i></a>
            <a href="#" aria-label="Instagram"><i data-lucide="instagram" class="w-4 h-4"></i></a>
            <a href="#" aria-label="YouTube"><i data-lucide="youtube" class="w-4 h-4"></i></a>
          </div>
        </div>

        <div>
          <h4 class="footer-heading">Quick Links</h4>
          <ul class="footer-links">
            <li><a href="#/">Home</a></li>
            <li><a href="#/products">All Products</a></li>
            <li><a href="#/cart">Cart</a></li>
            <li><a href="#/login">Login / Register</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Categories</h4>
          <ul class="footer-links" id="footer-categories">
            <li><a href="#/products?category=electronics">Electronics</a></li>
            <li><a href="#/products?category=fashion">Fashion</a></li>
            <li><a href="#/products?category=beauty-health">Beauty & Health</a></li>
            <li><a href="#/products?category=phones-tablets">Phones & Tablets</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Newsletter</h4>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem">Get the latest deals and new arrivals straight to your inbox.</p>
          <form id="newsletter-form" style="display:flex;gap:0.5rem">
            <input type="email" class="form-input" placeholder="Your email" id="newsletter-email" required style="flex:1;padding:0.625rem 0.75rem;font-size:0.85rem">
            <button type="submit" class="btn btn-primary btn-sm">
              <i data-lucide="send" class="w-4 h-4"></i>
            </button>
          </form>
          <div id="newsletter-msg" style="margin-top:0.5rem;font-size:0.8rem"></div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} TrustLink. All rights reserved. Made with ❤️ in Ghana 🇬🇭</p>
        <div style="display:flex;gap:1.5rem;font-size:0.8rem">
          <a href="#" style="color:var(--text-muted)">Privacy Policy</a>
          <a href="#" style="color:var(--text-muted)">Terms of Service</a>
          <a href="#" style="color:var(--text-muted)">Contact Us</a>
        </div>
      </div>
    </footer>
  `;
}

function initFooter() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const msgDiv = document.getElementById('newsletter-msg');
      const email = emailInput.value.trim();
      if (!email) return;

      try {
        await Newsletter.subscribe(email);
        msgDiv.innerHTML = '<span style="color:var(--success)">✓ Subscribed successfully!</span>';
        emailInput.value = '';
        Toast.success('Welcome to our newsletter!');
      } catch (err) {
        msgDiv.innerHTML = `<span style="color:var(--error)">${sanitize(err.message)}</span>`;
      }
    });
  }
}
