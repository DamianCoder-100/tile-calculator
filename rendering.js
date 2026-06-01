// rendering.js — Main app. Handles DOM, events, state.

import * as calc from './calculator.js';
import * as storage from './storage.js';
import * as ui from './utility.js';

let rooms = [];
let currentQuoteId = null;
let roomIdCounter = 0;
let quoteToDeleteId = null;

const els = {
    roomsContainer: document.getElementById('roomsContainer'),
    quoteForm: document.getElementById('quoteForm'),
    laborMethod: document.getElementById('laborMethod'),
    laborRateSqft: document.getElementById('laborRateSqft'),
    laborRateRoom: document.getElementById('laborRateRoom'),
    laborFixed: document.getElementById('laborFixed'),
    patternMultiplier: document.getElementById('patternMultiplier'),
    tilePriceSqft: document.getElementById('tilePriceSqft'),
    mortarPrice: document.getElementById('mortarPrice'),
    groutPrice: document.getElementById('groutPrice'),
    tileSize: document.getElementById('tileSize'),
    groutJoint: document.getElementById('groutJoint'),
    trowelSize: document.getElementById('trowelSize'),
    tileBoxCoverage: document.getElementById('tileBoxCoverage'),
    subtractSqft: document.getElementById('subtractSqft'),
    waste: document.getElementById('waste'),
    profitMargin: document.getElementById('profitMargin'),
    taxRate: document.getElementById('taxRate'),
    materialList: document.getElementById('materialList'),
    customerName: document.getElementById('customerName'),
    customerPhone: document.getElementById('customerPhone'),
    customerAddress: document.getElementById('customerAddress'),
    notes: document.getElementById('notes'),
    mortarType: document.getElementById('mortarType')
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    loadDraftState();
    bindEvents();
    updateDisplay();
    checkStorageWarning();
    els.laborMethod.dispatchEvent(new Event('change'));
    els.mortarType.dispatchEvent(new Event('change'));
    renderSavedQuotes();
}

function bindEvents() {
    els.quoteForm.addEventListener('input', handleFormChange);
    els.laborMethod.addEventListener('change', updateLaborDisplay);
    els.patternMultiplier.addEventListener('change', updateDisplay);
    els.mortarType.addEventListener('change', updateMortarDisplay);

    document.getElementById('saveQuoteBtn').addEventListener('click', saveQuote);
    document.getElementById('clearBtn').addEventListener('click', (e) => {
        e.preventDefault();
    });
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    document.getElementById('textQuoteBtn').addEventListener('click', textQuote);

    document.body.addEventListener('click', e => {
        const addRoomBtn = e.target.closest('[data-room-type]');
        if (addRoomBtn) {
            e.preventDefault();
            addRoom(addRoomBtn.dataset.roomType);
        }
    });

    els.roomsContainer.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.room-delete');
        if (deleteBtn) {
            const roomEl = deleteBtn.closest('.room-item');
            deleteRoom(parseInt(roomEl.dataset.roomId));
        }
    });

    els.roomsContainer.addEventListener('input', e => {
        const input = e.target;
        if (input.matches('.room-name,.room-dimension')) {
            const roomEl = input.closest('.room-item');
            const id = parseInt(roomEl.dataset.roomId);
            const field = input.dataset.field;
            updateRoom(id, field, input.value);
        }
    });

    document.getElementById('savedQuotes').addEventListener('click', e => {
        const quoteEl = e.target.closest('.saved-quote');
        if (!quoteEl) return;
        const deleteBtn = e.target.closest('.delete-quote');
        const statusBadge = e.target.closest('.badge');
        if (deleteBtn) {
            e.stopPropagation();
            deleteQuote(parseInt(quoteEl.dataset.quoteId));
        } else if (statusBadge) {
            e.stopPropagation();
            cycleQuoteStatus(parseInt(quoteEl.dataset.quoteId));
        } else {
            loadQuote(parseInt(quoteEl.dataset.quoteId));
        }
    });
}

function updateLaborDisplay() {
    const method = els.laborMethod.value;
    document.getElementById('laborRateSqftSection').style.display = method === 'sqft'? 'block' : 'none';
    document.getElementById('laborRateRoomSection').style.display = method === 'room'? 'block' : 'none';
    document.getElementById('laborFixedSection').style.display = method === 'fixed'? 'block' : 'none';
    updateDisplay();
}

function updateMortarDisplay() {
    const type = els.mortarType.value;
    document.getElementById('trowelSection').style.display = type === 'thinset'? 'block' : 'none';
    document.getElementById('cementSection').style.display = type === 'cement'? 'block' : 'none';
    document.getElementById('mortarLabel').textContent = type === 'thinset'? 'Thinset Bags' : 'Cement Bags';
    updateDisplay();
}

function handleFormChange() {
    debounceSaveDraft();
    updateDisplay();
}

