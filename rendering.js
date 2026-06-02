// rendering.js - Complete logic for Perry's Tiling Quote Calculator

// ===== STATE =====
let rooms = [];
let currentQuoteId = null;
let quotes = JSON.parse(localStorage.getItem('perryQuotes') || '[]');

// ===== CONSTANTS =====
const ROOM_LABELS = {
    'living': 'Living Room',
    'dining': 'Dining Room',
    'kitchen': 'Kitchen Floor',
    'bedroom': 'Bedroom',
    'bathroom': 'Bathroom Floor',
    'bathroom-wall': 'Bathroom Wall',
    'vanity-top': 'Vanity Top',
    'backsplash': 'Backsplash',
    'hallway': 'Hallway',
    'foyer': 'Foyer/Entry',
    'porch': 'Porch/Patio',
    'stairs': 'Stairs',
    'other': 'Other Area'
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    setDate();
    bindEvents();
    loadSavedQuotes();
    loadTheme();
    calculateTotals();
});

function setDate() {
    document.getElementById('quoteDate').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// ===== EVENT BINDING =====
function bindEvents() {
    // Phone number formatting - formats to (876) 555-0123 as you type
    document.getElementById('customerPhone').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        e.target.value = value;
    });

    // Room dropdown
    document.querySelectorAll('[data-room-type]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const roomType = e.target.dataset.roomType;
            const label = ROOM_LABELS[roomType] || 'Room';
            addRoom(label, roomType);
        });
    });

    // All form inputs trigger recalc
    document.querySelectorAll('#quoteForm input, #quoteForm select, #quoteForm textarea').forEach(el => {
        el.addEventListener('input', debounce(calculateTotals, 300));
        el.addEventListener('change', calculateTotals);
    });

    // Mortar type toggle
    document.getElementById('mortarType').addEventListener('change', (e) => {
        const isCement = e.target.value === 'cement';
        document.getElementById('trowelSection').style.display = isCement? 'none' : 'block';
        document.getElementById('cementSection').style.display = isCement? 'block' : 'none';
        document.getElementById('mortarLabel').textContent = isCement? 'Cement Bags' : 'Thinset Bags';
        calculateTotals();
    });

    // Labor method toggle
    document.getElementById('laborMethod').addEventListener('change', (e) => {
        const method = e.target.value;
        document.getElementById('laborRateSqftSection').style.display = method === 'sqft'? 'block' : 'none';
        document.getElementById('laborRateRoomSection').style.display = method === 'room'? 'block' : 'none';
        document.getElementById('laborFixedSection').style.display = method === 'fixed'? 'block' : 'none';
        calculateTotals();
    });

    // Buttons
    document.getElementById('clearBtn').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('clearAllModal'));
        modal.show();
    });

    document.getElementById('saveQuoteBtn').addEventListener('click', saveQuote);
    document.getElementById('saveAsNewBtn').addEventListener('click', saveAsNew);
    document.getElementById('textQuoteBtn').addEventListener('click', textQuote);
    document.getElementById('printBtn').addEventListener('click', () => window.print());
}

// ===== ROOM MANAGEMENT =====
function addRoom(typeLabel, typeKey = 'other') {
    const roomId = Date.now();
    const room = {
        id: roomId,
        typeLabel: typeLabel,
        typeKey: typeKey,
        customName: '',
        length: 0,
        width: 0
    };
    rooms.push(room);
    renderRoom(room);
    calculateTotals();
}

