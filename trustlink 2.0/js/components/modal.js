// ============================================
// TrustLink — Modal Component
// ============================================

const Modal = {
  show(title, bodyHtml, options = {}) {
    const { footerHtml = '', maxWidth = '560px', onClose = null } = options;

    // Remove any existing modal
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:${maxWidth}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
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

    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        if (onClose) onClose();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return overlay;
  },

  confirm(title, message, onConfirm, options = {}) {
    const { confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = options;
    const btnClass = danger ? 'btn btn-danger' : 'btn btn-primary';

    this.show(title, `<p style="color:var(--text-secondary)">${message}</p>`, {
      footerHtml: `
        <button class="btn btn-ghost" id="modal-cancel">${cancelText}</button>
        <button class="${btnClass}" id="modal-confirm">${confirmText}</button>
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
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  }
};
