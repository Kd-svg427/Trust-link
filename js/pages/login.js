// ============================================
// TrustLink — Login / Register Page
// ============================================

async function renderLoginPage() {
  return `
    <div style="padding-top:80px;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem 1rem">
      <div style="max-width:460px;width:100%">
        <div style="text-align:center;margin-bottom:2rem">
          <img src="icons/icon-192.png" alt="TrustLink" style="width:56px;height:56px;border-radius:var(--radius-md);margin-bottom:1rem">
          <h1 style="font-size:1.75rem;font-weight:900">
            Welcome to TrustLink
          </h1>
          <p style="color:var(--text-secondary);margin-top:0.5rem">Ghana's trusted e-commerce marketplace</p>
        </div>

        <!-- Tab Toggle -->
        <div style="display:flex;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:4px;margin-bottom:1.5rem">
          <button class="auth-tab active" id="tab-login" style="flex:1;padding:0.625rem;border:none;border-radius:var(--radius-sm);font-weight:600;font-size:0.9rem;cursor:pointer;transition:all var(--transition-fast);background:var(--primary);color:white">
            Sign In
          </button>
          <button class="auth-tab" id="tab-register" style="flex:1;padding:0.625rem;border:none;border-radius:var(--radius-sm);font-weight:600;font-size:0.9rem;cursor:pointer;transition:all var(--transition-fast);background:transparent;color:var(--text-secondary)">
            Create Account
          </button>
        </div>

        <!-- Login Form -->
        <div id="login-form-container">
          <form id="login-form" class="glass-card" style="padding:1.5rem">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="login-email" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="login-password" placeholder="Enter password" required>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="login-submit-btn">
              Sign In
            </button>
          </form>
        </div>

        <!-- Register Form (hidden initially) -->
        <div id="register-form-container" style="display:none">
          <form id="register-form" class="glass-card" style="padding:1.5rem">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="register-name" placeholder="Kwame Asante" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="register-email" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" id="register-phone" placeholder="+233 XX XXX XXXX">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="register-password" placeholder="Min 6 characters" required minlength="6">
            </div>
            <div class="form-group">
              <label class="form-label">I want to</label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
                <label class="glass-card role-option selected" style="padding:1rem;cursor:pointer;text-align:center;margin-bottom:0">
                  <input type="radio" name="role" value="buyer" checked style="display:none">
                  <i data-lucide="shopping-bag" class="w-6 h-6" style="color:var(--info);margin-bottom:0.5rem;display:block;margin-left:auto;margin-right:auto"></i>
                  <div style="font-weight:600;font-size:0.9rem">Buy Products</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">Shop & order</div>
                </label>
                <label class="glass-card role-option" style="padding:1rem;cursor:pointer;text-align:center;margin-bottom:0">
                  <input type="radio" name="role" value="vendor" style="display:none">
                  <i data-lucide="store" class="w-6 h-6" style="color:var(--primary-light);margin-bottom:0.5rem;display:block;margin-left:auto;margin-right:auto"></i>
                  <div style="font-weight:600;font-size:0.9rem">Sell Products</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">Open a store</div>
                </label>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="register-submit-btn">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

async function initLoginPage() {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginContainer = document.getElementById('login-form-container');
  const registerContainer = document.getElementById('register-form-container');

  tabLogin?.addEventListener('click', () => {
    tabLogin.style.background = 'var(--primary)'; tabLogin.style.color = 'white';
    tabRegister.style.background = 'transparent'; tabRegister.style.color = 'var(--text-secondary)';
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.style.background = 'var(--primary)'; tabRegister.style.color = 'white';
    tabLogin.style.background = 'transparent'; tabLogin.style.color = 'var(--text-secondary)';
    registerContainer.style.display = 'block';
    loginContainer.style.display = 'none';
  });

  document.querySelectorAll('.role-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.role-option').forEach(o => {
        o.classList.remove('selected');
        o.style.borderColor = '';
      });
      opt.classList.add('selected');
      opt.style.borderColor = 'var(--primary-light)';
    });
  });

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-submit-btn');
    if (!email || !password) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    try {
      await doLogin(email, password);
    } catch (err) {
      Toast.error(err.message);
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
      if (window.lucide) lucide.createIcons();
    }
  });

  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const role = document.querySelector('input[name=role]:checked')?.value || 'buyer';
    const btn = document.getElementById('register-submit-btn');

    if (!name || !email || !password) {
      Toast.warning('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      Toast.warning('Password must be at least 6 characters');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    try {
      const data = await Auth.signUp(email, password, { name, phone, role });

      if (data.user) {
        if (role === 'vendor') {
          try {
            await Vendors.create({
              profile_id: data.user.id,
              store_name: name + "'s Store",
              description: '',
              momo_number: phone,
              whatsapp_number: phone,
              approval_status: 'pending'
            });
          } catch (vendorErr) {
            console.warn('Vendor record creation deferred:', vendorErr);
          }
        }

        await loadUserState(data.user);
        updateHeaderAuth();
        if (role === 'vendor') {
          Toast.success('Store created! You will be approved within 2 hours. Check your vendor dashboard for updates.');
        } else {
          Toast.success('Account created! Welcome to TrustLink!');
        }
        App.navigate(role === 'vendor' ? '/vendor' : '/');
      }
    } catch (err) {
      Toast.error(err.message);
      btn.disabled = false;
      btn.innerHTML = 'Create Account';
      if (window.lucide) lucide.createIcons();
    }
  });

  if (window.lucide) lucide.createIcons();

  // Deep-link: #/register should open the "Create Account" tab
  if ((window.location.hash || '').includes('/register')) {
    tabRegister?.click();
  }
}

async function doLogin(email, password) {
  const data = await Auth.signIn(email, password);
  if (data.user) {
    await loadUserState(data.user);
    updateHeaderAuth();
    const profile = App.getState().profile;

    Toast.success(`Welcome back, ${profile?.name || 'User'}!`);
    if (profile?.role === 'vendor') App.navigate('/vendor');
    else if (profile?.role === 'admin') App.navigate('/admin');
    else App.navigate('/');
  }
}

async function loadUserState(user) {
  try {
    const profile = await Profiles.get(user.id);
    let vendor = null;
    if (profile?.role === 'vendor') {
      vendor = await Vendors.getByProfileId(user.id);
    }
    App.setState({ session: user, user, profile, vendor });
  } catch (err) {
    console.error('Failed to load user state:', err);
  }
}
