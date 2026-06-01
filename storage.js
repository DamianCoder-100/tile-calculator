// storage.js — localStorage wrapper. No DOM access.

export const STORAGE_KEY = 'perryQuotes_v3';
export const DRAFT_KEY = 'perryDraft_v3';
export const MAX_QUOTES = 15;

export function storageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

export function storageQuotaWarning() {
    if (!storageAvailable()) return false;
    try {
        const quotes = localStorage.getItem(STORAGE_KEY) || '';
        const draft = localStorage.getItem(DRAFT_KEY) || '';
        const used = quotes.length + draft.length;
        const estimate = 5 * 1024 * 1024;
        return used > estimate * 0.8;
    } catch {
        return false;
    }
}

export function saveDraft(rooms, formData) {
    if (!storageAvailable()) return;
    const draft = { rooms, form: formData };
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
        console.error('Draft save failed:', e);
        if (e.name === 'QuotaExceededError') {
            throw new Error('Storage full. Clear some old quotes.');
        }
        throw new Error('Draft save failed');
    }
}

export function loadDraft() {
    if (!storageAvailable()) return null;
    try {
        const draftRaw = localStorage.getItem(DRAFT_KEY);
        return draftRaw? JSON.parse(draftRaw) : null;
    } catch (e) {
        console.error('Draft load failed, clearing corrupt data:', e);
        localStorage.removeItem(DRAFT_KEY);
        return null;
    }
}

export function clearDraft() {
    if (storageAvailable()) {
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch (e) {
            console.error('Clear draft failed:', e);
        }
    }
}

function getQuotesSafe() {
    if (!storageAvailable()) return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Quotes corrupt, resetting:', e);
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
}

export function saveQuote(quote) {
    if (!storageAvailable()) throw new Error('Storage unavailable');

    let quotes = getQuotesSafe();
    quotes.unshift(quote);
    quotes = quotes.slice(0, MAX_QUOTES);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
        clearDraft();
    } catch (e) {
        console.error('Quote save failed:', e);
        if (e.name === 'QuotaExceededError') {
            throw new Error('Storage full. Delete old quotes first.');
        }
        throw new Error('Quote save failed');
    }
}

export function loadQuotes() {
    return getQuotesSafe();
}

export function deleteQuote(id) {
    if (!storageAvailable()) return;
    let quotes = getQuotesSafe();
    quotes = quotes.filter(q => q.id!== id);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
        console.error('Delete failed:', e);
    }
}

export function updateQuoteStatus(id, status) {
    if (!storageAvailable()) return;
    let quotes = getQuotesSafe();
    const quote = quotes.find(q => q.id == id);
    if (quote) {
        quote.status = status;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
        } catch (e) {
            console.error('Status update failed:', e);
        }
    }
}