function renderRoom(room) {
    const roomHtml = `
        <div class="card mb-2 position-relative room-item" data-room-id="${room.id}">
            <button type="button" class="room-delete" onclick="deleteRoom(${room.id})">
                <i class="bi bi-x-circle"></i>
            </button>
            <div class="card-body">
                <h6 class="mb-2 room-type-label">${room.typeLabel}</h6>
                <input type="text" class="form-control mb-2 room-custom-name"
                       placeholder="Custom name: e.g. Upstairs, Master, #1"
                       value="${room.customName}"
                       data-room-id="${room.id}">
                <div class="row g-2">
                    <div class="col-6">
                        <input type="number" step="0.1" class="form-control room-length"
                               placeholder="Length (ft)"
                               value="${room.length || ''}"
                               data-room-id="${room.id}">
                    </div>
                    <div class="col-6">
                        <input type="number" step="0.1" class="form-control room-width"
                               placeholder="Width (ft)"
                               value="${room.width || ''}"
                               data-room-id="${room.id}">
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('roomsContainer').insertAdjacentHTML('beforeend', roomHtml);

    const newRoomEl = document.querySelector(`[data-room-id="${room.id}"]`);
    newRoomEl.querySelector('.room-custom-name').addEventListener('input', (e) => {
        updateRoom(room.id, 'customName', e.target.value);
    });
    newRoomEl.querySelector('.room-length').addEventListener('input', (e) => {
        updateRoom(room.id, 'length', parseFloat(e.target.value) || 0);
    });
    newRoomEl.querySelector('.room-width').addEventListener('input', (e) => {
        updateRoom(room.id, 'width', parseFloat(e.target.value) || 0);
    });
}

function updateRoom(id, field, value) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        room[field] = value;
        calculateTotals();
    }
}

function deleteRoom(roomId) {
    rooms = rooms.filter(r => r.id!== roomId);
    document.querySelector(`[data-room-id="${roomId}"]`).remove();
    calculateTotals();
}

// ===== CALCULATIONS =====
function calculateTotals() {
    const waste = parseFloat(document.getElementById('waste').value) || 10;
    const subtractSqft = parseFloat(document.getElementById('subtractSqft').value) || 0;
    const patternMult = parseFloat(document.getElementById('patternMultiplier').value) || 1;
    const tileSize = document.getElementById('tileSize').value;
    const boxCoverage = parseFloat(document.getElementById('tileBoxCoverage').value) || 10;
    const tilePriceSqft = parseFloat(document.getElementById('tilePriceSqft').value) || 0;
    const mortarType = document.getElementById('mortarType').value;
    const trowelSize = parseFloat(document.getElementById('trowelSize').value) || 60;
    const mortarPrice = parseFloat(document.getElementById('mortarPrice').value) || 0;
    const groutPrice = parseFloat(document.getElementById('groutPrice').value) || 0;
    const groutJoint = parseFloat(document.getElementById('groutJoint').value) || 0.125;

    const laborMethod = document.getElementById('laborMethod').value;
    const laborRateSqft = parseFloat(document.getElementById('laborRateSqft').value) || 0;
    const laborRateRoom = parseFloat(document.getElementById('laborRateRoom').value) || 0;
    const laborFixed = parseFloat(document.getElementById('laborFixed').value) || 0;

    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;

    // Base square footage
    let baseSqft = 0;
    rooms.forEach(room => {
        baseSqft += room.length * room.width;
    });

    const netSqft = Math.max(0, baseSqft - subtractSqft);
    const adjustedSqft = netSqft * (1 + waste / 100) * patternMult;

    // === TILE CALCULATION ===
    const tileArea = getTileArea(tileSize);
    const totalTiles = tileArea > 0? Math.ceil(adjustedSqft / tileArea) : 0;
    const boxes = Math.ceil(adjustedSqft / boxCoverage);

    // === THINSET/MORTAR CALCULATION ===
    const mortarCoverage = mortarType === 'cement'? 100 : trowelSize;
    const mortarBags = Math.ceil(adjustedSqft / mortarCoverage);

    // === GROUT CALCULATION ===
    // Based on Perry's rule: 100 sqft of 12x12 @ 1/8" joint = ~8 lbs = 1 bag
    // Baseline: 125 sqft per 10lb bag for 12x12 with 1/8" joint
    const tileDim = getTileAverageDimension(tileSize);
    const baselineSqftPerBag = 125;
    
    // Joint factor: 1/8" = 1.0, 1/16" = 0.5, 1/4" = 2.0
    const jointFactor = groutJoint / 0.125;
    
    // Tile factor: smaller tiles = more grout lines. 12x12 = 1.0, 6x6 = 2.0
    const tileFactor = 12 / tileDim;
    
    // Adjusted coverage per bag
    const groutSqftPerBag = baselineSqftPerBag / (jointFactor * tileFactor);
    // const groutBags = Math.max(1, Math.ceil(adjustedSqft / groutSqftPerBag));
    const groutBags = netSqft > 0 ? Math.max(1, Math.ceil(adjustedSqft / groutSqftPerBag)) : 0;

    // === COST CALCULATIONS ===
    let materialCost = 0;
    materialCost += mortarBags * mortarPrice;
    materialCost += groutBags * groutPrice;
    if (tilePriceSqft > 0) materialCost += adjustedSqft * tilePriceSqft;

    let laborCost = 0;
    if (laborMethod === 'sqft') laborCost = netSqft * laborRateSqft;
    else if (laborMethod === 'room') laborCost = rooms.length * laborRateRoom;
    else if (laborMethod === 'fixed') laborCost = laborFixed;

    const subtotal = materialCost + laborCost;
    const profit = subtotal * (profitMargin / 100);
    const taxable = subtotal + profit;
    const tax = taxable * (taxRate / 100);
    const grandTotal = taxable + tax;

    updateEstimateDisplay({
        netSqft: Math.ceil(netSqft),
        adjustedSqft: Math.ceil(adjustedSqft),
        boxes,
        mortarBags,
        groutBags,
        totalTiles,
        materialCost,
        laborCost,
        subtotal,
        profit,
        profitMargin,
        taxRate,
        grandTotal,
        tilePriceSqft,
        rooms
    });

    updateClientDisplay();
}

function getTileArea(sizeStr) {
    if (!sizeStr) return 1; // Default 12x12 = 1 sqft
    const match = sizeStr.match(/(\d+)\s*x\s*(\d+)/i);
    if (match) {
        const w = parseInt(match[1]);
        const h = parseInt(match[2]);
        return (w * h) / 144; // Convert sq inches to sq ft
    }
    return 1;
}

function getTileAverageDimension(sizeStr) {
    if (!sizeStr) return 12; // Default 12x12
    const match = sizeStr.match(/(\d+)\s*x\s*(\d+)/i);
    if (match) {
        const w = parseInt(match[1]);
        const h = parseInt(match[2]);
        return (w + h) / 2; // Average of width and height
    }
    return 12;
}

// ===== DISPLAY UPDATES =====
function updateEstimateDisplay(data) {
    document.getElementById('sqftOut').textContent = data.netSqft;
    document.getElementById('sqftOutLarge').textContent = data.netSqft;
    document.getElementById('boxesOut').textContent = data.boxes;
    document.getElementById('mortarOut').textContent = data.mortarBags;
    document.getElementById('groutOut').textContent = data.groutBags;
    document.getElementById('totalTilesOut').textContent = `${data.totalTiles} tiles`;

    // Update print header with total sqft
    const printSqft = document.getElementById('printTotalSqft');
    if (printSqft) printSqft.textContent = `${data.netSqft} sq ft`;

    if (data.materialCost > 0) {
        document.getElementById('materialCostSection').style.display = 'block';
        document.getElementById('materialCostOut').textContent = formatCurrency(data.materialCost);
    } else {
        document.getElementById('materialCostSection').style.display = 'none';
    }

    document.getElementById('laborCostOut').textContent = formatCurrency(data.laborCost);

    if (data.subtotal > 0) {
        document.getElementById('subtotalSection').style.display = 'block';
        document.getElementById('subtotalOut').textContent = formatCurrency(data.subtotal);
    } else {
        document.getElementById('subtotalSection').style.display = 'none';
    }

    if (data.profit > 0) {
        document.getElementById('profitSection').style.display = 'block';
        document.getElementById('profitLabel').textContent = `Profit (${data.profitMargin}%)`;
        document.getElementById('profitOut').textContent = formatCurrency(data.profit);
    } else {
        document.getElementById('profitSection').style.display = 'none';
    }

    if (data.tax > 0) {
        document.getElementById('taxSection').style.display = 'block';
        document.getElementById('taxLabel').textContent = `Tax (${data.taxRate}%)`;
        document.getElementById('taxOut').textContent = formatCurrency(data.tax);
    } else {
        document.getElementById('taxSection').style.display = 'none';
    }

    document.getElementById('totalProjectOut').textContent = formatCurrency(data.grandTotal);
    document.getElementById('tileNote').style.display = data.tilePriceSqft === 0? 'block' : 'none';

    updateRoomBreakdown(data.rooms);
    updateMaterialList(data);

    document.getElementById('emptyState').style.display = data.rooms.length === 0? 'block' : 'none';
}

function updateClientDisplay() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();

    if (name || phone || address) {
        let html = `<strong>${name || 'Customer'}</strong>`;
        if (phone || address) {
            html += '<br><span class="small text-muted">';
            if (phone) html += phone;
            if (phone && address) html += ' • ';
            if (address) html += address;
            html += '</span>';
        }
        document.getElementById('clientInfo').innerHTML = html;
        document.getElementById('clientInfo').style.display = 'block';
    } else {
        document.getElementById('clientInfo').style.display = 'none';
    }
}

function updateRoomBreakdown(roomList) {
    if (roomList.length === 0) {
        document.getElementById('roomBreakdown').innerHTML = '';
        return;
    }

    let html = '';
    roomList.forEach(room => {
        const sqft = Math.ceil(room.length * room.width);
        if (sqft > 0) {
            const label = room.customName? `${room.typeLabel} - ${room.customName}` : room.typeLabel;
            html += `${label.toLowerCase()} ${sqft} sq ft<br>`;
        }
    });
    document.getElementById('roomBreakdown').innerHTML = html;
}

function updateMaterialList(data) {
    const items = [];
    if (data.boxes > 0) items.push(`${data.boxes} tile boxes`);
    if (data.mortarBags > 0) {
        const type = document.getElementById('mortarType').value === 'cement'? 'cement' : 'thinset';
        items.push(`${data.mortarBags} bags ${type}`);
    }
    if (data.groutBags > 0) items.push(`${data.groutBags} bags grout`);

    const listEl = document.getElementById('materialList');
    listEl.innerHTML = items.map(i => `<li class="list-group-item">${i}</li>`).join('');
}

// ===== SAVE/LOAD =====
function saveQuote() {
    const quote = getQuoteData();
    if (currentQuoteId) {
        const idx = quotes.findIndex(q => q.id === currentQuoteId);
        quotes[idx] = quote;
        showToast('Quote updated');
    } else {
        quote.id = Date.now();
        quotes.push(quote);
        currentQuoteId = quote.id;
        showToast('Quote saved');
    }
    localStorage.setItem('perryQuotes', JSON.stringify(quotes));
    document.getElementById('quoteMode').textContent = 'Editing Saved Quote';
    loadSavedQuotes();
}

function saveAsNew() {
    const quote = getQuoteData();
    quote.id = Date.now();
    quote.name = `${quote.customerName || 'Customer'} - ${new Date().toLocaleDateString()}`;
    quotes.push(quote);
    currentQuoteId = quote.id;
    localStorage.setItem('perryQuotes', JSON.stringify(quotes));
    showToast('Saved as new quote');
    document.getElementById('quoteMode').textContent = 'Editing Saved Quote';
    loadSavedQuotes();
}

function getQuoteData() {
    const formData = {};
    document.querySelectorAll('#quoteForm input, #quoteForm select, #quoteForm textarea').forEach(el => {
        formData[el.id] = el.value;
    });

    return {
        id: currentQuoteId,
        name: document.getElementById('customerName').value || 'Unnamed Quote',
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerAddress: document.getElementById('customerAddress').value,
        notes: document.getElementById('notes').value,
        rooms: JSON.parse(JSON.stringify(rooms)),
        formData: formData,
        date: new Date().toISOString()
    };
}

function loadSavedQuotes() {
    const container = document.getElementById('savedQuotes');
    if (quotes.length === 0) {
        document.getElementById('savedSection').style.display = 'none';
        return;
    }

    document.getElementById('savedSection').style.display = 'block';
    container.innerHTML = quotes.map(q => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <strong>${q.name}</strong><br>
                <small class="text-muted">${new Date(q.date).toLocaleDateString()}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="loadQuote(${q.id})">Load</button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${q.id}, '${q.name.replace(/'/g, "\\'")}')">Del</button>
            </div>
        </div>
    `).join('');
}

