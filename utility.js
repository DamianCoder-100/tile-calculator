// utility.js — Helper functions

export function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;');
}

export function formatMoney(amount) {
    const num = Math.round(parseFloat(amount) || 0);
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatMoneyDetailed(amount) {
    const num = parseFloat(amount) || 0;
    return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function showToast(msg, duration = 2000) {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-bg-dark border-0 show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${escapeHtml(msg)}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}