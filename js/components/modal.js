// ============================================
// TrustLink — Modal Component
// ============================================

const Modal = {
  _escHandler: null,

  show(title, bodyHtml, options = {}) {
    const { footerHtml = '', maxWidth = '560px', onClose = null } = options;

    // Remove any existing modal (also detaches its ESC handler)
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:${maxWidth}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${sanitize(title)}</h3>
          <button class="modal-close" aria-label="Close modal">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    if (window.lucide) lucide.createIcons();

    // Close handlers
    overlay.querySelector('.modal-close').addEventListener('click', () => {
      this.close();
      if (onClose) onClose();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
        if (onClose) onClose();
      }
    });

    // ESC key (tracked so close() can always detach it)
    this._escHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        if (onClose) onClose();
      }
    };
    document.addEventListener('keydown', this._escHandler);

    return overlay;
  },

  confirm(title, message, onConfirm, options = {}) {
    const { confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = options;
    const btnClass = danger ? 'btn btn-danger' : 'btn btn-primary';

    this.show(title, `<p style="color:var(--text-secondary)">${sanitize(message)}</p>`, {
      footerHtml: `
        <button class="btn btn-ghost" id="modal-cancel">${sanitize(cancelText)}</button>
        <button class="${btnClass}" id="modal-confirm">${sanitize(confirmText)}</button>
      `,
      onClose: null
    });

    document.getElementById('modal-cancel')?.addEventListener('click', () => this.close());
    document.getElementById('modal-confirm')?.addEventListener('click', () => {
      this.close();
      onConfirm();
    });
  },

  close() {
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  }
};