function loadQuote(id) {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    currentQuoteId = id;
    document.getElementById('quoteMode').textContent = 'Editing Saved Quote';

    Object.keys(quote.formData).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = quote.formData[key];
    });

    rooms = quote.rooms || [];
    document.getElementById('roomsContainer').innerHTML = '';
    rooms.forEach(room => renderRoom(room));

    document.getElementById('mortarType').dispatchEvent(new Event('change'));
    document.getElementById('laborMethod').dispatchEvent(new Event('change'));

    calculateTotals();
    showToast('Quote loaded');
}

function confirmDelete(id, name) {
    document.getElementById('deleteQuoteName').textContent = name;
    const modal = new bootstrap.Modal(document.getElementById('deleteQuoteModal'));
    modal.show();
    window.tempDeleteId = id;
}

function executeDeleteQuote() {
    quotes = quotes.filter(q => q.id!== window.tempDeleteId);
    localStorage.setItem('perryQuotes', JSON.stringify(quotes));
    loadSavedQuotes();
    if (currentQuoteId === window.tempDeleteId) {
        executeClearAll();
    }
    bootstrap.Modal.getInstance(document.getElementById('deleteQuoteModal')).hide();
    showToast('Quote deleted');
}

function executeClearAll() {
    document.getElementById('quoteForm').reset();
    document.getElementById('roomsContainer').innerHTML = '';
    rooms = [];
    currentQuoteId = null;
    document.getElementById('quoteMode').textContent = 'New Quote';

    document.getElementById('trowelSection').style.display = 'block';
    document.getElementById('cementSection').style.display = 'none';
    document.getElementById('laborRateSqftSection').style.display = 'block';
    document.getElementById('laborRateRoomSection').style.display = 'none';
    document.getElementById('laborFixedSection').style.display = 'none';

    calculateTotals();
    bootstrap.Modal.getInstance(document.getElementById('clearAllModal')).hide();
    showToast('All cleared');
}

