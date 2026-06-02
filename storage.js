// storage.js — Pure localStorage operations. No DOM access.

const QUOTES_KEY = 'perry_tiling_quotes';
const DRAFT_KEY = 'perry_tiling_draft';

function generateId() {
    return crypto.randomUUID? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function loadQuotes() {
    try {
        const data = localStorage.getItem(QUOTES_KEY);
        return data? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load quotes:', e);
        return [];
    }
}

export function saveQuote(quote) {
    try {
        // Safety: ensure every quote has an ID before saving
        if (!quote.id) quote.id = generateId();

        const quotes = loadQuotes();
        const idx = quotes.findIndex(q => String(q.id) === String(quote.id));
        if (idx >= 0) {
            quotes[idx] = quote;
        } else {
            quotes.push(quote);
        }
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
    } catch (e) {
        console.error('Failed to save quote:', e);
        throw new Error('Storage full. Delete old quotes to save.');
    }
}

export function deleteQuote(id) {
    try {
        const quotes = loadQuotes();
        const filtered = quotes.filter(q => String(q.id)!== String(id));
        localStorage.setItem(QUOTES_KEY, JSON.stringify(filtered));
    } catch (e) {
        console.error('Failed to delete quote:', e);
        throw new Error('Failed to delete quote.');
    }
}

export function updateQuoteStatus(id, status) {
    try {
        const quotes = loadQuotes();
        const quote = quotes.find(q => String(q.id) === String(id));
        if (quote) {
            quote.status = status;
            localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        }
    } catch (e) {
        console.error('Failed to update status:', e);
    }
}

export function saveDraft(rooms, form) {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ rooms, form }));
    } catch (e) {
        console.error('Failed to save draft:', e);
    }
}

export function loadDraft() {
    try {
        const data = localStorage.getItem(DRAFT_KEY);
        return data? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to load draft:', e);
        return null;
    }
}

export function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
        console.error('Failed to clear draft:', e);
    }
}

export function storageQuotaWarning() {
    try {
        const test = 'x'.repeat(1024 * 1024); // 1MB test
        localStorage.setItem('__test', test);
        localStorage.removeItem('__test');
        return false;
    } catch {
        return true;
    }
}