let draftTimer = null;
function debounceSaveDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraftState, 500);
}

function saveDraftState() {
    const formData = getFormData();
    storage.saveDraft(rooms, formData);
}

function loadDraftState() {
    const draft = storage.loadDraft();
    if (draft) {
        rooms = draft.rooms || [];
        roomIdCounter = rooms.length > 0? Math.max(...rooms.map(r => r.id)) + 1 : 0;
        setFormData(draft.form || {});
        ui.renderRooms(els.roomsContainer, rooms);
    }
}

function checkStorageWarning() {
    if (storage.storageQuotaWarning()) {
        ui.showToast('Storage almost full. Delete old quotes to avoid issues.', 4000);
    }
}

function getFormData() {
    return {
        customerName: els.customerName.value,
        customerPhone: els.customerPhone.value,
        customerAddress: els.customerAddress.value,
        notes: els.notes.value,
        tileSize: els.tileSize.value,
        tileBoxCoverage: parseFloat(els.tileBoxCoverage.value) || 10,
        groutJoint: parseFloat(els.groutJoint.value) || 0.125,
        subtractSqft: parseFloat(els.subtractSqft.value) || 0,
        waste: parseFloat(els.waste.value) || 10,
        patternMultiplier: parseFloat(els.patternMultiplier.value) || 1,
        laborMethod: els.laborMethod.value,
        laborRateSqft: parseFloat(els.laborRateSqft.value) || 0,
        laborRateRoom: parseFloat(els.laborRateRoom.value) || 0,
        laborFixed: parseFloat(els.laborFixed.value) || 0,
        mortarType: els.mortarType.value,
        trowelCoverage: parseFloat(els.trowelSize.value) || 60,
        tilePriceSqft: parseFloat(els.tilePriceSqft.value) || 0,
        mortarPrice: parseFloat(els.mortarPrice.value) || 0,
        groutPrice: parseFloat(els.groutPrice.value) || 0,
        profitMargin: parseFloat(els.profitMargin.value) || 0,
        taxRate: parseFloat(els.taxRate.value) || 0
    };
}

function setFormData(data) {
    els.customerName.value = data.customerName || '';
    els.customerPhone.value = data.customerPhone || '';
    els.customerAddress.value = data.customerAddress || '';
    els.notes.value = data.notes || '';
    els.tileSize.value = data.tileSize || '12x12';
    els.tileBoxCoverage.value = data.tileBoxCoverage || 10;
    els.groutJoint.value = data.groutJoint || 0.125;
    els.subtractSqft.value = data.subtractSqft || 0;
    els.waste.value = data.waste || 10;
    els.patternMultiplier.value = data.patternMultiplier || 1;
    els.laborMethod.value = data.laborMethod || 'sqft';
    els.laborRateSqft.value = data.laborRateSqft || 10;
    els.laborRateRoom.value = data.laborRateRoom || 500;
    els.laborFixed.value = data.laborFixed || 1500;
    els.mortarType.value = data.mortarType || 'thinset';
    els.trowelSize.value = data.trowelCoverage || 60;
    els.tilePriceSqft.value = data.tilePriceSqft || 0;
    els.mortarPrice.value = data.mortarPrice || 0;
    els.groutPrice.value = data.groutPrice || 0;
    els.profitMargin.value = data.profitMargin || 0;
    els.taxRate.value = data.taxRate || 0;
}

function addRoom(type) {
    rooms.push({
        id: roomIdCounter++,
        type,
        name: '',
        length: '',
        width: '',
        height: type === 'bathroom-wall'? '8' : ''
    });
    ui.renderRooms(els.roomsContainer, rooms);
    updateDisplay();
    saveDraftState();
}

function deleteRoom(id) {
    rooms = rooms.filter(r => r.id!== id);
    ui.renderRooms(els.roomsContainer, rooms);
    updateDisplay();
    saveDraftState();
}

function updateRoom(id, field, value) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        room[field] = value;
        updateDisplay();
        debounceSaveDraft();
    }
}