// ===== TEXT & UTILITIES =====
function textQuote() {
    const name = document.getElementById('customerName').value || 'Customer';
    const sqft = document.getElementById('sqftOut').textContent;
    const total = document.getElementById('totalProjectOut').textContent;
    const tiles = document.getElementById('totalTilesOut').textContent;

    let text = `Perry's Tiling Estimate for ${name}\n\n`;
    text += `Total Area: ${sqft} sq ft\n`;
    text += `Tiles: ${tiles}\n`;
    text += `Boxes: ${document.getElementById('boxesOut').textContent}\n`;
    text += `${document.getElementById('mortarLabel').textContent}: ${document.getElementById('mortarOut').textContent}\n`;
    text += `Grout Bags: ${document.getElementById('groutOut').textContent}\n\n`;
    text += `Labor: ${document.getElementById('laborCostOut').textContent}\n`;
    text += `GRAND TOTAL: ${total}\n\n`;

    if (document.getElementById('tileNote').style.display!== 'none') {
        text += `Note: Client purchases tile.\n`;
    }

    if (navigator.share) {
        navigator.share({ text: text }).catch(() => copyToClipboard(text));
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Estimate copied to clipboard');
    }).catch(() => {
        showToast('Could not copy. Please select and copy manually.');
    });
}

function formatCurrency(num) {
    return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showToast(message) {
    const toastHtml = `
        <div class="toast align-items-center text-white border-0 show" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    const container = document.querySelector('.toast-container');
    container.insertAdjacentHTML('beforeend', toastHtml);
    setTimeout(() => {
        const toast = container.lastElementChild;
        if (toast) toast.remove();
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== THEME TOGGLE =====
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.classList.replace('bi-moon-stars', 'bi-sun');
        localStorage.setItem('perryTheme', 'light');
    } else {
        icon.classList.replace('bi-sun', 'bi-moon-stars');
        localStorage.setItem('perryTheme', 'dark');
    }
}

function loadTheme() {
    if (localStorage.getItem('perryTheme') === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeIcon').classList.replace('bi-moon-stars', 'bi-sun');
    }
}

// Make functions global for onclick handlers
window.deleteRoom = deleteRoom;
window.loadQuote = loadQuote;
window.confirmDelete = confirmDelete;
window.executeDeleteQuote = executeDeleteQuote;
window.executeClearAll = executeClearAll;
window.toggleTheme = toggleTheme;