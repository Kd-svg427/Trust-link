// ============================================
// TrustLink — Toast Notification System
// ============================================

const Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.id = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = 4000) {
    this.init();
    // Accept both show(msg, 6000) and show(msg, { duration: 6000 })
    if (duration && typeof duration === 'object') duration = duration.duration;
    if (typeof duration !== 'number' || Number.isNaN(duration)) duration = 4000;
    const icons = {
      success: '<i data-lucide="check-circle" class="w-5 h-5" style="color:var(--success)"></i>',
      error: '<i data-lucide="x-circle" class="w-5 h-5" style="color:var(--error)"></i>',
      warning: '<i data-lucide="alert-triangle" class="w-5 h-5" style="color:var(--warning)"></i>',
      info: '<i data-lucide="info" class="w-5 h-5" style="color:var(--info)"></i>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${this.sanitize(message)}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    this.container.appendChild(toast);

    // Re-render Lucide icons
    if (window.lucide) lucide.createIcons();

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => this.dismiss(toast));

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  },

  dismiss(toast) {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  },

  success(msg, dur) { return this.show(msg, 'success', dur); },
  error(msg, dur) { return this.show(msg, 'error', dur); },
  warning(msg, dur) { return this.show(msg, 'warning', dur); },
  info(msg, dur) { return this.show(msg, 'info', dur); },

  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