function updateDisplay() {
    const config = getFormData();
    const tile = calc.parseTileSize(config.tileSize);

    if (!tile) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('emptyState').textContent = 'Enter valid tile size like 12x12';
        return;
    }
    config.tile = tile;

    if (rooms.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('emptyState').textContent = 'Add rooms to calculate';
        document.getElementById('sqftOut').textContent = '0';
        document.getElementById('boxesOut').textContent = '0';
        document.getElementById('mortarOut').textContent = '0';
        document.getElementById('groutOut').textContent = '0';
        document.getElementById('totalTilesOut').textContent = '0 tiles';
        document.getElementById('laborCostOut').textContent = '$0.00';
        document.getElementById('totalProjectOut').textContent = '$0.00';
        els.materialList.innerHTML = '';
        return;
    }

    document.getElementById('emptyState').style.display = 'none';

    const { totalBaseSqft, baseSqft, totalSqft, roomDetails } = calc.calculateRooms(rooms, config);
    const materials = calc.calculateMaterials(totalSqft, config);
    const billableRooms = rooms.filter(r => parseFloat(r.length) > 0 && parseFloat(r.width) > 0).length;
    const costs = calc.calculateCosts(baseSqft, totalSqft, materials, config, billableRooms);

    document.getElementById('sqftOut').textContent = Math.round(totalSqft);
    document.getElementById('boxesOut').textContent = materials.tileBoxes;
    document.getElementById('mortarOut').textContent = materials.mortarBags;
    document.getElementById('groutOut').textContent = materials.groutBags;
    document.getElementById('totalTilesOut').textContent = `${materials.totalTiles.toLocaleString()} tiles`;
    document.getElementById('laborCostOut').textContent = ui.formatMoney(costs.laborCost);

    const hasMaterialPricing = config.tilePriceSqft > 0 || config.mortarPrice > 0 || config.groutPrice > 0;
    document.getElementById('materialCostSection').style.display = hasMaterialPricing? 'block' : 'none';
    document.getElementById('subtotalSection').style.display = hasMaterialPricing? 'block' : 'none';
    document.getElementById('profitSection').style.display = config.profitMargin > 0? 'block' : 'none';
    document.getElementById('taxSection').style.display = config.taxRate > 0? 'block' : 'none';
    document.getElementById('tileNote').style.display = hasMaterialPricing? 'none' : 'block';

    if (hasMaterialPricing) {
        document.getElementById('materialCostOut').textContent = ui.formatMoney(costs.materialCost);
        document.getElementById('subtotalOut').textContent = ui.formatMoney(costs.subtotal);
    }
    if (config.profitMargin > 0) {
        document.getElementById('profitLabel').textContent = `Profit (${config.profitMargin}%)`;
        document.getElementById('profitOut').textContent = ui.formatMoney(costs.profitAmt);
    }
    if (config.taxRate > 0) {
        document.getElementById('taxLabel').textContent = `Tax (${config.taxRate}%)`;
        document.getElementById('taxOut').textContent = ui.formatMoney(costs.taxAmt);
    }

    document.getElementById('totalProjectOut').textContent = ui.formatMoney(costs.grandTotal);

    document.getElementById('roomBreakdown').innerHTML = roomDetails.map(r =>
        `<div class="d-flex justify-content-between small mb-1">
            <span>${ui.escapeHtml(r.name)}</span>
            <span>${Math.round(r.sqft)} sq ft</span>
        </div>`
    ).join('');

    els.materialList.innerHTML = `
        <li class="list-group-item d-flex justify-content-between">
            <span>Tile: ${config.tile.l}"x${config.tile.w}"</span>
            <strong>${materials.tileBoxes} boxes</strong>
        </li>
        <li class="list-group-item d-flex justify-content-between">
            <span>${config.mortarType === 'thinset'? 'Thinset' : 'Cement'}</span>
            <strong>${materials.mortarBags} bags</strong>
        </li>
        <li class="list-group-item d-flex justify-content-between">
            <span>Grout</span>
            <strong>${materials.groutBags} bags</strong>
        </li>
    `;

    document.getElementById('quoteDate').textContent = new Date().toLocaleDateString();
    updateClientInfo();
}

function updateClientInfo() {
    const name = els.customerName.value.trim();
    const phone = els.customerPhone.value.trim();
    const address = els.customerAddress.value.trim();
    const notes = els.notes.value.trim();

    if (name || phone || address || notes) {
        document.getElementById('clientInfo').style.display = 'block';
        document.getElementById('clientInfo').innerHTML = `
            ${name? `<div><strong>${ui.escapeHtml(name)}</strong></div>` : ''}
            ${phone? `<div class="small">${ui.escapeHtml(phone)}</div>` : ''}
            ${address? `<div class="small text-muted">${ui.escapeHtml(address)}</div>` : ''}
            ${notes? `<div class="small text-muted mt-1"><em>${ui.escapeHtml(notes)}</em></div>` : ''}
        `;
    } else {
        document.getElementById('clientInfo').style.display = 'none';
    }
}

function saveQuote() {
    if (rooms.length === 0) {
        ui.showToast('Add at least one room first');
        return;
    }

    const config = getFormData();
    const quote = {
        id: currentQuoteId || Date.now(),
        date: new Date().toISOString(),
        status: 'draft',
        rooms: JSON.parse(JSON.stringify(rooms)),
        config,
        totals: {
            sqft: document.getElementById('sqftOut').textContent,
            boxes: document.getElementById('boxesOut').textContent,
            mortar: document.getElementById('mortarOut').textContent,
            grout: document.getElementById('groutOut').textContent,
            grandTotal: document.getElementById('totalProjectOut').textContent
        }
    };

    try {
        storage.saveQuote(quote);
        currentQuoteId = quote.id;
        ui.showToast('Quote saved');
        renderSavedQuotes();
    } catch (e) {
        ui.showToast(e.message, 4000);
    }
}

// Called by modal in index.html - no confirm() here
function clearAllData() {
    rooms = [];
    roomIdCounter = 0;
    currentQuoteId = null;
    els.quoteForm.reset();
    els.tileSize.value = '12x12';
    els.tileBoxCoverage.value = 10;
    els.groutJoint.value = 0.125;
    els.waste.value = 10;
    els.laborRateSqft.value = 10;
    els.laborRateRoom.value = 500;
    els.laborFixed.value = 1500;
    els.patternMultiplier.value = 1;
    els.profitMargin.value = 0;
    els.taxRate.value = 0;
    ui.renderRooms(els.roomsContainer, rooms);
    updateDisplay();
    storage.clearDraft();
}

window.clearAllData = clearAllData;

function textQuote() {
    const name = els.customerName.value.trim() || 'Client';
    const total = document.getElementById('totalProjectOut').textContent;
    const sqft = document.getElementById('sqftOut').textContent;
    const boxes = document.getElementById('boxesOut').textContent;
    const mortar = document.getElementById('mortarOut').textContent;
    const grout = document.getElementById('groutOut').textContent;

    const msg = `Perry's Tiling Estimate for ${name}\n\nTotal Area: ${sqft} sq ft\nTile Boxes: ${boxes}\nThinset/Cement: ${mortar} bags\nGrout: ${grout} bags\n\nGrand Total: ${total}\n\nThis estimate includes materials and labor. Valid for 30 days.`;

    if (navigator.share) {
        navigator.share({ text: msg }).catch(() => copyToClipboard(msg));
    } else {
        copyToClipboard(msg);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        ui.showToast('Quote copied to clipboard');
    }).catch(() => {
        ui.showToast('Copy failed. Please select and copy manually.', 4000);
    });
}

function renderSavedQuotes() {
    const quotes = storage.loadQuotes();
    const container = document.getElementById('savedQuotes');

    if (quotes.length === 0) {
        document.getElementById('savedSection').style.display = 'none';
        return;
    }

    document.getElementById('savedSection').style.display = 'block';
    container.innerHTML = quotes.map(q => {
        const date = new Date(q.date).toLocaleDateString();
        const name = q.config.customerName || 'Unnamed Job';
        const statusColors = { draft: 'secondary', sent: 'info', approved: 'success', rejected: 'danger' };
        return `
            <div class="saved-quote border rounded p-2 mb-2" data-quote-id="${q.id}" style="cursor:pointer;">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="fw-bold">${ui.escapeHtml(name)}</div>
                        <div class="small text-muted">${date} • ${q.totals.sqft} sq ft • ${q.totals.grandTotal}</div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-${statusColors[q.status] || 'secondary'}">${q.status}</span>
                        <i class="bi bi-trash delete-quote text-danger"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadQuote(id) {
    const quotes = storage.loadQuotes();
    const quote = quotes.find(q => q.id == id);
    if (!quote) return;

    rooms = JSON.parse(JSON.stringify(quote.rooms));
    roomIdCounter = rooms.length > 0? Math.max(...rooms.map(r => r.id)) + 1 : 0;
    currentQuoteId = quote.id;
    setFormData(quote.config);
    ui.renderRooms(els.roomsContainer, rooms);
    updateLaborDisplay();
    updateMortarDisplay();
    updateDisplay();
    ui.showToast('Quote loaded');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FIXED: No more confirm(). Shows modal instead
function deleteQuote(id) {
    quoteToDeleteId = id;
    const quotes = storage.loadQuotes();
    const quote = quotes.find(q => q.id == id);
    const name = quote?.config?.customerName || 'Unnamed Job';

    document.getElementById('deleteQuoteName').textContent = name;
    new bootstrap.Modal(document.getElementById('deleteQuoteModal')).show();
}

function executeDeleteQuote() {
    if (!quoteToDeleteId) return;

    storage.deleteQuote(quoteToDeleteId);
    if (currentQuoteId == quoteToDeleteId) currentQuoteId = null;
    renderSavedQuotes();
    ui.showToast('Quote deleted');
    quoteToDeleteId = null;
}

window.executeDeleteQuote = executeDeleteQuote;

function cycleQuoteStatus(id) {
    const statuses = ['draft', 'sent', 'approved', 'rejected'];
    const quotes = storage.loadQuotes();
    const quote = quotes.find(q => q.id == id);
    if (!quote) return;

    const currentIdx = statuses.indexOf(quote.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];
    storage.updateQuoteStatus(id, nextStatus);
    renderSavedQuotes();
}