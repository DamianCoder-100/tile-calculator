
// ==========================================
// PERRY'S TILING CALCULATOR - ENGINE v5.1 (JMD)
// Fixed: waste calc, grout loop, renderRooms HTML
// ==========================================

const CURRENCY = 'JMD';

const PATTERNS = {
    'straight': {name: 'Straight Lay', multiplier: 1.0, waste: 0.10},
    'diagonal': {name: 'Diagonal', multiplier: 1.15, waste: 0.15},
    'herringbone': {name: 'Herringbone', multiplier: 1.30, waste: 0.20},
    'chevron': {name: 'Chevron', multiplier: 1.30, waste: 0.20},
    'basketweave': {name: 'Basketweave', multiplier: 1.25, waste: 0.20}
};

const TROWEL_COVERAGE = {'80': 80, '60': 60, '50': 50, '40': 40};

const TILE_PROFILES = {
    '3x6': { label: '3x6 Subway', length: 3, width: 6, thickness: 0.25 },
    '6x24': { label: '6x24 Plank', length: 6, width: 24, thickness: 0.375 },
    '12x12': { label: '12x12', length: 12, width: 12, thickness: 0.375 },
    '12x24': { label: '12x24', length: 12, width: 24, thickness: 0.375 },
    '24x24': { label: '24x24', length: 24, width: 24, thickness: 0.375 },
    '24x48': { label: '24x48 Large Format', length: 24, width: 48, thickness: 0.375 },
    'mosaic': { label: 'Mosaic Sheet', length: 12, width: 12, thickness: 0.25 }
};

const DEFAULT_GROUT_COVERAGE = {
    '24x24': 350, '24x48': 400, '12x24': 250, '12x12': 175,
    '6x24': 200, '3x6': 100, 'mosaic': 75
};

const ROOM_TYPES = [
    'Living Room', 'Dining Room', 'Kitchen Floor', 'Bedroom',
    'Bathroom', 'Bathroom Wall', 'Vanity Top', 'Backsplash',
    'Hallway', 'Foyer', 'Porch', 'Stairs', 'Other'
];

const EXTRA_SERVICES = [
    { id: 'remove_door', name: 'Remove & Reinstall Door', rate: 1000, unit: 'each' },
    { id: 'wall_floor_prep', name: 'Prepare Wall & Floor (batching)', rate: 35, unit: 'sqft' },
    { id: 'demo_tile', name: 'Demo Old Tile & Mortar', rate: 150, unit: 'sqft' },
    { id: 'remove_bath', name: 'Remove Bath/Tub', rate: 5000, unit: 'each' },
    { id: 'countertop', name: 'Countertop Install', rate: 15000, unit: 'each' },
    { id: 'skirting_tread', name: 'Skirting - Stair Tread', rate: 3500, unit: 'each' },
    { id: 'baseboard_install', name: 'Baseboard / Skirting Install', rate: 150, unit: 'lnft' },
    { id: 'cut_door_grill', name: 'Cut Door Grill', rate: 1000, unit: 'each' },
    { id: 'remove_furniture', name: 'Remove Furniture', rate: 6000, unit: 'room' },
    { id: 'floor_over', name: 'Floor Over (extra)', rate: 60, unit: 'sqft' },
    { id: 'tile_trim', name: 'Tile Trim', rate: 300, unit: 'lnft' },
    { id: 'border_install', name: 'Installing Border', rate: 300, unit: 'lnft' },
    { id: 'create_shower', name: 'Create Shower', rate: 5000, unit: 'each' },
    { id: 'create_curb', name: 'Create Curb', rate: 7000, unit: 'each' },
    { id: 'install_shower_drain', name: 'Install Shower Drain', rate: 3000, unit: 'each' },
    { id: 'remove_toilet', name: 'Remove Toilet', rate: 2000, unit: 'each' },
    { id: 'remove_basin', name: 'Remove Basin/Vanity', rate: 1500, unit: 'each' },
    { id: 'rent_demolition', name: 'Rent Demolition Hammer', rate: 4500, unit: 'each' }
];

const TILE_RATES = {
    'ceramic': { floor: 180, wall: 200 },
    'porcelain': { floor: 200, wall: 250 },
    'plank_porcelain': { floor: 250, wall: 300 },
    'mosaic': { floor: 300, wall: 350 },
    'travertine': { floor: 300, wall: 300 },
    'marble': { floor: 300, wall: 350 },
    'slate': { floor: 215, wall: 215 },
    'quarry': { floor: 280, wall: 280 },
    'large_format': { floor: 250, wall: 300 }
};

const TILE_TYPE_LABELS = {
    ceramic: 'Ceramic', porcelain: 'Porcelain', plank_porcelain: 'Plank Porcelain',
    mosaic: 'Mosaic', travertine: 'Travertine', marble: 'Marble',
    slate: 'Slate', quarry: 'Quarry', large_format: 'Large Format Tile'
};

const GROUT_BAG_COVERAGE = 100;

let state = {
    customerName: '', customerPhone: '', customerAddress: '', notes: '',
    isDarkMode: true, rooms: [], roomIdCounter: 0,
    quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
    quoteId: null, tileBoxCoverage: 10,
    mortarType: 'thinset', trowelSize: '60',
    jointWidth: 0.125,
    extras: [], extraIdCounter: 0, depositPercent: 0
};

let roomModal = null;
let quoteToDelete = null;
let editingRoomId = null;
const DRAFT_KEY = 'tilingDraft_v5_jmd';
const QUOTES_KEY = 'tilingQuotes_v5_jmd';

const DOM = {};

if (!window.bootstrap) console.warn("Bootstrap missing - modals will fail");

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-JM', {
        style: 'currency', currency: CURRENCY, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatSqft(sqft) { return `${parseFloat(sqft || 0).toFixed(1)} sqft`; }
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function parseNumber(value) { const num = parseFloat(value); return isNaN(num)? 0 : num; }
function safe(n) { return Number.isFinite(n)? n : 0; }

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function showToast(msg, delay = 3000, type = 'success') {
    const c = document.querySelector('.toast-container');
    if (!c) return;
    const id = `toast-${Date.now()}`;
    const bg = { success: 'bg-success', danger: 'bg-danger', info: 'bg-info' }[type] || 'bg-success';
    c.insertAdjacentHTML('beforeend',
        `<div id="${id}" class="toast align-items-center text-white ${bg} border-0">
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(msg)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`
    );
    const el = document.getElementById(id);
    if (el && window.bootstrap) { new bootstrap.Toast(el, { delay }).show(); }
}

function debounce(func, wait = 300) { let t; return function(...args) { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }

function getGroutCoveragePerBag(currentState) {
    if (!currentState.rooms.length) return 350;

    const profileAreas = {};
    currentState.rooms.forEach(r => {
        const area = safe(parseNumber(r.dim1) * parseNumber(r.dim2));
        const prof = r.tileProfile || '12x24';
        profileAreas[prof] = safe((profileAreas[prof] || 0) + area);
    });

    let dominantProfile = '12x24';
    let maxArea = 0;
    for (const [prof, area] of Object.entries(profileAreas)) {
        if (area > maxArea) {
            maxArea = area;
            dominantProfile = prof;
        }
    }

    const baseCoverage = DEFAULT_GROUT_COVERAGE[dominantProfile] || 350;
    const jointWidth = parseNumber(currentState.jointWidth) || 0.125;
    const safeJoint = Math.max(0.01, jointWidth);
    const scaledCoverage = baseCoverage * (0.125 / safeJoint);

    return Math.max(50, Math.min(600, scaledCoverage));
}

function calculateEstimate(customState = state) {
    const {rooms, waste, subtractSqft, tileBoxCoverage, mortarType, trowelSize, depositPercent} = customState;

    let totalGrossInstallArea = 0;
    let totalFloorArea = 0;
    let totalWallArea = 0;
    let exactThinsetBagsTotal = 0;
    let totalProjectBoxesCount = 0;

    const roomBreakdown = [];
    const globalWasteFactor = parseNumber(waste) / 100;
    const safeBoxCov = Math.max(1, parseNumber(tileBoxCoverage) || 10);

    rooms.forEach(room => {
        const d1 = parseNumber(room.dim1);
        const d2 = parseNumber(room.dim2);
        const baseArea = safe(d1 * d2);
        totalGrossInstallArea += baseArea;

        const isWall = room.surfaceType === 'wall';
        if (isWall) totalWallArea += baseArea;
        else totalFloorArea += baseArea;

        const tileType = room.tileType || 'ceramic';
        const defaultRate = isWall? (TILE_RATES[tileType]?.wall || 200) : (TILE_RATES[tileType]?.floor || 180);
        const baseRate = parseNumber(room.customRate) > 0? parseNumber(room.customRate) : defaultRate;
        const patternConfig = PATTERNS[room.pattern] || { name: 'Straight Lay', multiplier: 1.0, waste: 0.10 };

        // FIXED: Pattern waste + global waste, not max()
        const combinedWasteFactor = patternConfig.waste + globalWasteFactor;

        const heightAdder = (room.isHeight && isWall)? (60 * baseArea) : 0;
        const roomLaborTotal = safe((baseArea * baseRate * patternConfig.multiplier) + heightAdder);

        const trowelCov = parseNumber(trowelSize) || 60;
        let roomThinsetBags = mortarType === 'thinset'? (baseArea / trowelCov) : (baseArea / 100);
        if (isWall) roomThinsetBags *= 1.25;
        exactThinsetBagsTotal += safe(roomThinsetBags);

        const roomAreaWithWaste = baseArea * (1 + combinedWasteFactor);
        const roomBoxes = Math.ceil(roomAreaWithWaste / safeBoxCov);
        totalProjectBoxesCount += roomBoxes;

        roomBreakdown.push({
            id: room.id, name: room.name,
            tileType: TILE_TYPE_LABELS[tileType] || 'Ceramic',
            tileProfile: room.tileProfile || '12x24',
            baseArea, rate: baseRate, pattern: patternConfig.name,
            labor: roomLaborTotal, customRate: parseNumber(room.customRate) > 0,
            boxes: roomBoxes, surfaceType: isWall? 'Wall' : 'Floor',
            dim1: d1, dim2: d2, exactThinset: safe(roomThinsetBags)
        });
    });

    const totalGroutSqft = safe(totalFloorArea + totalWallArea);
    const groutCoverage = getGroutCoveragePerBag(customState);
    if (!groutCoverage || groutCoverage <= 0) {
        return { error: 'Invalid grout coverage. Check joint width.' };
    }
    const exactGroutBags = safe(totalGroutSqft / groutCoverage);
    const purchaseGroutBags = Math.ceil(exactGroutBags);

    let extrasTotal = 0;
    const extrasBreakdown = [];
    customState.extras.forEach(extra => {
        const qty = parseNumber(extra.quantity);
        const rate = parseNumber(extra.rate);
        const lineTotal = safe(qty * rate);
        extrasTotal += lineTotal;
        extrasBreakdown.push({ name: extra.name, quantity: qty, unit: extra.unit, rate, total: lineTotal });
    });

    const deductionSqft = parseNumber(subtractSqft);
    let totalLaborBeforeExtras = 0;
    let adjustedRoomBreakdown = [];

    if (deductionSqft > 0 && totalGrossInstallArea > 0) {
        const deductionRatio = Math.min(1, deductionSqft / totalGrossInstallArea);
        roomBreakdown.forEach(r => {
            const laborCredit = safe(r.labor * deductionRatio);
            const adjustedLabor = safe(r.labor - laborCredit);
            totalLaborBeforeExtras += adjustedLabor;
            adjustedRoomBreakdown.push({...r, labor: adjustedLabor, originalLabor: r.labor});
        });
    } else {
        totalLaborBeforeExtras = safe(roomBreakdown.reduce((sum, r) => sum + r.labor, 0));
        adjustedRoomBreakdown = roomBreakdown;
    }

    const netBillableArea = Math.max(0, totalGrossInstallArea - deductionSqft);
    let modifiedLaborSubtotal = safe(totalLaborBeforeExtras + extrasTotal);
    const deposit = safe(modifiedLaborSubtotal * (parseNumber(depositPercent) / 100));
    const balance = safe(modifiedLaborSubtotal - deposit);
    const purchaseThinsetBags = Math.ceil(exactThinsetBagsTotal);

    return {
        totalSqft: safe(netBillableArea),
        installArea: safe(totalGrossInstallArea),
        totalFloorArea: safe(totalFloorArea), totalWallArea: safe(totalWallArea),
        laborTotal: modifiedLaborSubtotal,
        grandTotal: modifiedLaborSubtotal,
        subtotal: modifiedLaborSubtotal,
        deposit, balance,
        exactThinsetBags: safe(exactThinsetBagsTotal),
        purchaseThinsetBags,
        exactGroutBags: safe(exactGroutBags), purchaseGroutBags,
        groutSqftTotal: totalGroutSqft,
        groutCoverageUsed: safe(groutCoverage),
        boxes: totalProjectBoxesCount,
        roomBreakdown: adjustedRoomBreakdown,
        extrasBreakdown, extrasTotal: safe(extrasTotal)
    };
}

function renderSummary(data) {
    setText('sqftOutLarge', safe(data.totalSqft).toFixed(1));
    setText('sqftOut', safe(data.totalSqft).toFixed(1));
    setText('totalProjectOut', formatCurrency(data.grandTotal));
    setText('laborCostOut', formatCurrency(data.laborTotal));
    setText('mortarOut', data.purchaseThinsetBags);
    setText('groutOut', data.purchaseGroutBags);
    setText('boxesOut', data.boxes);
    setText('mortarLabel', state.mortarType === 'thinset'? 'Thinset Bags' : 'Cement Bags');

    const depositDiv = DOM.depositSection;
    if (depositDiv) {
        if (data.deposit > 0) {
            setText('depositOut', formatCurrency(data.deposit));
            setText('balanceOut', formatCurrency(data.balance));
            depositDiv.style.display = 'block';
        } else {
            depositDiv.style.display = 'none';
        }
    }
}

function renderRoomsBreakdown(data) {
    const roomBreakdownList = DOM.roomBreakdownList;
    if (!roomBreakdownList) return;
    roomBreakdownList.innerHTML = data.roomBreakdown.map(r => {
        const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
        const dims = `${safe(r.dim1).toFixed(1)}×${safe(r.dim2).toFixed(1)}`;
        const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
        const laborDisplay = r.originalLabor
       ? `${formatCurrency(r.labor)} <small class="text-muted">(${formatCurrency(r.originalLabor)} before deduction)</small>`
            : formatCurrency(r.labor);
        return `
            <div class="mb-2 pb-2 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="fw-bold">${escapeHtml(r.name)} <span class="badge ${r.surfaceType === 'Wall'? 'bg-info' : 'bg-secondary'} ms-1">${r.surfaceType}</span></div>
                    <span class="badge bg-primary">${r.boxes} boxes</span>
                </div>
                <div class="d-flex justify-content-between small">
                    <span>Tile: ${escapeHtml(r.tileType)} - ${escapeHtml(profileLabel)}</span>
                </div>
                <div class="d-flex justify-content-between small">
                    <span>${dims} = ${formatSqft(r.baseArea)} @ ${rateText} - ${r.pattern}</span>
                    <span>${laborDisplay}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Thinset: ${Math.ceil(r.exactThinset)} bags (${safe(r.exactThinset).toFixed(2)} calc)</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderExtras(data) {
    const extrasDiv = DOM.extrasBreakdownList;
    const extrasSection = DOM.extrasSection;
    if (extrasDiv && extrasSection) {
        extrasDiv.innerHTML = data.extrasBreakdown.map(e =>
            `<div class="d-flex justify-content-between small mb-1">
                <span>${escapeHtml(e.name)}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)}</span>
                <span>${formatCurrency(e.total)}</span>
            </div>`
        ).join('');
        extrasSection.style.display = data.extrasBreakdown.length? 'block' : 'none';
    }
}

function renderMaterials(data) {
    const materialList = DOM.materialList;
    if (!materialList) return;
    const materials = [];
    if (data.purchaseThinsetBags > 0) {
        materials.push(`<li class="list-group-item d-flex justify-content-between">
            <span>${state.mortarType === 'thinset'? 'Thinset' : 'Cement'}</span>
            <span><strong>${data.purchaseThinsetBags} bags</strong> <small class="text-muted">(${safe(data.exactThinsetBags).toFixed(2)} calc)</small></span>
        </li>`);
    }
    if (data.purchaseGroutBags > 0) {
        materials.push(`<li class="list-group-item d-flex justify-content-between">
            <span>Grout</span>
            <span><strong>${data.purchaseGroutBags} bags</strong> <small class="text-muted">(${safe(data.exactGroutBags).toFixed(2)} calc @ ${safe(data.groutCoverageUsed).toFixed(0)} sqft/bag)</small></span>
        </li>`);
    }
    if (data.totalFloorArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Floor Area</span><span>${safe(data.totalFloorArea).toFixed(1)} sqft</span></li>`);
    if (data.totalWallArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Wall Area</span><span>${safe(data.totalWallArea).toFixed(1)} sqft</span></li>`);
    if (data.totalSqft > 0) materials.push(`<li class="list-group-item d-flex justify-content-between"><span>Tile Boxes Total</span><span>${data.boxes} boxes</span></li>`);
    materialList.innerHTML = materials.join('') || '<li class="list-group-item text-muted">No materials calculated yet</li>';
}

function renderClient() {
    const name = state.customerName.trim();
    const phone = state.customerPhone.trim();
    const info = DOM.clientInfo;
    if (info) {
        if (name || phone) {
            info.innerHTML = `<strong>${escapeHtml(name) || 'Customer'}</strong><br><small>${escapeHtml(phone) || ''}</small>`;
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    }
}

function updateEstimate() {
    const data = calculateEstimate();
    if (data.error) {
        showToast(data.error, 3000, 'danger');
        return;
    }
    renderSummary(data);
    renderRoomsBreakdown(data);
    renderExtras(data);
    renderMaterials(data);
    renderClient();
    if (DOM.emptyState) DOM.emptyState.style.display = state.rooms.length? 'none' : 'block';
}

function renderRooms() {
    const container = DOM.roomsContainer;
    if (!container) return;
    if (state.rooms.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">Click "Add Room" to start</p>';
        return;
    }
    container.innerHTML = state.rooms.map(room => {
        const isWall = room.surfaceType === 'wall';
        const profileLabel = TILE_PROFILES[room.tileProfile]?.label || room.tileProfile || '12x24';
        return `
        <div class="card room-card mb-2" data-room-id="${room.id}">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="w-50">
                        <input type="text" class="form-control form-control-sm fw-bold room-name border-0 bg-transparent p-0" value="${escapeHtml(room.name)}" data-field="name">
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary edit-room-btn" title="Edit Advanced"><i class="bi bi-pencil"></i> Advanced</button>
                        <button class="btn btn-sm btn-outline-danger remove-room-btn"><i class="bi bi-x"></i></button>
                    </div>
                <div class="row g-2 align-items-center">
                    <div class="col-4">
                        <select class="form-select form-select-sm room-field fw-bold" data-field="surfaceType">
                            <option value="floor" ${!isWall? 'selected' : ''}>Floor</option>
                            <option value="wall" ${isWall? 'selected' : ''}>Wall</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text small px-1">${isWall? 'H' : 'L'}</span>
                            <input type="number" class="form-control room-field" data-field="dim1" value="${room.dim1 || ''}" placeholder="0" step="0.1">
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text small px-1">W</span>
                            <input type="number" class="form-control room-field" data-field="dim2" value="${room.dim2 || ''}" placeholder="0" step="0.1">
                        </div>
                    </div>
                </div>
                <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                    <span>${escapeHtml(TILE_TYPE_LABELS[room.tileType || 'ceramic'])} - ${escapeHtml(profileLabel)}</span>
                    <span class="fw-bold text-primary">${safe(parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1)} sqft</span>
                </div>
            </div>
        </div>
    `}).join('');
}

function addExtraService(service) {
    const id = state.extraIdCounter++;
    state.extras.push({ id, name: service.name, quantity: 1, rate: service.rate, unit: service.unit });
    renderExtrasList();
    updateEstimate();
    saveDraft();
}

function renderExtrasList() {
    const container = DOM.extrasContainer;
    if (!container) return;
    if (state.extras.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">No extras added</p>';
        return;
    }
    container.innerHTML = state.extras.map(extra => `
        <div class="card mb-2" data-extra-id="${extra.id}">
            <div class="card-body py-2">
                <div class="row g-2 align-items-center">
                    <div class="col-12 col-md-4">
                        <label class="form-label d-md-none small text-muted mb-0">Service</label>
                        <input type="text" class="form-control form-control-sm extra-field" data-field="name" value="${escapeHtml(extra.name)}">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Qty</label>
                        <input type="number" class="form-control form-control-sm extra-field" data-field="quantity" value="${extra.quantity}" step="0.1">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Amount</label>
                        <input type="number" class="form-control form-control-sm extra-field" data-field="rate" value="${extra.rate}">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Unit</label>
                        <select class="form-select form-select-sm extra-field" data-field="unit">
                            <option value="each" ${extra.unit === 'each'? 'selected' : ''}>each</option>
                            <option value="sqft" ${extra.unit === 'sqft'? 'selected' : ''}>sqft</option>
                            <option value="lnft" ${extra.unit === 'lnft'? 'selected' : ''}>lnft</option>
                            <option value="room" ${extra.unit === 'room'? 'selected' : ''}>room</option>
                        </select>
                    </div>
                    <div class="col-4 col-md-1 text-end">
                        <label class="form-label d-md-none small text-muted mb-0">Total</label>
                        <strong>${formatCurrency(extra.quantity * extra.rate)}</strong>
                    </div>
                    <div class="col-2 col-md-1 text-end">
                        <button class="btn btn-sm btn-outline-danger remove-extra-btn"><i class="bi bi-x"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function createRoomModal() {
    const modalEl = document.getElementById('addRoomModal');
    if (!modalEl ||!window.bootstrap) return;
    if (!roomModal) { roomModal = new bootstrap.Modal(modalEl); }
}

function resetModalForm() {
    editingRoomId = null;
    ['roomName','roomDim1','roomDim2','customRate'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const rt = document.getElementById('roomTileType'); if (rt) rt.value = 'ceramic';
    const tp = document.getElementById('roomTileProfile'); if (tp) tp.value = '12x24';
    const pt = document.getElementById('pattern'); if (pt) pt.value = 'straight';
    const ih = document.getElementById('isHeight'); if (ih) ih.checked = false;
    const surfaceFloor = document.getElementById('surfaceFloor'); if (surfaceFloor) surfaceFloor.checked = true;
    const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Set Space Metrics';
    const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Add Room';
}

function loadRoomToModal(room) {
    editingRoomId = room.id;
    document.getElementById('roomName').value = room.name || '';
    document.getElementById('roomDim1').value = room.dim1 || '';
    document.getElementById('roomDim2').value = room.dim2 || '';
    document.getElementById('roomTileType').value = room.tileType || 'ceramic';
    document.getElementById('roomTileProfile').value = room.tileProfile || '12x24';
    document.getElementById('customRate').value = room.customRate || '';
    document.getElementById('pattern').value = room.pattern || 'straight';
    document.getElementById('isHeight').checked = room.isHeight || false;
    if (room.surfaceType === 'wall') {
        document.getElementById('surfaceWall').checked = true;
    } else {
        document.getElementById('surfaceFloor').checked = true;
    }
    const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Edit Advanced Room Parameters';
    const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Save Changes';
}

function addRoomFromModal() {
    const id = state.roomIdCounter++;
    const surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
    const room = {
        id, name: document.getElementById('roomName').value || `Area ${state.rooms.length + 1}`,
        surfaceType, dim1: parseNumber(document.getElementById('roomDim1').value),
        dim2: parseNumber(document.getElementById('roomDim2').value),
        tileType: document.getElementById('roomTileType').value,
        tileProfile: document.getElementById('roomTileProfile').value,
        customRate: parseNumber(document.getElementById('customRate').value),
        pattern: document.getElementById('pattern').value,
        isHeight: document.getElementById('isHeight').checked
    };
    state.rooms.push(room);
    renderRooms();
    updateEstimate();
    saveDraft();
}

function updateRoomFromModal() {
    if (editingRoomId === null) return;
    const room = state.rooms.find(r => r.id === editingRoomId);
    if (!room) return;
    room.name = document.getElementById('roomName').value || room.name;
    room.surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
    room.dim1 = parseNumber(document.getElementById('roomDim1').value);
    room.dim2 = parseNumber(document.getElementById('roomDim2').value);
    room.tileType = document.getElementById('roomTileType').value;
    room.tileProfile = document.getElementById('roomTileProfile').value;
    room.customRate = parseNumber(document.getElementById('customRate').value);
    room.pattern = document.getElementById('pattern').value;
    room.isHeight = document.getElementById('isHeight').checked;
    showToast('Room parameters synced', 2000, 'success');
    renderRooms();
    updateEstimate();
    saveDraft();
}

function saveDraft() {
    try {
        const draft = {...state, savedAt: new Date().toISOString()};
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
        console.error('Failed to save draft:', e);
        showToast('Draft save failed', 2000, 'danger');
    }
}

function loadDraft() {
    try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (!draft) return;
        const parsed = JSON.parse(draft);
        const safeMerge = {
            customerName: parsed.customerName?? state.customerName,
            customerPhone: parsed.customerPhone?? state.customerPhone,
            customerAddress: parsed.customerAddress?? state.customerAddress,
            notes: parsed.notes?? state.notes,
            isDarkMode: parsed.isDarkMode?? state.isDarkMode,
            rooms: parsed.rooms?? state.rooms,
            roomIdCounter: parsed.roomIdCounter?? state.roomIdCounter,
            quoteDate: parsed.quoteDate?? state.quoteDate,
            waste: parseNumber(parsed.waste) || state.waste,
            subtractSqft: parseNumber(parsed.subtractSqft) || state.subtractSqft,
            quoteId: parsed.quoteId?? state.quoteId,
            tileBoxCoverage: parseNumber(parsed.tileBoxCoverage) || state.tileBoxCoverage,
            mortarType: parsed.mortarType?? state.mortarType,
            trowelSize: parsed.trowelSize?? state.trowelSize,
            jointWidth: parseNumber(parsed.jointWidth) || state.jointWidth,
            extras: parsed.extras?? state.extras,
            extraIdCounter: parsed.extraIdCounter?? state.extraIdCounter,
            depositPercent: parseNumber(parsed.depositPercent) || state.depositPercent
        };
        state = safeMerge;
        state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
        state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;

        ['customerName','customerPhone','customerAddress','notes'].forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = state[key];
        });
        ['mortarType','trowelSize','depositPercent','jointWidth','waste','subtractSqft','tileBoxCoverage'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = state[id];
        });
        const ts = document.getElementById('trowelSection');
        if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
        renderRooms();
        renderExtrasList();
        showToast(`Draft restored`, 2000, 'info');
    } catch (e) {
        console.error('Corrupted draft detected:', e);
        localStorage.removeItem(DRAFT_KEY);
        showToast('Corrupted draft cleared', 2000, 'danger');
    }
}

function saveQuote(asNew = false) {
    try {
        const quotes = getAllQuotes();
        const id = asNew ||!state.quoteId? `PERRY-${Date.now()}` : state.quoteId;
        const quote = {...state, id, savedAt: new Date().toISOString()};
        const existingIndex = quotes.findIndex(q => q.id === id);
        if (existingIndex >= 0) { quotes[existingIndex] = quote; } else { quotes.push(quote); }
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        state.quoteId = id;
        const qm = document.getElementById('quoteMode');
        if (qm) { qm.textContent = 'Saved Quote'; qm.className = 'badge bg-success'; }
        renderSavedQuotes();
        showToast(asNew? 'Quote saved as new configuration' : 'Quote modifications saved', 2000, 'success');
    } catch (e) {
        console.error('Failed to save quote:', e);
        showToast('Quote save failed', 2000, 'danger');
    }
}

function getAllQuotes() {
    try {
        const quotes = localStorage.getItem(QUOTES_KEY);
        return quotes? JSON.parse(quotes) : [];
    } catch (e) {
        console.error('Corrupted quotes detected:', e);
        localStorage.removeItem(QUOTES_KEY);
        showToast('Corrupted quotes cleared', 2000, 'danger');
        return [];
    }
}

function loadQuote(id) {
    const quotes = getAllQuotes();
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    const safeMerge = {
        customerName: quote.customerName?? state.customerName,
        customerPhone: quote.customerPhone?? state.customerPhone,
        customerAddress: quote.customerAddress?? state.customerAddress,
        notes: quote.notes?? state.notes,
        isDarkMode: quote.isDarkMode?? state.isDarkMode,
        rooms: quote.rooms?? state.rooms,
        roomIdCounter: quote.roomIdCounter?? state.roomIdCounter,
        quoteDate: quote.quoteDate?? state.quoteDate,
        waste: parseNumber(quote.waste) || state.waste,
        subtractSqft: parseNumber(quote.subtractSqft) || state.subtractSqft,
        quoteId: quote.id,
        tileBoxCoverage: parseNumber(quote.tileBoxCoverage) || state.tileBoxCoverage,
        mortarType: quote.mortarType?? state.mortarType,
        trowelSize: quote.trowelSize?? state.trowelSize,
        jointWidth: parseNumber(quote.jointWidth) || state.jointWidth,
        extras: quote.extras?? state.extras,
        extraIdCounter: quote.extraIdCounter?? state.extraIdCounter,
        depositPercent: parseNumber(quote.depositPercent) || state.depositPercent
    };
    state = safeMerge;

    state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
    state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;

    ['customerName','customerPhone','customerAddress','notes'].forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = state[key];
    });
    ['mortarType','trowelSize','depositPercent','jointWidth','waste','subtractSqft','tileBoxCoverage'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = state[id];
    });
    const ts = document.getElementById('trowelSection');
    if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
    const qm = document.getElementById('quoteMode');
    if (qm) { qm.textContent = 'Loaded Quote'; qm.className = 'badge bg-info'; }
    renderRooms();
    renderExtrasList();
    updateEstimate();
    showToast('Quote configuration loaded', 2000, 'info');
}

function deleteQuote(id) {
    quoteToDelete = id;
    if (window.bootstrap) {
        new bootstrap.Modal(document.getElementById('deleteQuoteModal')).show();
    }
}

function renderSavedQuotes() {
    const quotes = getAllQuotes();
    const section = DOM.savedSection;
    const container = DOM.savedQuotes;
    if (!section ||!container) return;
    if (quotes.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    container.innerHTML = quotes.map(q => {
        const calc = calculateEstimate(q);
        return `
        <div class="saved-quote-item p-2 border rounded mb-2">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${escapeHtml(q.customerName || 'Unnamed')}</strong>
                    <div class="small text-muted">${new Date(q.savedAt).toLocaleDateString('en-JM')} - ${formatCurrency(calc.grandTotal)}</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary load-quote-btn me-1" data-id="${q.id}">Load</button>
                    <button class="btn btn-sm btn-outline-danger delete-quote-btn" data-id="${q.id}">Del</button>
                </div>
            </div>
        </div>
    `}).join('');
}

function clearAll() {
    state = {
        customerName: '', customerPhone: '', customerAddress: '', notes: '',
        isDarkMode: state.isDarkMode, rooms: [], roomIdCounter: 0,
        quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
        quoteId: null, tileBoxCoverage: 10,
        mortarType: 'thinset', trowelSize: '60',
        jointWidth: 0.125,
        extras: [], extraIdCounter: 0,
        depositPercent: 0
    };
    ['customerName','customerPhone','customerAddress','notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const dp = document.getElementById('depositPercent'); if (dp) dp.value = '0';
    const jw = document.getElementById('jointWidth'); if (jw) jw.value = '0.125';
    const waste = document.getElementById('waste'); if (waste) waste.value = '10';
    const sub = document.getElementById('subtractSqft'); if (sub) sub.value = '0';
    const boxCov = document.getElementById('tileBoxCoverage'); if (boxCov) boxCov.value = '10';
    const qm = document.getElementById('quoteMode');
    if (qm) {
        qm.textContent = 'New Quote';
        qm.className = 'badge bg-secondary';
    }
    localStorage.removeItem(DRAFT_KEY);
    renderRooms();
    renderExtrasList();
    updateEstimate();
}

function bindEvents() {
    DOM.quoteDate = document.getElementById('quoteDate');
    DOM.estimateDate = document.getElementById('estimateDate');
    DOM.depositSection = document.getElementById('depositSection');
    DOM.roomBreakdownList = document.getElementById('roomBreakdownList');
    DOM.extrasBreakdownList = document.getElementById('extrasBreakdownList');
    DOM.extrasSection = document.getElementById('extrasSection');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.materialList = document.getElementById('materialList');
    DOM.clientInfo = document.getElementById('clientInfo');
    DOM.roomsContainer = document.getElementById('roomsContainer');
    DOM.extrasContainer = document.getElementById('extrasContainer');
    DOM.savedSection = document.getElementById('savedSection');
    DOM.savedQuotes = document.getElementById('savedQuotes');

    if (DOM.quoteDate) DOM.quoteDate.textContent = state.quoteDate;
    if (DOM.estimateDate) DOM.estimateDate.textContent = state.quoteDate;

    createRoomModal();

    const roomTypeMenu = document.getElementById('roomTypeMenu');
    if (roomTypeMenu) {
        roomTypeMenu.innerHTML = ROOM_TYPES.map(t =>
            `<li><a class="dropdown-item" href="#" data-room-type="${t}">${t}</a></li>`
        ).join('');
        roomTypeMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const item = e.target.closest('[data-room-type]');
            if (!item) return;
            const roomType = item.dataset.roomType;
            createRoomModal();
            resetModalForm();
            document.getElementById('roomName').value = roomType;
            const isWall = roomType.toLowerCase().includes('wall');
            const sf = document.getElementById('surfaceFloor'); if (sf) sf.checked =!isWall;
            const sw = document.getElementById('surfaceWall'); if (sw) sw.checked = isWall;
            if (roomModal) roomModal.show();
        });
    }

    const extraServicesMenu = document.getElementById('extraServicesMenu');
    if (extraServicesMenu) {
        const presetItems = EXTRA_SERVICES.map(s =>
            `<li><a class="dropdown-item d-flex justify-content-between align-items-center py-2" href="#" data-service-id="${s.id}">
                <span>${s.name}</span>
                <span class="badge bg-secondary ms-2">${formatCurrency(s.rate)}/${s.unit}</span>
            </a></li>`
        ).join('');

        extraServicesMenu.insertAdjacentHTML('afterbegin', presetItems);

        extraServicesMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const item = e.target.closest('[data-service-id]');
            if (item) {
                const service = EXTRA_SERVICES.find(s => s.id === item.dataset.serviceId);
                if (service) addExtraService(service);
                const toggle = e.target.closest('.dropdown')?.querySelector('.dropdown-toggle');
                bootstrap.Dropdown.getInstance(toggle)?.hide();
            }
        });
    }

    document.getElementById('addCustomExtraBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        addExtraService({ name: 'Custom Service', rate: 0, unit: 'each' });
        const toggle = e.target.closest('.dropdown')?.querySelector('.dropdown-toggle');
        bootstrap.Dropdown.getInstance(toggle)?.hide();
    });

    const roomTileType = document.getElementById('roomTileType');
    if (roomTileType) {
        roomTileType.innerHTML = Object.keys(TILE_RATES).map(t =>
            `<option value="${t}">${TILE_TYPE_LABELS[t]}</option>`
        ).join('');
    }

    const roomTileProfile = document.getElementById('roomTileProfile');
    if (roomTileProfile) {
        roomTileProfile.innerHTML = Object.keys(TILE_PROFILES).map(p =>
            `<option value="${p}">${TILE_PROFILES[p].label}</option>`
        ).join('');
    }

    const autoSave = debounce(() => saveDraft(), 1000);

    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let digits = e.target.value.replace(/\D/g, '');
            if (digits.length > 10) digits = digits.slice(0, 10);

            let formatted = digits;
            if (digits.length >= 7) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
            } else if (digits.length >= 4) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            }

            e.target.value = formatted;
            state.customerPhone = formatted;
            renderClient();
            autoSave();
        });

        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.endsWith('-')) {
                e.target.value = e.target.value.slice(0, -1);
                e.preventDefault();
            }
        });
    }

    ['customerName','customerAddress','notes','waste','subtractSqft','tileBoxCoverage','depositPercent','jointWidth'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            state[id] = id === 'waste' || id === 'subtractSqft' || id === 'tileBoxCoverage' || id === 'depositPercent' || id === 'jointWidth'
        ? parseNumber(e.target.value)
                : e.target.value;
            updateEstimate();
            autoSave();
        });
    });

    ['mortarType','trowelSize'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', (e) => {
            state[id] = e.target.value;
            if (id === 'mortarType') {
                const ts = document.getElementById('trowelSection');
                if (ts) ts.style.display = e.target.value === 'thinset'? 'block' : 'none';
            }
            updateEstimate();
            autoSave();
        });
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        state.isDarkMode =!state.isDarkMode;
        document.body.classList.toggle('dark-mode', state.isDarkMode);
        const ti = document.getElementById('themeIcon');
        if (ti) ti.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';
        localStorage.setItem('perryTheme', state.isDarkMode? 'dark' : 'light');
    });

    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        if (window.bootstrap) new bootstrap.Modal(document.getElementById('clearAllModal')).show();
    });

    document.getElementById('confirmClearBtn')?.addEventListener('click', () => {
        clearAll();
        if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('clearAllModal'))?.hide();
    });

    document.getElementById('confirmDeleteQuoteBtn')?.addEventListener('click', () => {
        if (quoteToDelete) {
            try {
                const quotes = getAllQuotes().filter(q => q.id!== quoteToDelete);
                localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
                renderSavedQuotes();
                showToast('Quote deleted', 2000, 'danger');
            } catch (e) {
                console.error('Failed to delete quote:', e);
                showToast('Delete failed', 2000, 'danger');
            }
            quoteToDelete = null;
            if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteQuoteModal'))?.hide();
        }
    });

    document.getElementById('saveQuoteBtn')?.addEventListener('click', () => saveQuote(false));
    document.getElementById('saveAsNewBtn')?.addEventListener('click', () => saveQuote(true));
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());

    document.getElementById('textQuoteBtn')?.addEventListener('click', () => {
        const data = calculateEstimate();
        if (data.error) {
            showToast(data.error, 3000, 'danger');
            return;
        }
        let msg = `Perry's Tiling Estimate\nCustomer: ${state.customerName}\n`;
        if (state.customerPhone) msg += `Phone: ${state.customerPhone}\n`;
        if (state.customerAddress) msg += `Address: ${state.customerAddress}\n`;
        msg += `\nLABOR BREAKDOWN\n`;

        data.roomBreakdown.forEach(r => {
            const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
            const dims = `${safe(r.dim1).toFixed(1)}×${safe(r.dim2).toFixed(1)}`;
            const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
            msg += `\n${r.name} [${r.surfaceType}]:\n`;
            msg += `Tile: ${r.tileType} - ${profileLabel}\n`;
            msg += `${dims} = ${safe(r.baseArea).toFixed(1)} sqft @ ${rateText} - ${r.pattern}\n`;
            msg += `Labor: ${formatCurrency(r.labor)}\n`;
            if (r.originalLabor) msg += `(Original: ${formatCurrency(r.originalLabor)})\n`;
            msg += `Boxes: ${r.boxes}\n`;
            msg += `Thinset: ${Math.ceil(r.exactThinset)} bags (${safe(r.exactThinset).toFixed(2)} calc)\n`;
        });

        if (data.extrasBreakdown.length > 0) {
            msg += `\nEXTRA SERVICES\n`;
            data.extrasBreakdown.forEach(e => {
                msg += `${e.name}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)} = ${formatCurrency(e.total)}\n`;
            });
        }

        msg += `\nTOTAL LABOR: ${formatCurrency(data.grandTotal)}\n`;
        if (data.deposit > 0) {
            msg += `DEPOSIT REQUIRED: ${formatCurrency(data.deposit)}\n`;
            msg += `BALANCE DUE: ${formatCurrency(data.balance)}\n`;
        }
        msg += `Billable Area: ${safe(data.totalSqft).toFixed(1)} sqft\n\n`;
        msg += `MATERIALS NEEDED (Client Supplies):\n`;
        msg += `${data.purchaseThinsetBags} ${state.mortarType} bags (${safe(data.exactThinsetBags).toFixed(2)} calculated)\n`;
        msg += `${data.purchaseGroutBags} grout bags (${safe(data.exactGroutBags).toFixed(2)} calculated @ ${safe(data.groutCoverageUsed).toFixed(0)} sqft/bag)\n`;
        msg += ` - Joint Width: ${safe(parseNumber(state.jointWidth) * 8).toFixed(0)}/8"\n`;
        msg += ` - Total Coverage: ${safe(data.groutSqftTotal).toFixed(1)} sqft\n`;
        msg += ` - Floor: ${safe(data.totalFloorArea).toFixed(1)} sqft | Wall: ${safe(data.totalWallArea).toFixed(1)} sqft\n`;
        msg += `${data.boxes} tile boxes total\n\n`;
        if (state.notes) msg += `Notes: ${state.notes}\n\n`;
        msg += `Labor only - Client supplies all materials\n`;
        msg += `Quote Date: ${state.quoteDate}\n`;
        msg += `Call Perry: 876-817-3377`;

        navigator.clipboard.writeText(msg);
        showToast('Quote copied to clipboard', 2000, 'success');
    });

    DOM.roomsContainer?.addEventListener('input', (e) => {
        if (!e.target.classList.contains('room-field') &&!e.target.classList.contains('room-name')) return;
        const card = e.target.closest('.room-card');
        if (!card) return;
        const id = parseInt(card.dataset.roomId);
        const room = state.rooms.find(r => r.id === id);
        if (!room) return;
        const field = e.target.dataset.field;
        let value = e.target.value;
        if (['dim1','dim2','customRate'].includes(field)) {
            value = value === ''? 0 : parseFloat(value) || 0;
        }
        room[field] = value;

        if (field === 'surfaceType') {
            renderRooms();
        } else {
            const badgeOut = card.querySelector('.text-primary');
            if (badgeOut) {
                const total = safe(parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1);
                badgeOut.textContent = `${total} sqft`;
            }
        }

        updateEstimate();
        autoSave();
    });

    DOM.roomsContainer?.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-room-btn');
        const removeBtn = e.target.closest('.remove-room-btn');
        const card = e.target.closest('.room-card');
        if (!card) return;

        const id = parseInt(card.dataset.roomId);
        const room = state.rooms.find(r => r.id === id);
        if (!room) return;

        if (removeBtn) {
            state.rooms = state.rooms.filter(r => r.id!== id);
            renderRooms();
            updateEstimate();
            autoSave();
            return;
        }

        if (editBtn) {
            e.preventDefault();
            createRoomModal();
            loadRoomToModal(room);
            if (roomModal) roomModal.show();
        }
    });

    DOM.extrasContainer?.addEventListener('input', (e) => {
        if (!e.target.classList.contains('extra-field')) return;
        const card = e.target.closest('[data-extra-id]');
        if (!card) return;
        const id = parseInt(card.dataset.extraId);
        const extra = state.extras.find(x => x.id === id);
        if (!extra) return;
        const field = e.target.dataset.field;
        extra[field] = (field === 'name' || field === 'unit')? e.target.value : parseNumber(e.target.value);
        updateEstimate();
        autoSave();
    });

    DOM.extrasContainer?.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-extra-btn')) return;
        const card = e.target.closest('[data-extra-id]');
        if (!card) return;
        const id = parseInt(card.dataset.extraId);
        state.extras = state.extras.filter(x => x.id!== id);
        renderExtrasList();
        updateEstimate();
        autoSave();
    });

    DOM.savedQuotes?.addEventListener('click', (e) => {
        const loadBtn = e.target.closest('.load-quote-btn');
        const delBtn = e.target.closest('.delete-quote-btn');
        if (loadBtn) loadQuote(loadBtn.dataset.id);
        if (delBtn) deleteQuote(delBtn.dataset.id);
    });

    document.getElementById('clearAllQuotesBtn')?.addEventListener('click', () => {
        if (window.bootstrap) new bootstrap.Modal(document.getElementById('deleteAllQuotesModal')).show();
    });

    document.getElementById('confirmDeleteAllQuotesBtn')?.addEventListener('click', () => {
        try {
            localStorage.removeItem(QUOTES_KEY);
            renderSavedQuotes();
            showToast('All quotes deleted', 2000, 'danger');
        } catch (e) {
            console.error('Failed to delete all quotes:', e);
            showToast('Delete failed', 2000, 'danger');
        }
        if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteAllQuotesModal'))?.hide();
    });

    document.getElementById('saveRoomBtn')?.addEventListener('click', () => {
        if (editingRoomId!== null) { updateRoomFromModal(); } else { addRoomFromModal(); }
        if (document.activeElement) document.activeElement.blur();
        roomModal?.hide();
        resetModalForm();
    });

    createRoomModal();
}

document.addEventListener('DOMContentLoaded', () => {
    state.isDarkMode = localStorage.getItem('perryTheme')!== 'light';
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';

    bindEvents();
    loadDraft();
    renderSavedQuotes();
    renderExtrasList();
    updateEstimate();
});














// ==========================================
// PERRY'S TILING CALCULATOR - ENGINE v5.1 (JMD)
// Fixed: waste calc, grout loop, renderRooms HTML
// ==========================================

const CURRENCY = 'JMD';

const PATTERNS = {
    'straight': {name: 'Straight Lay', multiplier: 1.0, waste: 0.10},
    'diagonal': {name: 'Diagonal', multiplier: 1.15, waste: 0.15},
    'herringbone': {name: 'Herringbone', multiplier: 1.30, waste: 0.20},
    'chevron': {name: 'Chevron', multiplier: 1.30, waste: 0.20},
    'basketweave': {name: 'Basketweave', multiplier: 1.25, waste: 0.20}
};

const TROWEL_COVERAGE = {'80': 80, '60': 60, '50': 50, '40': 40};

const TILE_PROFILES = {
    '3x6': { label: '3x6 Subway', length: 3, width: 6, thickness: 0.25 },
    '6x24': { label: '6x24 Plank', length: 6, width: 24, thickness: 0.375 },
    '12x12': { label: '12x12', length: 12, width: 12, thickness: 0.375 },
    '12x24': { label: '12x24', length: 12, width: 24, thickness: 0.375 },
    '24x24': { label: '24x24', length: 24, width: 24, thickness: 0.375 },
    '24x48': { label: '24x48 Large Format', length: 24, width: 48, thickness: 0.375 },
    'mosaic': { label: 'Mosaic Sheet', length: 12, width: 12, thickness: 0.25 }
};

const DEFAULT_GROUT_COVERAGE = {
    '24x24': 350, '24x48': 400, '12x24': 250, '12x12': 175,
    '6x24': 200, '3x6': 100, 'mosaic': 75
};

const ROOM_TYPES = [
    'Living Room', 'Dining Room', 'Kitchen Floor', 'Bedroom',
    'Bathroom', 'Bathroom Wall', 'Vanity Top', 'Backsplash',
    'Hallway', 'Foyer', 'Porch', 'Stairs', 'Other'
];

const EXTRA_SERVICES = [
    { id: 'remove_door', name: 'Remove & Reinstall Door', rate: 1000, unit: 'each' },
    { id: 'wall_floor_prep', name: 'Prepare Wall & Floor (batching)', rate: 35, unit: 'sqft' },
    { id: 'demo_tile', name: 'Demo Old Tile & Mortar', rate: 150, unit: 'sqft' },
    { id: 'remove_bath', name: 'Remove Bath/Tub', rate: 5000, unit: 'each' },
    { id: 'countertop', name: 'Countertop Install', rate: 15000, unit: 'each' },
    { id: 'skirting_tread', name: 'Skirting - Stair Tread', rate: 3500, unit: 'each' },
    { id: 'baseboard_install', name: 'Baseboard / Skirting Install', rate: 150, unit: 'lnft' },
    { id: 'cut_door_grill', name: 'Cut Door Grill', rate: 1000, unit: 'each' },
    { id: 'remove_furniture', name: 'Remove Furniture', rate: 6000, unit: 'room' },
    { id: 'floor_over', name: 'Floor Over (extra)', rate: 60, unit: 'sqft' },
    { id: 'tile_trim', name: 'Tile Trim', rate: 300, unit: 'lnft' },
    { id: 'border_install', name: 'Installing Border', rate: 300, unit: 'lnft' },
    { id: 'create_shower', name: 'Create Shower', rate: 5000, unit: 'each' },
    { id: 'create_curb', name: 'Create Curb', rate: 7000, unit: 'each' },
    { id: 'install_shower_drain', name: 'Install Shower Drain', rate: 3000, unit: 'each' },
    { id: 'remove_toilet', name: 'Remove Toilet', rate: 2000, unit: 'each' },
    { id: 'remove_basin', name: 'Remove Basin/Vanity', rate: 1500, unit: 'each' },
    { id: 'rent_demolition', name: 'Rent Demolition Hammer', rate: 4500, unit: 'each' }
];

const TILE_RATES = {
    'ceramic': { floor: 180, wall: 200 },
    'porcelain': { floor: 200, wall: 250 },
    'plank_porcelain': { floor: 250, wall: 300 },
    'mosaic': { floor: 300, wall: 350 },
    'travertine': { floor: 300, wall: 300 },
    'marble': { floor: 300, wall: 350 },
    'slate': { floor: 215, wall: 215 },
    'quarry': { floor: 280, wall: 280 },
    'large_format': { floor: 250, wall: 300 }
};

const TILE_TYPE_LABELS = {
    ceramic: 'Ceramic', porcelain: 'Porcelain', plank_porcelain: 'Plank Porcelain',
    mosaic: 'Mosaic', travertine: 'Travertine', marble: 'Marble',
    slate: 'Slate', quarry: 'Quarry', large_format: 'Large Format Tile'
};

const GROUT_BAG_COVERAGE = 100;

let state = {
    customerName: '', customerPhone: '', customerAddress: '', notes: '',
    isDarkMode: true, rooms: [], roomIdCounter: 0,
    quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
    quoteId: null, tileBoxCoverage: 10,
    mortarType: 'thinset', trowelSize: '60',
    jointWidth: 0.125,
    extras: [], extraIdCounter: 0, depositPercent: 0
};

let roomModal = null;
let quoteToDelete = null;
let editingRoomId = null;
const DRAFT_KEY = 'tilingDraft_v5_jmd';
const QUOTES_KEY = 'tilingQuotes_v5_jmd';

const DOM = {};

if (!window.bootstrap) console.warn("Bootstrap missing - modals will fail");

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-JM', {
        style: 'currency', currency: CURRENCY, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatSqft(sqft) { return `${parseFloat(sqft || 0).toFixed(1)} sqft`; }
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function parseNumber(value) { const num = parseFloat(value); return isNaN(num)? 0 : num; }
function safe(n) { return Number.isFinite(n)? n : 0; }

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function showToast(msg, delay = 3000, type = 'success') {
    const c = document.querySelector('.toast-container');
    if (!c) return;
    const id = `toast-${Date.now()}`;
    const bg = { success: 'bg-success', danger: 'bg-danger', info: 'bg-info' }[type] || 'bg-success';
    c.insertAdjacentHTML('beforeend',
        `<div id="${id}" class="toast align-items-center text-white ${bg} border-0">
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(msg)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`
    );
    const el = document.getElementById(id);
    if (el && window.bootstrap) { new bootstrap.Toast(el, { delay }).show(); }
}

function debounce(func, wait = 300) { let t; return function(...args) { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }

function getGroutCoveragePerBag(currentState) {
    if (!currentState.rooms.length) return 350;

    const profileAreas = {};
    currentState.rooms.forEach(r => {
        const area = safe(parseNumber(r.dim1) * parseNumber(r.dim2));
        const prof = r.tileProfile || '12x24';
        profileAreas[prof] = safe((profileAreas[prof] || 0) + area);
    });

    let dominantProfile = '12x24';
    let maxArea = 0;
    for (const [prof, area] of Object.entries(profileAreas)) {
        if (area > maxArea) {
            maxArea = area;
            dominantProfile = prof;
        }
    }

    const baseCoverage = DEFAULT_GROUT_COVERAGE[dominantProfile] || 350;
    const jointWidth = parseNumber(currentState.jointWidth) || 0.125;
    const safeJoint = Math.max(0.01, jointWidth);
    const scaledCoverage = baseCoverage * (0.125 / safeJoint);

    return Math.max(50, Math.min(600, scaledCoverage));
}

function calculateEstimate(customState = state) {
    const {rooms, waste, subtractSqft, tileBoxCoverage, mortarType, trowelSize, depositPercent} = customState;

    let totalGrossInstallArea = 0;
    let totalFloorArea = 0;
    let totalWallArea = 0;
    let exactThinsetBagsTotal = 0;
    let totalProjectBoxesCount = 0;

    const roomBreakdown = [];
    const globalWasteFactor = parseNumber(waste) / 100;
    const safeBoxCov = Math.max(1, parseNumber(tileBoxCoverage) || 10);

    rooms.forEach(room => {
        const d1 = parseNumber(room.dim1);
        const d2 = parseNumber(room.dim2);
        const baseArea = safe(d1 * d2);
        totalGrossInstallArea += baseArea;

        const isWall = room.surfaceType === 'wall';
        if (isWall) totalWallArea += baseArea;
        else totalFloorArea += baseArea;

        const tileType = room.tileType || 'ceramic';
        const defaultRate = isWall? (TILE_RATES[tileType]?.wall || 200) : (TILE_RATES[tileType]?.floor || 180);
        const baseRate = parseNumber(room.customRate) > 0? parseNumber(room.customRate) : defaultRate;
        const patternConfig = PATTERNS[room.pattern] || { name: 'Straight Lay', multiplier: 1.0, waste: 0.10 };

        // FIXED: Pattern waste + global waste, not max()
        const combinedWasteFactor = patternConfig.waste + globalWasteFactor;

        const heightAdder = (room.isHeight && isWall)? (60 * baseArea) : 0;
        const roomLaborTotal = safe((baseArea * baseRate * patternConfig.multiplier) + heightAdder);

        const trowelCov = parseNumber(trowelSize) || 60;
        let roomThinsetBags = mortarType === 'thinset'? (baseArea / trowelCov) : (baseArea / 100);
        if (isWall) roomThinsetBags *= 1.25;
        exactThinsetBagsTotal += safe(roomThinsetBags);

        const roomAreaWithWaste = baseArea * (1 + combinedWasteFactor);
        const roomBoxes = Math.ceil(roomAreaWithWaste / safeBoxCov);
        totalProjectBoxesCount += roomBoxes;

        roomBreakdown.push({
            id: room.id, name: room.name,
            tileType: TILE_TYPE_LABELS[tileType] || 'Ceramic',
            tileProfile: room.tileProfile || '12x24',
            baseArea, rate: baseRate, pattern: patternConfig.name,
            labor: roomLaborTotal, customRate: parseNumber(room.customRate) > 0,
            boxes: roomBoxes, surfaceType: isWall? 'Wall' : 'Floor',
            dim1: d1, dim2: d2, exactThinset: safe(roomThinsetBags)
        });
    });

    const totalGroutSqft = safe(totalFloorArea + totalWallArea);
    const groutCoverage = getGroutCoveragePerBag(customState);
    if (!groutCoverage || groutCoverage <= 0) {
        return { error: 'Invalid grout coverage. Check joint width.' };
    }
    const exactGroutBags = safe(totalGroutSqft / groutCoverage);
    const purchaseGroutBags = Math.ceil(exactGroutBags);

    let extrasTotal = 0;
    const extrasBreakdown = [];
    customState.extras.forEach(extra => {
        const qty = parseNumber(extra.quantity);
        const rate = parseNumber(extra.rate);
        const lineTotal = safe(qty * rate);
        extrasTotal += lineTotal;
        extrasBreakdown.push({ name: extra.name, quantity: qty, unit: extra.unit, rate, total: lineTotal });
    });

    const deductionSqft = parseNumber(subtractSqft);
    let totalLaborBeforeExtras = 0;
    let adjustedRoomBreakdown = [];

    if (deductionSqft > 0 && totalGrossInstallArea > 0) {
        const deductionRatio = Math.min(1, deductionSqft / totalGrossInstallArea);
        roomBreakdown.forEach(r => {
            const laborCredit = safe(r.labor * deductionRatio);
            const adjustedLabor = safe(r.labor - laborCredit);
            totalLaborBeforeExtras += adjustedLabor;
            adjustedRoomBreakdown.push({...r, labor: adjustedLabor, originalLabor: r.labor});
        });
    } else {
        totalLaborBeforeExtras = safe(roomBreakdown.reduce((sum, r) => sum + r.labor, 0));
        adjustedRoomBreakdown = roomBreakdown;
    }

    const netBillableArea = Math.max(0, totalGrossInstallArea - deductionSqft);
    let modifiedLaborSubtotal = safe(totalLaborBeforeExtras + extrasTotal);
    const deposit = safe(modifiedLaborSubtotal * (parseNumber(depositPercent) / 100));
    const balance = safe(modifiedLaborSubtotal - deposit);
    const purchaseThinsetBags = Math.ceil(exactThinsetBagsTotal);

    return {
        totalSqft: safe(netBillableArea),
        installArea: safe(totalGrossInstallArea),
        totalFloorArea: safe(totalFloorArea), totalWallArea: safe(totalWallArea),
        laborTotal: modifiedLaborSubtotal,
        grandTotal: modifiedLaborSubtotal,
        subtotal: modifiedLaborSubtotal,
        deposit, balance,
        exactThinsetBags: safe(exactThinsetBagsTotal),
        purchaseThinsetBags,
        exactGroutBags: safe(exactGroutBags), purchaseGroutBags,
        groutSqftTotal: totalGroutSqft,
        groutCoverageUsed: safe(groutCoverage),
        boxes: totalProjectBoxesCount,
        roomBreakdown: adjustedRoomBreakdown,
        extrasBreakdown, extrasTotal: safe(extrasTotal)
    };
}

function renderSummary(data) {
    setText('sqftOutLarge', safe(data.totalSqft).toFixed(1));
    setText('sqftOut', safe(data.totalSqft).toFixed(1));
    setText('totalProjectOut', formatCurrency(data.grandTotal));
    setText('laborCostOut', formatCurrency(data.laborTotal));
    setText('mortarOut', data.purchaseThinsetBags);
    setText('groutOut', data.purchaseGroutBags);
    setText('boxesOut', data.boxes);
    setText('mortarLabel', state.mortarType === 'thinset'? 'Thinset Bags' : 'Cement Bags');

    const depositDiv = DOM.depositSection;
    if (depositDiv) {
        if (data.deposit > 0) {
            setText('depositOut', formatCurrency(data.deposit));
            setText('balanceOut', formatCurrency(data.balance));
            depositDiv.style.display = 'block';
        } else {
            depositDiv.style.display = 'none';
        }
    }
}

function renderRoomsBreakdown(data) {
    const roomBreakdownList = DOM.roomBreakdownList;
    if (!roomBreakdownList) return;
    roomBreakdownList.innerHTML = data.roomBreakdown.map(r => {
        const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
        const dims = `${safe(r.dim1).toFixed(1)}×${safe(r.dim2).toFixed(1)}`;
        const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
        const laborDisplay = r.originalLabor
      ? `${formatCurrency(r.labor)} <small class="text-muted">(${formatCurrency(r.originalLabor)} before deduction)</small>`
            : formatCurrency(r.labor);
        return `
            <div class="mb-2 pb-2 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="fw-bold">${escapeHtml(r.name)} <span class="badge ${r.surfaceType === 'Wall'? 'bg-info' : 'bg-secondary'} ms-1">${r.surfaceType}</span></div>
                    <span class="badge bg-primary">${r.boxes} boxes</span>
                </div>
                <div class="d-flex justify-content-between small">
                    <span>Tile: ${escapeHtml(r.tileType)} - ${escapeHtml(profileLabel)}</span>
                </div>
                <div class="d-flex justify-content-between small">
                    <span>${dims} = ${formatSqft(r.baseArea)} @ ${rateText} - ${r.pattern}</span>
                    <span>${laborDisplay}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Thinset: ${Math.ceil(r.exactThinset)} bags (${safe(r.exactThinset).toFixed(2)} calc)</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderExtras(data) {
    const extrasDiv = DOM.extrasBreakdownList;
    const extrasSection = DOM.extrasSection;
    if (extrasDiv && extrasSection) {
        extrasDiv.innerHTML = data.extrasBreakdown.map(e =>
            `<div class="d-flex justify-content-between small mb-1">
                <span>${escapeHtml(e.name)}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)}</span>
                <span>${formatCurrency(e.total)}</span>
            </div>`
        ).join('');
        extrasSection.style.display = data.extrasBreakdown.length? 'block' : 'none';
    }
}

function renderMaterials(data) {
    const materialList = DOM.materialList;
    if (!materialList) return;
    const materials = [];
    if (data.purchaseThinsetBags > 0) {
        materials.push(`<li class="list-group-item d-flex justify-content-between">
            <span>${state.mortarType === 'thinset'? 'Thinset' : 'Cement'}</span>
            <span><strong>${data.purchaseThinsetBags} bags</strong> <small class="text-muted">(${safe(data.exactThinsetBags).toFixed(2)} calc)</small></span>
        </li>`);
    }
    if (data.purchaseGroutBags > 0) {
        materials.push(`<li class="list-group-item d-flex justify-content-between">
            <span>Grout</span>
            <span><strong>${data.purchaseGroutBags} bags</strong> <small class="text-muted">(${safe(data.exactGroutBags).toFixed(2)} calc @ ${safe(data.groutCoverageUsed).toFixed(0)} sqft/bag)</small></span>
        </li>`);
    }
    if (data.totalFloorArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Floor Area</span><span>${safe(data.totalFloorArea).toFixed(1)} sqft</span></li>`);
    if (data.totalWallArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Wall Area</span><span>${safe(data.totalWallArea).toFixed(1)} sqft</span></li>`);
    if (data.totalSqft > 0) materials.push(`<li class="list-group-item d-flex justify-content-between"><span>Tile Boxes Total</span><span>${data.boxes} boxes</span></li>`);
    materialList.innerHTML = materials.join('') || '<li class="list-group-item text-muted">No materials calculated yet</li>';
}

function renderClient() {
    const name = state.customerName.trim();
    const phone = state.customerPhone.trim();
    const info = DOM.clientInfo;
    if (info) {
        if (name || phone) {
            info.innerHTML = `<strong>${escapeHtml(name) || 'Customer'}</strong><br><small>${escapeHtml(phone) || ''}</small>`;
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    }
}

function updateEstimate() {
    const data = calculateEstimate();
    if (data.error) {
        showToast(data.error, 3000, 'danger');
        return;
    }
    renderSummary(data);
    renderRoomsBreakdown(data);
    renderExtras(data);
    renderMaterials(data);
    renderClient();
    if (DOM.emptyState) DOM.emptyState.style.display = state.rooms.length? 'none' : 'block';
}

function renderRooms() {
    const container = DOM.roomsContainer;
    if (!container) return;
    if (state.rooms.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">Click "Add Room" to start</p>';
        return;
    }
    container.innerHTML = state.rooms.map(room => {
        const isWall = room.surfaceType === 'wall';
        const profileLabel = TILE_PROFILES[room.tileProfile]?.label || room.tileProfile || '12x24';
        return `
        <div class="card room-card mb-2" data-room-id="${room.id}">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="w-50">
                        <input type="text" class="form-control form-control-sm fw-bold room-name border-0 bg-transparent p-0" value="${escapeHtml(room.name)}" data-field="name">
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary edit-room-btn" title="Edit Advanced"><i class="bi bi-pencil"></i> Advanced</button>
                        <button class="btn btn-sm btn-outline-danger remove-room-btn"><i class="bi bi-x"></i></button>
                    </div>
                </div>
                <div class="row g-2 align-items-center">
                    <div class="col-4">
                        <select class="form-select form-select-sm room-field fw-bold" data-field="surfaceType">
                            <option value="floor" ${!isWall? 'selected' : ''}>Floor</option>
                            <option value="wall" ${isWall? 'selected' : ''}>Wall</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text small px-1">${isWall? 'H' : 'L'}</span>
                            <input type="number" class="form-control room-field" data-field="dim1" value="${room.dim1 || ''}" placeholder="0" step="0.1">
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text small px-1">W</span>
                            <input type="number" class="form-control room-field" data-field="dim2" value="${room.dim2 || ''}" placeholder="0" step="0.1">
                        </div>
                    </div>
                </div>
                <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                    <span>${escapeHtml(TILE_TYPE_LABELS[room.tileType || 'ceramic'])} - ${escapeHtml(profileLabel)}</span>
                    <span class="fw-bold text-primary">${safe(parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1)} sqft</span>
                </div>
            </div>
        </div>
    `}).join('');
}

function addExtraService(service) {
    const id = state.extraIdCounter++;
    state.extras.push({ id, name: service.name, quantity: 1, rate: service.rate, unit: service.unit });
    renderExtrasList();
    updateEstimate();
    saveDraft();
}

function renderExtrasList() {
    const container = DOM.extrasContainer;
    if (!container) return;
    if (state.extras.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">No extras added</p>';
        return;
    }
    container.innerHTML = state.extras.map(extra => `
        <div class="card mb-2" data-extra-id="${extra.id}">
            <div class="card-body py-2">
                <div class="row g-2 align-items-center">
                    <div class="col-12 col-md-4">
                        <label class="form-label d-md-none small text-muted mb-0">Service</label>
                        <input type="text" class="form-control form-control-sm extra-field" data-field="name" value="${escapeHtml(extra.name)}">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Qty</label>
                        <input type="number" class="form-control form-control-sm extra-field" data-field="quantity" value="${extra.quantity}" step="0.1">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Amount</label>
                        <input type="number" class="form-control form-control-sm extra-field" data-field="rate" value="${extra.rate}">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Unit</label>
                        <select class="form-select form-select-sm extra-field" data-field="unit">
                            <option value="each" ${extra.unit === 'each'? 'selected' : ''}>each</option>
                            <option value="sqft" ${extra.unit === 'sqft'? 'selected' : ''}>sqft</option>
                            <option value="lnft" ${extra.unit === 'lnft'? 'selected' : ''}>lnft</option>
                            <option value="room" ${extra.unit === 'room'? 'selected' : ''}>room</option>
                        </select>
                    </div>
                    <div class="col-4 col-md-1 text-end">
                        <label class="form-label d-md-none small text-muted mb-0">Total</label>
                        <strong>${formatCurrency(extra.quantity * extra.rate)}</strong>
                    </div>
                    <div class="col-2 col-md-1 text-end">
                        <button class="btn btn-sm btn-outline-danger remove-extra-btn"><i class="bi bi-x"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function createRoomModal() {
    const modalEl = document.getElementById('addRoomModal');
    if (!modalEl ||!window.bootstrap) return;
    if (!roomModal) { roomModal = new bootstrap.Modal(modalEl); }
}

function resetModalForm() {
    editingRoomId = null;
    ['roomName','roomDim1','roomDim2','customRate'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const rt = document.getElementById('roomTileType'); if (rt) rt.value = 'ceramic';
    const tp = document.getElementById('roomTileProfile'); if (tp) tp.value = '12x24';
    const pt = document.getElementById('pattern'); if (pt) pt.value = 'straight';
    const ih = document.getElementById('isHeight'); if (ih) ih.checked = false;
    const surfaceFloor = document.getElementById('surfaceFloor'); if (surfaceFloor) surfaceFloor.checked = true;
    const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Set Space Metrics';
    const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Add Room';
}

function loadRoomToModal(room) {
    editingRoomId = room.id;
    document.getElementById('roomName').value = room.name || '';
    document.getElementById('roomDim1').value = room.dim1 || '';
    document.getElementById('roomDim2').value = room.dim2 || '';
    document.getElementById('roomTileType').value = room.tileType || 'ceramic';
    document.getElementById('roomTileProfile').value = room.tileProfile || '12x24';
    document.getElementById('customRate').value = room.customRate || '';
    document.getElementById('pattern').value = room.pattern || 'straight';
    document.getElementById('isHeight').checked = room.isHeight || false;
    if (room.surfaceType === 'wall') {
        document.getElementById('surfaceWall').checked = true;
    } else {
        document.getElementById('surfaceFloor').checked = true;
    }
    const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Edit Advanced Room Parameters';
    const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Save Changes';
}

function addRoomFromModal() {
    const id = state.roomIdCounter++;
    const surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
    const room = {
        id, name: document.getElementById('roomName').value || `Area ${state.rooms.length + 1}`,
        surfaceType, dim1: parseNumber(document.getElementById('roomDim1').value),
        dim2: parseNumber(document.getElementById('roomDim2').value),
        tileType: document.getElementById('roomTileType').value,
        tileProfile: document.getElementById('roomTileProfile').value,
        customRate: parseNumber(document.getElementById('customRate').value),
        pattern: document.getElementById('pattern').value,
        isHeight: document.getElementById('isHeight').checked
    };
    state.rooms.push(room);
    renderRooms();
    updateEstimate();
    saveDraft();
}

function updateRoomFromModal() {
    if (editingRoomId === null) return;
    const room = state.rooms.find(r => r.id === editingRoomId);
    if (!room) return;
    room.name = document.getElementById('roomName').value || room.name;
    room.surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
    room.dim1 = parseNumber(document.getElementById('roomDim1').value);
    room.dim2 = parseNumber(document.getElementById('roomDim2').value);
    room.tileType = document.getElementById('roomTileType').value;
    room.tileProfile = document.getElementById('roomTileProfile').value;
    room.customRate = parseNumber(document.getElementById('customRate').value);
    room.pattern = document.getElementById('pattern').value;
    room.isHeight = document.getElementById('isHeight').checked;
    showToast('Room parameters synced', 2000, 'success');
    renderRooms();
    updateEstimate();
    saveDraft();
}

function saveDraft() {
    try {
        const draft = {...state, savedAt: new Date().toISOString()};
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
        console.error('Failed to save draft:', e);
        showToast('Draft save failed', 2000, 'danger');
    }
}

function loadDraft() {
    try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (!draft) return;
        const parsed = JSON.parse(draft);
        const safeMerge = {
            customerName: parsed.customerName?? state.customerName,
            customerPhone: parsed.customerPhone?? state.customerPhone,
            customerAddress: parsed.customerAddress?? state.customerAddress,
            notes: parsed.notes?? state.notes,
            isDarkMode: parsed.isDarkMode?? state.isDarkMode,
            rooms: parsed.rooms?? state.rooms,
            roomIdCounter: parsed.roomIdCounter?? state.roomIdCounter,
            quoteDate: parsed.quoteDate?? state.quoteDate,
            waste: parseNumber(parsed.waste) || state.waste,
            subtractSqft: parseNumber(parsed.subtractSqft) || state.subtractSqft,
            quoteId: parsed.quoteId?? state.quoteId,
            tileBoxCoverage: parseNumber(parsed.tileBoxCoverage) || state.tileBoxCoverage,
            mortarType: parsed.mortarType?? state.mortarType,
            trowelSize: parsed.trowelSize?? state.trowelSize,
            jointWidth: parseNumber(parsed.jointWidth) || state.jointWidth,
            extras: parsed.extras?? state.extras,
            extraIdCounter: parsed.extraIdCounter?? state.extraIdCounter,
            depositPercent: parseNumber(parsed.depositPercent) || state.depositPercent
        };
        state = safeMerge;
        state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
        state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;

        ['customerName','customerPhone','customerAddress','notes'].forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = state[key];
        });
        ['mortarType','trowelSize','depositPercent','jointWidth','waste','subtractSqft','tileBoxCoverage'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = state[id];
        });
        const ts = document.getElementById('trowelSection');
        if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
        renderRooms();
        renderExtrasList();
        showToast(`Draft restored`, 2000, 'info');
    } catch (e) {
        console.error('Corrupted draft detected:', e);
        localStorage.removeItem(DRAFT_KEY);
        showToast('Corrupted draft cleared', 2000, 'danger');
    }
}

function saveQuote(asNew = false) {
    try {
        const quotes = getAllQuotes();
        const id = asNew ||!state.quoteId? `PERRY-${Date.now()}` : state.quoteId;
        const quote = {...state, id, savedAt: new Date().toISOString()};
        const existingIndex = quotes.findIndex(q => q.id === id);
        if (existingIndex >= 0) { quotes[existingIndex] = quote; } else { quotes.push(quote); }
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        state.quoteId = id;
        const qm = document.getElementById('quoteMode');
        if (qm) { qm.textContent = 'Saved Quote'; qm.className = 'badge bg-success'; }
        renderSavedQuotes();
        showToast(asNew? 'Quote saved as new configuration' : 'Quote modifications saved', 2000, 'success');
    } catch (e) {
        console.error('Failed to save quote:', e);
        showToast('Quote save failed', 2000, 'danger');
    }
}

function getAllQuotes() {
    try {
        const quotes = localStorage.getItem(QUOTES_KEY);
        return quotes? JSON.parse(quotes) : [];
    } catch (e) {
        console.error('Corrupted quotes detected:', e);
        localStorage.removeItem(QUOTES_KEY);
        showToast('Corrupted quotes cleared', 2000, 'danger');
        return [];
    }
}

function loadQuote(id) {
    const quotes = getAllQuotes();
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    const safeMerge = {
        customerName: quote.customerName?? state.customerName,
        customerPhone: quote.customerPhone?? state.customerPhone,
        customerAddress: quote.customerAddress?? state.customerAddress,
        notes: quote.notes?? state.notes,
        isDarkMode: quote.isDarkMode?? state.isDarkMode,
        rooms: quote.rooms?? state.rooms,
        roomIdCounter: quote.roomIdCounter?? state.roomIdCounter,
        quoteDate: quote.quoteDate?? state.quoteDate,
        waste: parseNumber(quote.waste) || state.waste,
        subtractSqft: parseNumber(quote.subtractSqft) || state.subtractSqft,
        quoteId: quote.id,
        tileBoxCoverage: parseNumber(quote.tileBoxCoverage) || state.tileBoxCoverage,
        mortarType: quote.mortarType?? state.mortarType,
        trowelSize: quote.trowelSize?? state.trowelSize,
        jointWidth: parseNumber(quote.jointWidth) || state.jointWidth,
        extras: quote.extras?? state.extras,
        extraIdCounter: quote.extraIdCounter?? state.extraIdCounter,
        depositPercent: parseNumber(quote.depositPercent) || state.depositPercent
    };
    state = safeMerge;

    state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
    state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;

    ['customerName','customerPhone','customerAddress','notes'].forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = state[key];
    });
    ['mortarType','trowelSize','depositPercent','jointWidth','waste','subtractSqft','tileBoxCoverage'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = state[id];
    });
    const ts = document.getElementById('trowelSection');
    if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
    const qm = document.getElementById('quoteMode');
    if (qm) { qm.textContent = 'Loaded Quote'; qm.className = 'badge bg-info'; }
    renderRooms();
    renderExtrasList();
    updateEstimate();
    showToast('Quote configuration loaded', 2000, 'info');
}

function deleteQuote(id) {
    quoteToDelete = id;
    if (window.bootstrap) {
        new bootstrap.Modal(document.getElementById('deleteQuoteModal')).show();
    }
}

function renderSavedQuotes() {
    const quotes = getAllQuotes();
    const section = DOM.savedSection;
    const container = DOM.savedQuotes;
    if (!section ||!container) return;
    if (quotes.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    container.innerHTML = quotes.map(q => {
        const calc = calculateEstimate(q);
        return `
        <div class="saved-quote-item p-2 border rounded mb-2">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${escapeHtml(q.customerName || 'Unnamed')}</strong>
                    <div class="small text-muted">${new Date(q.savedAt).toLocaleDateString('en-JM')} - ${formatCurrency(calc.grandTotal)}</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary load-quote-btn me-1" data-id="${q.id}">Load</button>
                    <button class="btn btn-sm btn-outline-danger delete-quote-btn" data-id="${q.id}">Del</button>
                </div>
            </div>
        </div>
    `}).join('');
}

function clearAll() {
    state = {
        customerName: '', customerPhone: '', customerAddress: '', notes: '',
        isDarkMode: state.isDarkMode, rooms: [], roomIdCounter: 0,
        quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
        quoteId: null, tileBoxCoverage: 10,
        mortarType: 'thinset', trowelSize: '60',
        jointWidth: 0.125,
        extras: [], extraIdCounter: 0,
        depositPercent: 0
    };
    ['customerName','customerPhone','customerAddress','notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const dp = document.getElementById('depositPercent'); if (dp) dp.value = '0';
    const jw = document.getElementById('jointWidth'); if (jw) jw.value = '0.125';
    const waste = document.getElementById('waste'); if (waste) waste.value = '10';
    const sub = document.getElementById('subtractSqft'); if (sub) sub.value = '0';
    const boxCov = document.getElementById('tileBoxCoverage'); if (boxCov) boxCov.value = '10';
    const qm = document.getElementById('quoteMode');
    if (qm) {
        qm.textContent = 'New Quote';
        qm.className = 'badge bg-secondary';
    }
    localStorage.removeItem(DRAFT_KEY);
    renderRooms();
    renderExtrasList();
    updateEstimate();
}

function bindEvents() {
    DOM.quoteDate = document.getElementById('quoteDate');
    DOM.estimateDate = document.getElementById('estimateDate');
    DOM.depositSection = document.getElementById('depositSection');
    DOM.roomBreakdownList = document.getElementById('roomBreakdownList');
    DOM.extrasBreakdownList = document.getElementById('extrasBreakdownList');
    DOM.extrasSection = document.getElementById('extrasSection');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.materialList = document.getElementById('materialList');
    DOM.clientInfo = document.getElementById('clientInfo');
    DOM.roomsContainer = document.getElementById('roomsContainer');
    DOM.extrasContainer = document.getElementById('extrasContainer');
    DOM.savedSection = document.getElementById('savedSection');
    DOM.savedQuotes = document.getElementById('savedQuotes');

    if (DOM.quoteDate) DOM.quoteDate.textContent = state.quoteDate;
    if (DOM.estimateDate) DOM.estimateDate.textContent = state.quoteDate;

    createRoomModal();

    const roomTypeMenu = document.getElementById('roomTypeMenu');
    if (roomTypeMenu) {
        roomTypeMenu.innerHTML = ROOM_TYPES.map(t =>
            `<li><a class="dropdown-item" href="#" data-room-type="${t}">${t}</a></li>`
        ).join('');
        roomTypeMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const item = e.target.closest('[data-room-type]');
            if (!item) return;
            const roomType = item.dataset.roomType;
            createRoomModal();
            resetModalForm();
            document.getElementById('roomName').value = roomType;
            const isWall = roomType.toLowerCase().includes('wall');
            const sf = document.getElementById('surfaceFloor'); if (sf) sf.checked =!isWall;
            const sw = document.getElementById('surfaceWall'); if (sw) sw.checked = isWall;
            if (roomModal) roomModal.show();
        });
    }

    const extraServicesMenu = document.getElementById('extraServicesMenu');
    if (extraServicesMenu) {
        const presetItems = EXTRA_SERVICES.map(s =>
            `<li><a class="dropdown-item d-flex justify-content-between align-items-center py-2" href="#" data-service-id="${s.id}">
                <span>${s.name}</span>
                <span class="badge bg-secondary ms-2">${formatCurrency(s.rate)}/${s.unit}</span>
            </a></li>`
        ).join('');

        extraServicesMenu.insertAdjacentHTML('afterbegin', presetItems);

        extraServicesMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const item = e.target.closest('[data-service-id]');
            if (item) {
                const service = EXTRA_SERVICES.find(s => s.id === item.dataset.serviceId);
                if (service) addExtraService(service);
                const toggle = e.target.closest('.dropdown')?.querySelector('.dropdown-toggle');
                bootstrap.Dropdown.getInstance(toggle)?.hide();
            }
        });
    }

    document.getElementById('addCustomExtraBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        addExtraService({ name: 'Custom Service', rate: 0, unit: 'each' });
        const toggle = e.target.closest('.dropdown')?.querySelector('.dropdown-toggle');
        bootstrap.Dropdown.getInstance(toggle)?.hide();
    });

    const roomTileType = document.getElementById('roomTileType');
    if (roomTileType) {
        roomTileType.innerHTML = Object.keys(TILE_RATES).map(t =>
            `<option value="${t}">${TILE_TYPE_LABELS[t]}</option>`
        ).join('');
    }

    const roomTileProfile = document.getElementById('roomTileProfile');
    if (roomTileProfile) {
        roomTileProfile.innerHTML = Object.keys(TILE_PROFILES).map(p =>
            `<option value="${p}">${TILE_PROFILES[p].label}</option>`
        ).join('');
    }

    const autoSave = debounce(() => saveDraft(), 1000);

    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let digits = e.target.value.replace(/\D/g, '');
            if (digits.length > 10) digits = digits.slice(0, 10);

            let formatted = digits;
            if (digits.length >= 7) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
            } else if (digits.length >= 4) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            }

            e.target.value = formatted;
            state.customerPhone = formatted;
            renderClient();
            autoSave();
        });

        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.endsWith('-')) {
                e.target.value = e.target.value.slice(0, -1);
                e.preventDefault();
            }
        });
    }

    ['customerName','customerAddress','notes','waste','subtractSqft','tileBoxCoverage','depositPercent','jointWidth'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            state[id] = id === 'waste' || id === 'subtractSqft' || id === 'tileBoxCoverage' || id === 'depositPercent' || id === 'jointWidth'
     ? parseNumber(e.target.value)
                : e.target.value;
            updateEstimate();
            autoSave();
        });
    });

    ['mortarType','trowelSize'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', (e) => {
            state[id] = e.target.value;
            if (id === 'mortarType') {
                const ts = document.getElementById('trowelSection');
                if (ts) ts.style.display = e.target.value === 'thinset'? 'block' : 'none';
            }
            updateEstimate();
            autoSave();
        });
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        state.isDarkMode =!state.isDarkMode;
        document.body.classList.toggle('dark-mode', state.isDarkMode);
        const ti = document.getElementById('themeIcon');
        if (ti) ti.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';
        localStorage.setItem('perryTheme', state.isDarkMode? 'dark' : 'light');
    });

    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        if (window.bootstrap) new bootstrap.Modal(document.getElementById('clearAllModal')).show();
    });

    document.getElementById('confirmClearBtn')?.addEventListener('click', () => {
        clearAll();
        if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('clearAllModal'))?.hide();
    });

    document.getElementById('confirmDeleteQuoteBtn')?.addEventListener('click', () => {
        if (quoteToDelete) {
            try {
                const quotes = getAllQuotes().filter(q => q.id!== quoteToDelete);
                localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
                renderSavedQuotes();
                showToast('Quote deleted', 2000, 'danger');
            } catch (e) {
                console.error('Failed to delete quote:', e);
                showToast('Delete failed', 2000, 'danger');
            }
            quoteToDelete = null;
            if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteQuoteModal'))?.hide();
        }
    });

    document.getElementById('saveQuoteBtn')?.addEventListener('click', () => saveQuote(false));
    document.getElementById('saveAsNewBtn')?.addEventListener('click', () => saveQuote(true));
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());

    document.getElementById('textQuoteBtn')?.addEventListener('click', () => {
        const data = calculateEstimate();
        if (data.error) {
            showToast(data.error, 3000, 'danger');
            return;
        }
        let msg = `Perry's Tiling Estimate\nCustomer: ${state.customerName}\n`;
        if (state.customerPhone) msg += `Phone: ${state.customerPhone}\n`;
        if (state.customerAddress) msg += `Address: ${state.customerAddress}\n`;
        msg += `\nLABOR BREAKDOWN\n`;

        data.roomBreakdown.forEach(r => {
            const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
            const dims = `${safe(r.dim1).toFixed(1)}×${safe(r.dim2).toFixed(1)}`;
            const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
            msg += `\n${r.name} [${r.surfaceType}]:\n`;
            msg += `Tile: ${r.tileType} - ${profileLabel}\n`;
            msg += `${dims} = ${safe(r.baseArea).toFixed(1)} sqft @ ${rateText} - ${r.pattern}\n`;
            msg += `Labor: ${formatCurrency(r.labor)}\n`;
            if (r.originalLabor) msg += `(Original: ${formatCurrency(r.originalLabor)})\n`;
            msg += `Boxes: ${r.boxes}\n`;
            msg += `Thinset: ${Math.ceil(r.exactThinset)} bags (${safe(r.exactThinset).toFixed(2)} calc)\n`;
        });

        if (data.extrasBreakdown.length > 0) {
            msg += `\nEXTRA SERVICES\n`;
            data.extrasBreakdown.forEach(e => {
                msg += `${e.name}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)} = ${formatCurrency(e.total)}\n`;
            });
        }

        msg += `\nTOTAL LABOR: ${formatCurrency(data.grandTotal)}\n`;
        if (data.deposit > 0) {
            msg += `DEPOSIT REQUIRED: ${formatCurrency(data.deposit)}\n`;
            msg += `BALANCE DUE: ${formatCurrency(data.balance)}\n`;
        }
        msg += `Billable Area: ${safe(data.totalSqft).toFixed(1)} sqft\n\n`;
        msg += `MATERIALS NEEDED (Client Supplies):\n`;
        msg += `${data.purchaseThinsetBags} ${state.mortarType} bags (${safe(data.exactThinsetBags).toFixed(2)} calculated)\n`;
        msg += `${data.purchaseGroutBags} grout bags (${safe(data.exactGroutBags).toFixed(2)} calculated @ ${safe(data.groutCoverageUsed).toFixed(0)} sqft/bag)\n`;
        msg += ` - Joint Width: ${safe(parseNumber(state.jointWidth) * 8).toFixed(0)}/8"\n`;
        msg += ` - Total Coverage: ${safe(data.groutSqftTotal).toFixed(1)} sqft\n`;
        msg += ` - Floor: ${safe(data.totalFloorArea).toFixed(1)} sqft | Wall: ${safe(data.totalWallArea).toFixed(1)} sqft\n`;
        msg += `${data.boxes} tile boxes total\n\n`;
        if (state.notes) msg += `Notes: ${state.notes}\n\n`;
        msg += `Labor only - Client supplies all materials\n`;
        msg += `Quote Date: ${state.quoteDate}\n`;
        msg += `Call Perry: 876-817-3377`;

        navigator.clipboard.writeText(msg);
        showToast('Quote copied to clipboard', 2000, 'success');
    });

    DOM.roomsContainer?.addEventListener('input', (e) => {
        if (!e.target.classList.contains('room-field') &&!e.target.classList.contains('room-name')) return;
        const card = e.target.closest('.room-card');
        if (!card) return;
        const id = parseInt(card.dataset.roomId);
        const room = state.rooms.find(r => r.id === id);
        if (!room) return;
        const field = e.target.dataset.field;
        let value = e.target.value;
        if (['dim1','dim2','customRate'].includes(field)) {
            value = value === ''? 0 : parseFloat(value) || 0;
        }
        room[field] = value;

        if (field === 'surfaceType') {
            renderRooms();
        } else {
            const badgeOut = card.querySelector('.text-primary');
            if (badgeOut) {
                const total = safe(parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1);
                badgeOut.textContent = `${total} sqft`;
            }
        }

        updateEstimate();
        autoSave();
    });

    DOM.roomsContainer?.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-room-btn');
        const removeBtn = e.target.closest('.remove-room-btn');
        const card = e.target.closest('.room-card');
        if (!card) return;

        const id = parseInt(card.dataset.roomId);
        const room = state.rooms.find(r => r.id === id);
        if (!room) return;

        if (removeBtn) {
            state.rooms = state.rooms.filter(r => r.id!== id);
            renderRooms();
            updateEstimate();
            autoSave();
            return;
        }

        if (editBtn) {
            e.preventDefault();
            createRoomModal();
            loadRoomToModal(room);
            if (roomModal) roomModal.show();
        }
    });

    DOM.extrasContainer?.addEventListener('input', (e) => {
        if (!e.target.classList.contains('extra-field')) return;
        const card = e.target.closest('[data-extra-id]');
        if (!card) return;
        const id = parseInt(card.dataset.extraId);
        const extra = state.extras.find(x => x.id === id);
        if (!extra) return;
        const field = e.target.dataset.field;
        extra[field] = (field === 'name' || field === 'unit')? e.target.value : parseNumber(e.target.value);
        updateEstimate();
        autoSave();
    });

    DOM.extrasContainer?.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-extra-btn')) return;
        const card = e.target.closest('[data-extra-id]');
        if (!card) return;
        const id = parseInt(card.dataset.extraId);
        state.extras = state.extras.filter(x => x.id!== id);
        renderExtrasList();
        updateEstimate();
        autoSave();
    });

    DOM.savedQuotes?.addEventListener('click', (e) => {
        const loadBtn = e.target.closest('.load-quote-btn');
        const delBtn = e.target.closest('.delete-quote-btn');
        if (loadBtn) loadQuote(loadBtn.dataset.id);
        if (delBtn) deleteQuote(delBtn.dataset.id);
    });

    document.getElementById('clearAllQuotesBtn')?.addEventListener('click', () => {
        if (window.bootstrap) new bootstrap.Modal(document.getElementById('deleteAllQuotesModal')).show();
    });

    document.getElementById('confirmDeleteAllQuotesBtn')?.addEventListener('click', () => {
        try {
            localStorage.removeItem(QUOTES_KEY);
            renderSavedQuotes();
            showToast('All quotes deleted', 2000, 'danger');
        } catch (e) {
            console.error('Failed to delete all quotes:', e);
            showToast('Delete failed', 2000, 'danger');
        }
        if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteAllQuotesModal'))?.hide();
    });

    document.getElementById('saveRoomBtn')?.addEventListener('click', () => {
        if (editingRoomId!== null) { updateRoomFromModal(); } else { addRoomFromModal(); }
        if (document.activeElement) document.activeElement.blur();
        roomModal?.hide();
        resetModalForm();
    });

    createRoomModal();
}

document.addEventListener('DOMContentLoaded', () => {
    state.isDarkMode = localStorage.getItem('perryTheme')!== 'light';
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';

    bindEvents();
    loadDraft();
    renderSavedQuotes();
    renderExtrasList();
    updateEstimate();
});














// ==========================================
// PERRY'S TILING CALCULATOR - ENGINE v5.3.1 (JMD)
// Fixed: Rounding at total only, grout calc bug, renderRooms HTML
// Fixed: labor vs material split, waste calc
// ==========================================

const CURRENCY = 'JMD';

const PATTERNS = {
    'straight': { name: 'Straight Lay', laborMultiplier: 1.0, materialWaste: 0.10 },
    'diagonal': { name: 'Diagonal', laborMultiplier: 1.15, materialWaste: 0.12 },
    'herringbone': { name: 'Herringbone', laborMultiplier: 1.30, materialWaste: 0.15 },
    'chevron': { name: 'Chevron', laborMultiplier: 1.30, materialWaste: 0.15 },
    'basketweave': { name: 'Basketweave', laborMultiplier: 1.25, materialWaste: 0.15 }
};

const TROWEL_COVERAGE = {'80': 80, '60': 60, '50': 50, '40': 40};

const TILE_PROFILES = {
    '3x6': { label: '3x6 Subway', length: 3, width: 6, thickness: 0.25 },
    '6x24': { label: '6x24 Plank', length: 6, width: 24, thickness: 0.375 },
    '12x12': { label: '12x12', length: 12, width: 12, thickness: 0.375 },
    '12x24': { label: '12x24', length: 12, width: 24, thickness: 0.375 },
    '24x24': { label: '24x24', length: 24, width: 24, thickness: 0.375 },
    '24x48': { label: '24x48 Large Format', length: 24, width: 48, thickness: 0.375 },
    'mosaic': { label: 'Mosaic Sheet', length: 12, width: 12, thickness: 0.25 }
};

const DEFAULT_GROUT_COVERAGE = {
    '24x24': 350, '24x48': 400, '12x24': 250, '12x12': 175,
    '6x24': 200, '3x6': 100, 'mosaic': 75
};

const ROOM_TYPES = [
    'Living Room', 'Dining Room', 'Kitchen Floor', 'Bedroom',
    'Bathroom', 'Bathroom Wall', 'Vanity Top', 'Backsplash',
    'Hallway', 'Foyer', 'Porch', 'Stairs', 'Other'
];

const EXTRA_SERVICES = [
    { id: 'remove_door', name: 'Remove & Reinstall Door', rate: 1000, unit: 'each' },
    { id: 'wall_floor_prep', name: 'Prepare Wall & Floor (batching)', rate: 35, unit: 'sqft' },
    { id: 'demo_tile', name: 'Demo Old Tile & Mortar', rate: 150, unit: 'sqft' },
    { id: 'remove_bath', name: 'Remove Bath/Tub', rate: 5000, unit: 'each' },
    { id: 'countertop', name: 'Countertop Install', rate: 15000, unit: 'each' },
    { id: 'skirting_tread', name: 'Skirting - Stair Tread', rate: 3500, unit: 'each' },
    { id: 'baseboard_install', name: 'Baseboard / Skirting Install', rate: 150, unit: 'lnft' },
    { id: 'cut_door_grill', name: 'Cut Door Grill', rate: 1000, unit: 'each' },
    { id: 'remove_furniture', name: 'Remove Furniture', rate: 6000, unit: 'room' },
    { id: 'floor_over', name: 'Floor Over (extra)', rate: 60, unit: 'sqft' },
    { id: 'tile_trim', name: 'Tile Trim', rate: 300, unit: 'lnft' },
    { id: 'border_install', name: 'Installing Border', rate: 300, unit: 'lnft' },
    { id: 'create_shower', name: 'Create Shower', rate: 5000, unit: 'each' },
    { id: 'create_curb', name: 'Create Curb', rate: 7000, unit: 'each' },
    { id: 'install_shower_drain', name: 'Install Shower Drain', rate: 3000, unit: 'each' },
    { id: 'remove_toilet', name: 'Remove Toilet', rate: 2000, unit: 'each' },
    { id: 'remove_basin', name: 'Remove Basin/Vanity', rate: 1500, unit: 'each' },
    { id: 'rent_demolition', name: 'Rent Demolition Hammer', rate: 4500, unit: 'each' }
];

const TILE_RATES = {
    'ceramic': { floor: 180, wall: 200 },
    'porcelain': { floor: 200, wall: 250 },
    'plank_porcelain': { floor: 250, wall: 300 },
    'mosaic': { floor: 300, wall: 350 },
    'travertine': { floor: 300, wall: 300 },
    'marble': { floor: 300, wall: 350 },
    'slate': { floor: 215, wall: 215 },
    'quarry': { floor: 280, wall: 280 },
    'large_format': { floor: 250, wall: 300 }
};

const TILE_TYPE_LABELS = {
    ceramic: 'Ceramic', porcelain: 'Porcelain', plank_porcelain: 'Plank Porcelain',
    mosaic: 'Mosaic', travertine: 'Travertine', marble: 'Marble',
    slate: 'Slate', quarry: 'Quarry', large_format: 'Large Format Tile'
};

const GROUT_BAG_COVERAGE = 100;

let state = {
    customerName: '', customerPhone: '', customerAddress: '', notes: '',
    isDarkMode: true, rooms: [], roomIdCounter: 0,
    quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
    quoteId: null, tileBoxCoverage: 10,
    mortarType: 'thinset', trowelSize: '60',
    jointWidth: 0.125,
    extras: [], extraIdCounter: 0, depositPercent: 0
};

let roomModal = null;
let quoteToDelete = null;
let editingRoomId = null;
const DRAFT_KEY = 'tilingDraft_v5_jmd';
const QUOTES_KEY = 'tilingQuotes_v5_jmd';

const DOM = {};

if (!window.bootstrap) console.warn("Bootstrap missing - modals will fail");

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-JM', {
        style: 'currency', currency: CURRENCY, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatSqft(sqft) { return `${parseFloat(sqft || 0).toFixed(1)} sqft`; }
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function parseNumber(value) { const num = parseFloat(value); return isNaN(num)? 0 : num; }
function safe(n) { return Number.isFinite(n)? n : 0; }

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function showToast(msg, delay = 3000, type = 'success') {
    const c = document.querySelector('.toast-container');
    if (!c) return;
    const id = `toast-${Date.now()}`;
    const bg = { success: 'bg-success', danger: 'bg-danger', info: 'bg-info' }[type] || 'bg-success';
    c.insertAdjacentHTML('beforeend',
        `<div id="${id}" class="toast align-items-center text-white ${bg} border-0">
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(msg)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`
    );
    const el = document.getElementById(id);
    if (el && window.bootstrap) { new bootstrap.Toast(el, { delay }).show(); }
}

function debounce(func, wait = 300) { let t; return function(...args) { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }

// FIXED: v5.3.1 - was overwriting profileAreas with a number
function getGroutCoveragePerBag(currentState) {
    if (!currentState.rooms.length) return 350;

    const profileAreas = {};
    currentState.rooms.forEach(r => {
        const area = safe(parseNumber(r.dim1) * parseNumber(r.dim2));
        const prof = r.tileProfile || '12x24';
        profileAreas[prof] = safe((profileAreas[prof] || 0) + area); // FIXED
    });

    let dominantProfile = '12x24';
    let maxArea = 0;
    for (const [prof, area] of Object.entries(profileAreas)) {
        if (area > maxArea) {
            maxArea = area;
            dominantProfile = prof;
        }
    }

    const baseCoverage = DEFAULT_GROUT_COVERAGE[dominantProfile] || 350;
    const jointWidth = parseNumber(currentState.jointWidth) || 0.125;
    const safeJoint = Math.max(0.01, jointWidth);
    const scaledCoverage = baseCoverage * (0.125 / safeJoint);

    return Math.max(50, Math.min(600, scaledCoverage));
}

function calculateEstimate(customState = state) {
    const {rooms, waste, subtractSqft, tileBoxCoverage, mortarType, trowelSize, depositPercent} = customState;

    let totalGrossInstallArea = 0;
    let totalFloorArea = 0;
    let totalWallArea = 0;
    let exactThinsetBagsTotal = 0;
    let totalProjectBoxesExact = 0; // v5.3: accumulate decimals

    const roomBreakdown = [];
    const globalWasteFactor = parseNumber(waste) / 100;
    const safeBoxCov = Math.max(1, parseNumber(tileBoxCoverage) || 10);

    rooms.forEach(room => {
        const d1 = parseNumber(room.dim1);
        const d2 = parseNumber(room.dim2);
        const baseArea = safe(d1 * d2);
        totalGrossInstallArea += baseArea;

        const isWall = room.surfaceType === 'wall';
        if (isWall) totalWallArea += baseArea;
        else totalFloorArea += baseArea;

        const tileType = room.tileType || 'ceramic';
        const defaultRate = isWall? (TILE_RATES[tileType]?.wall || 200) : (TILE_RATES[tileType]?.floor || 180);
        const baseRate = parseNumber(room.customRate) > 0? parseNumber(room.customRate) : defaultRate;
        const patternConfig = PATTERNS[room.pattern] || PATTERNS['straight'];

        const heightAdder = (room.isHeight && isWall)? (60 * baseArea) : 0;
        const roomLaborTotal = safe((baseArea * baseRate * patternConfig.laborMultiplier) + heightAdder);

        const trowelCov = parseNumber(trowelSize) || 60;
        let roomThinsetBags = mortarType === 'thinset'? (baseArea / trowelCov) : (baseArea / 100);
        if (isWall) roomThinsetBags *= 1.25;
        exactThinsetBagsTotal += safe(roomThinsetBags);

        const combinedWasteFactor = patternConfig.materialWaste + globalWasteFactor;
        const roomAreaWithWaste = baseArea * (1 + combinedWasteFactor);

        const roomBoxesExact = roomAreaWithWaste / safeBoxCov;
        totalProjectBoxesExact += roomBoxesExact;

        roomBreakdown.push({
            id: room.id, name: room.name,
            tileType: TILE_TYPE_LABELS[tileType] || 'Ceramic',
            tileProfile: room.tileProfile || '12x24',
            baseArea, rate: baseRate, pattern: patternConfig.name,
            labor: roomLaborTotal, customRate: parseNumber(room.customRate) > 0,
            boxesExact: roomBoxesExact,
            surfaceType: isWall? 'Wall' : 'Floor',
            dim1: d1, dim2: d2, exactThinset: safe(roomThinsetBags),
            laborMultiplier: patternConfig.laborMultiplier,
            materialWaste: patternConfig.materialWaste
        });
    });

    // v5.3 FIX: Round only once at the total level
    const INSTALLER_BUFFER = 0.5;
    const totalProjectBoxesRounded = Math.ceil(totalProjectBoxesExact + INSTALLER_BUFFER);

    const totalGroutSqft = safe(totalFloorArea + totalWallArea);
    const groutCoverage = getGroutCoveragePerBag(customState);
    if (!groutCoverage || groutCoverage <= 0) {
        return { error: 'Invalid grout coverage. Check joint width.' };
    }
    const exactGroutBags = safe(totalGroutSqft / groutCoverage);
    const purchaseGroutBags = Math.ceil(exactGroutBags);

    let extrasTotal = 0;
    const extrasBreakdown = [];
    customState.extras.forEach(extra => {
        const qty = parseNumber(extra.quantity);
        const rate = parseNumber(extra.rate);
        const lineTotal = safe(qty * rate);
        extrasTotal += lineTotal;
        extrasBreakdown.push({ name: extra.name, quantity: qty, unit: extra.unit, rate, total: lineTotal });
    });

    const deductionSqft = parseNumber(subtractSqft);
    let totalLaborBeforeExtras = 0;
    let adjustedRoomBreakdown = [];

    if (deductionSqft > 0 && totalGrossInstallArea > 0) {
        const deductionRatio = Math.min(1, deductionSqft / totalGrossInstallArea);
        roomBreakdown.forEach(r => {
            const laborCredit = safe(r.labor * deductionRatio);
            const adjustedLabor = safe(r.labor - laborCredit);
            totalLaborBeforeExtras += adjustedLabor;
            adjustedRoomBreakdown.push({...r, labor: adjustedLabor, originalLabor: r.labor});
        });
    } else {
        totalLaborBeforeExtras = safe(roomBreakdown.reduce((sum, r) => sum + r.labor, 0));
        adjustedRoomBreakdown = roomBreakdown;
    }

    const netBillableArea = Math.max(0, totalGrossInstallArea - deductionSqft);
    let modifiedLaborSubtotal = safe(totalLaborBeforeExtras + extrasTotal);
    const deposit = safe(modifiedLaborSubtotal * (parseNumber(depositPercent) / 100));
    const balance = safe(modifiedLaborSubtotal - deposit);
    const purchaseThinsetBags = Math.ceil(exactThinsetBagsTotal);

    return {
        totalSqft: safe(netBillableArea),
        installArea: safe(totalGrossInstallArea),
        totalFloorArea: safe(totalFloorArea), totalWallArea: safe(totalWallArea),
        laborTotal: modifiedLaborSubtotal,
        grandTotal: modifiedLaborSubtotal,
        subtotal: modifiedLaborSubtotal,
        deposit, balance,
        exactThinsetBags: safe(exactThinsetBagsTotal),
        purchaseThinsetBags,
        exactGroutBags: safe(exactGroutBags), purchaseGroutBags,
        groutSqftTotal: totalGroutSqft,
        groutCoverageUsed: safe(groutCoverage),
        boxes: totalProjectBoxesRounded,
        boxesExact: safe(totalProjectBoxesExact),
        roomBreakdown: adjustedRoomBreakdown,
        extrasBreakdown, extrasTotal: safe(extrasTotal)
    };
}

function renderSummary(data) {
    setText('sqftOutLarge', safe(data.totalSqft).toFixed(1));
    setText('sqftOut', safe(data.totalSqft).toFixed(1));
    setText('totalProjectOut', formatCurrency(data.grandTotal));
    setText('laborCostOut', formatCurrency(data.laborTotal));
    setText('mortarOut', data.purchaseThinsetBags);
    setText('groutOut', data.purchaseGroutBags);
    setText('boxesOut', data.boxes);
    setText('mortarLabel', state.mortarType === 'thinset'? 'Thinset Bags' : 'Cement Bags');

    const depositDiv = DOM.depositSection;
    if (depositDiv) {
        if (data.deposit > 0) {
            setText('depositOut', formatCurrency(data.deposit));
            setText('balanceOut', formatCurrency(data.balance));
            depositDiv.style.display = 'block';
        } else {
            depositDiv.style.display = 'none';
        }
    }
}

function renderRoomsBreakdown(data) {
    const roomBreakdownList = DOM.roomBreakdownList;
    if (!roomBreakdownList) return;
    roomBreakdownList.innerHTML = data.roomBreakdown.map(r => {
        const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
        const dims = `${safe(r.dim1).toFixed(1)}×${safe(r.dim2).toFixed(1)}`;
        const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
        const laborDisplay = r.originalLabor
          ? `${formatCurrency(r.labor)} <small class="text-muted">(${formatCurrency(r.originalLabor)} before deduction)</small>`
            : formatCurrency(r.labor);
        const laborPct = ((r.laborMultiplier - 1) * 100).toFixed(0);
        const wastePct = (r.materialWaste * 100).toFixed(0);
        const boxesDisplay = safe(r.boxesExact).toFixed(2);
        return `
            <div class="mb-2 pb-2 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="fw-bold">${escapeHtml(r.name)} <span class="badge ${r.surfaceType === 'Wall'? 'bg-info' : 'bg-secondary'} ms-1">${r.surfaceType}</span></div>
                    <span class="badge bg-primary">${boxesDisplay} boxes</span>
                </div>
                <div class="d-flex justify-content-between small">
                    <span>Tile: ${escapeHtml(r.tileType)} - ${escapeHtml(profileLabel)}</span>
                </div>
                <div class="d-flex justify-content-between small">
                    <span>${dims} = ${formatSqft(r.baseArea)} @ ${rateText}</span>
                    <span>${laborDisplay}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>${r.pattern}: +${laborPct}% labor, +${wastePct}% waste</span>
                    <span>Thinset: ${Math.ceil(r.exactThinset)} bags</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderExtras(data) {
    const extrasDiv = DOM.extrasBreakdownList;
    const extrasSection = DOM.extrasSection;
    if (extrasDiv && extrasSection) {
        extrasDiv.innerHTML = data.extrasBreakdown.map(e =>
            `<div class="d-flex justify-content-between small mb-1">
                <span>${escapeHtml(e.name)}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)}</span>
                <span>${formatCurrency(e.total)}</span>
            </div>`
        ).join('');
        extrasSection.style.display = data.extrasBreakdown.length? 'block' : 'none';
    }
}

function renderMaterials(data) {
    const materialList = DOM.materialList;
    if (!materialList) return;
    const materials = [];
    if (data.purchaseThinsetBags > 0) {
        materials.push(`<li class="list-group-item d-flex justify-content-between">
            <span>${state.mortarType === 'thinset'? 'Thinset' : 'Cement'}</span>
            <span><strong>${data.purchaseThinsetBags} bags</strong> <small class="text-muted">(${safe(data.exactThinsetBags).toFixed(2)} calc)</small></span>
        </li>`);
    }
    if (data.purchaseGroutBags > 0) {
        materials.push(`<li class="list-group-item d-flex justify-content-between">
            <span>Grout</span>
            <span><strong>${data.purchaseGroutBags} bags</strong> <small class="text-muted">(${safe(data.exactGroutBags).toFixed(2)} calc @ ${safe(data.groutCoverageUsed).toFixed(0)} sqft/bag)</small></span>
        </li>`);
    }
    if (data.totalFloorArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Floor Area</span><span>${safe(data.totalFloorArea).toFixed(1)} sqft</span></li>`);
    if (data.totalWallArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Wall Area</span><span>${safe(data.totalWallArea).toFixed(1)} sqft</span></li>`);
    if (data.totalSqft > 0) {
        materials.push(`<li class="list-group-item d-flex justify-content-between">
            <span>Tile Boxes Total</span>
            <span><strong>${data.boxes} boxes</strong> <small class="text-muted">(${safe(data.boxesExact).toFixed(2)} exact)</small></span>
        </li>`);
    }
    materialList.innerHTML = materials.join('') || '<li class="list-group-item text-muted">No materials calculated yet</li>';
}

function renderClient() {
    const name = state.customerName.trim();
    const phone = state.customerPhone.trim();
    const info = DOM.clientInfo;
    if (info) {
        if (name || phone) {
            info.innerHTML = `<strong>${escapeHtml(name) || 'Customer'}</strong><br><small>${escapeHtml(phone) || ''}</small>`;
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    }
}

function updateEstimate() {
    const data = calculateEstimate();
    if (data.error) {
        showToast(data.error, 3000, 'danger');
        return;
    }
    renderSummary(data);
    renderRoomsBreakdown(data);
    renderExtras(data);
    renderMaterials(data);
    renderClient();
    if (DOM.emptyState) DOM.emptyState.style.display = state.rooms.length? 'none' : 'block';
}

// FIXED: v5.3.1 - missing </div> tag was breaking everything
function renderRooms() {
    const container = DOM.roomsContainer;
    if (!container) return;
    if (state.rooms.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">Click "Add Room" to start</p>';
        return;
    }
    container.innerHTML = state.rooms.map(room => {
        const isWall = room.surfaceType === 'wall';
        const profileLabel = TILE_PROFILES[room.tileProfile]?.label || room.tileProfile || '12x24';
        return `
        <div class="card room-card mb-2" data-room-id="${room.id}">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="w-50">
                        <input type="text" class="form-control form-control-sm fw-bold room-name border-0 bg-transparent p-0" value="${escapeHtml(room.name)}" data-field="name">
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary edit-room-btn" title="Edit Advanced"><i class="bi bi-pencil"></i> Advanced</button>
                        <button class="btn btn-sm btn-outline-danger remove-room-btn"><i class="bi bi-x"></i></button>
                    </div>
                </div>
                <div class="row g-2 align-items-center">
                    <div class="col-4">
                        <select class="form-select form-select-sm room-field fw-bold" data-field="surfaceType">
                            <option value="floor" ${!isWall? 'selected' : ''}>Floor</option>
                            <option value="wall" ${isWall? 'selected' : ''}>Wall</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text small px-1">${isWall? 'H' : 'L'}</span>
                            <input type="number" class="form-control room-field" data-field="dim1" value="${room.dim1 || ''}" placeholder="0" step="0.1">
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text small px-1">W</span>
                            <input type="number" class="form-control room-field" data-field="dim2" value="${room.dim2 || ''}" placeholder="0" step="0.1">
                        </div>
                    </div>
                </div>
                <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                    <span>${escapeHtml(TILE_TYPE_LABELS[room.tileType || 'ceramic'])} - ${escapeHtml(profileLabel)}</span>
                    <span class="fw-bold text-primary">${safe(parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1)} sqft</span>
                </div>
            </div>
        </div>
    `}).join('');
}

function addExtraService(service) {
    const id = state.extraIdCounter++;
    state.extras.push({ id, name: service.name, quantity: 1, rate: service.rate, unit: service.unit });
    renderExtrasList();
    updateEstimate();
    saveDraft();
}

function renderExtrasList() {
    const container = DOM.extrasContainer;
    if (!container) return;
    if (state.extras.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">No extras added</p>';
        return;
    }
    container.innerHTML = state.extras.map(extra => `
        <div class="card mb-2" data-extra-id="${extra.id}">
            <div class="card-body py-2">
                <div class="row g-2 align-items-center">
                    <div class="col-12 col-md-4">
                        <label class="form-label d-md-none small text-muted mb-0">Service</label>
                        <input type="text" class="form-control form-control-sm extra-field" data-field="name" value="${escapeHtml(extra.name)}">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Qty</label>
                        <input type="number" class="form-control form-control-sm extra-field" data-field="quantity" value="${extra.quantity}" step="0.1">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Amount</label>
                        <input type="number" class="form-control form-control-sm extra-field" data-field="rate" value="${extra.rate}">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label d-md-none small text-muted mb-0">Unit</label>
                        <select class="form-select form-select-sm extra-field" data-field="unit">
                            <option value="each" ${extra.unit === 'each'? 'selected' : ''}>each</option>
                            <option value="sqft" ${extra.unit === 'sqft'? 'selected' : ''}>sqft</option>
                            <option value="lnft" ${extra.unit === 'lnft'? 'selected' : ''}>lnft</option>
                            <option value="room" ${extra.unit === 'room'? 'selected' : ''}>room</option>
                        </select>
                    </div>
                    <div class="col-4 col-md-1 text-end">
                        <label class="form-label d-md-none small text-muted mb-0">Total</label>
                        <strong>${formatCurrency(extra.quantity * extra.rate)}</strong>
                    </div>
                    <div class="col-2 col-md-1 text-end">
                        <button class="btn btn-sm btn-outline-danger remove-extra-btn"><i class="bi bi-x"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function createRoomModal() {
    const modalEl = document.getElementById('addRoomModal');
    if (!modalEl ||!window.bootstrap) return;
    if (!roomModal) { roomModal = new bootstrap.Modal(modalEl); }
}

function resetModalForm() {
    editingRoomId = null;
    ['roomName','roomDim1','roomDim2','customRate'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const rt = document.getElementById('roomTileType'); if (rt) rt.value = 'ceramic';
    const tp = document.getElementById('roomTileProfile'); if (tp) tp.value = '12x24';
    const pt = document.getElementById('pattern'); if (pt) pt.value = 'straight';
    const ih = document.getElementById('isHeight'); if (ih) ih.checked = false;
    const surfaceFloor = document.getElementById('surfaceFloor'); if (surfaceFloor) surfaceFloor.checked = true;
    const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Set Space Metrics';
    const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Add Room';
}

function loadRoomToModal(room) {
    editingRoomId = room.id;
    document.getElementById('roomName').value = room.name || '';
    document.getElementById('roomDim1').value = room.dim1 || '';
    document.getElementById('roomDim2').value = room.dim2 || '';
    document.getElementById('roomTileType').value = room.tileType || 'ceramic';
    document.getElementById('roomTileProfile').value = room.tileProfile || '12x24';
    document.getElementById('customRate').value = room.customRate || '';
    document.getElementById('pattern').value = room.pattern || 'straight';
    document.getElementById('isHeight').checked = room.isHeight || false;
    if (room.surfaceType === 'wall') {
        document.getElementById('surfaceWall').checked = true;
    } else {
        document.getElementById('surfaceFloor').checked = true;
    }
    const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Edit Advanced Room Parameters';
    const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Save Changes';
}

function addRoomFromModal() {
    const id = state.roomIdCounter++;
    const surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
    const room = {
        id, name: document.getElementById('roomName').value || `Area ${state.rooms.length + 1}`,
        surfaceType, dim1: parseNumber(document.getElementById('roomDim1').value),
        dim2: parseNumber(document.getElementById('roomDim2').value),
        tileType: document.getElementById('roomTileType').value,
        tileProfile: document.getElementById('roomTileProfile').value,
        customRate: parseNumber(document.getElementById('customRate').value),
        pattern: document.getElementById('pattern').value,
        isHeight: document.getElementById('isHeight').checked
    };
    state.rooms.push(room);
    renderRooms();
    updateEstimate();
    saveDraft();
}

function updateRoomFromModal() {
    if (editingRoomId === null) return;
    const room = state.rooms.find(r => r.id === editingRoomId);
    if (!room) return;
    room.name = document.getElementById('roomName').value || room.name;
    room.surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
    room.dim1 = parseNumber(document.getElementById('roomDim1').value);
    room.dim2 = parseNumber(document.getElementById('roomDim2').value);
    room.tileType = document.getElementById('roomTileType').value;
    room.tileProfile = document.getElementById('roomTileProfile').value;
    room.customRate = parseNumber(document.getElementById('customRate').value);
    room.pattern = document.getElementById('pattern').value;
    room.isHeight = document.getElementById('isHeight').checked;
    showToast('Room parameters synced', 2000, 'success');
    renderRooms();
    updateEstimate();
    saveDraft();
}

function saveDraft() {
    try {
        const draft = {...state, savedAt: new Date().toISOString()};
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
        console.error('Failed to save draft:', e);
        showToast('Draft save failed', 2000, 'danger');
    }
}

function saveQuote(asNew = false) {
    try {
        const quotes = getAllQuotes();
        const id = asNew ||!state.quoteId? `PERRY-${Date.now()}` : state.quoteId;
        const quote = {...state, id, savedAt: new Date().toISOString()};
        const existingIndex = quotes.findIndex(q => q.id === id);
        if (existingIndex >= 0) { quotes[existingIndex] = quote; } else { quotes.push(quote); }
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        state.quoteId = id;
        const qm = document.getElementById('quoteMode');
        if (qm) { qm.textContent = 'Saved Quote'; qm.className = 'badge bg-success'; }
        renderSavedQuotes();
        showToast(asNew? 'Quote saved as new configuration' : 'Quote modifications saved', 2000, 'success');
    } catch (e) {
        console.error('Failed to save quote:', e);
        showToast('Quote save failed', 2000, 'danger');
    }
}


function bindEvents() {
    DOM.quoteDate = document.getElementById('quoteDate');
    DOM.estimateDate = document.getElementById('estimateDate');
    DOM.depositSection = document.getElementById('depositSection');
    DOM.roomBreakdownList = document.getElementById('roomBreakdownList');
    DOM.extrasBreakdownList = document.getElementById('extrasBreakdownList');
    DOM.extrasSection = document.getElementById('extrasSection');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.materialList = document.getElementById('materialList');
    DOM.clientInfo = document.getElementById('clientInfo');
    DOM.roomsContainer = document.getElementById('roomsContainer');
    DOM.extrasContainer = document.getElementById('extrasContainer');
    DOM.savedSection = document.getElementById('savedSection');
        DOM.savedQuotes = document.getElementById('savedQuotes');

    if (DOM.quoteDate) DOM.quoteDate.textContent = state.quoteDate;
    if (DOM.estimateDate) DOM.estimateDate.textContent = state.quoteDate;

    createRoomModal();

    const roomTypeMenu = document.getElementById('roomTypeMenu');
    if (roomTypeMenu) {
        roomTypeMenu.innerHTML = ROOM_TYPES.map(t =>
            `<li><a class="dropdown-item" href="#" data-room-type="${t}">${t}</a></li>`
        ).join('');
        roomTypeMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const item = e.target.closest('[data-room-type]');
            if (!item) return;
            const roomType = item.dataset.roomType;
            createRoomModal();
            resetModalForm();
            document.getElementById('roomName').value = roomType;
            const isWall = roomType.toLowerCase().includes('wall');
            const sf = document.getElementById('surfaceFloor'); if (sf) sf.checked =!isWall;
            const sw = document.getElementById('surfaceWall'); if (sw) sw.checked = isWall;
            if (roomModal) roomModal.show();
        });
    }

    const extraServicesMenu = document.getElementById('extraServicesMenu');
    if (extraServicesMenu) {
        const presetItems = EXTRA_SERVICES.map(s =>
            `<li><a class="dropdown-item d-flex justify-content-between align-items-center py-2" href="#" data-service-id="${s.id}">
                <span>${s.name}</span>
                <span class="badge bg-secondary ms-2">${formatCurrency(s.rate)}/${s.unit}</span>
            </a></li>`
        ).join('');

        extraServicesMenu.insertAdjacentHTML('afterbegin', presetItems);

        extraServicesMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const item = e.target.closest('[data-service-id]');
            if (item) {
                const service = EXTRA_SERVICES.find(s => s.id === item.dataset.serviceId);
                if (service) addExtraService(service);
                const toggle = e.target.closest('.dropdown')?.querySelector('.dropdown-toggle');
                if (toggle && window.bootstrap) bootstrap.Dropdown.getInstance(toggle)?.hide();
            }
        });
    }

    document.getElementById('addCustomExtraBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        addExtraService({ name: 'Custom Service', rate: 0, unit: 'each' });
        const toggle = e.target.closest('.dropdown')?.querySelector('.dropdown-toggle');
        if (toggle && window.bootstrap) bootstrap.Dropdown.getInstance(toggle)?.hide();
    });

    const roomTileType = document.getElementById('roomTileType');
    if (roomTileType) {
        roomTileType.innerHTML = Object.keys(TILE_RATES).map(t =>
            `<option value="${t}">${TILE_TYPE_LABELS[t]}</option>`
        ).join('');
    }

    const roomTileProfile = document.getElementById('roomTileProfile');
    if (roomTileProfile) {
        roomTileProfile.innerHTML = Object.keys(TILE_PROFILES).map(p =>
            `<option value="${p}">${TILE_PROFILES[p].label}</option>`
        ).join('');
    }

    const autoSave = debounce(() => saveDraft(), 1000);

    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let digits = e.target.value.replace(/\D/g, '');
            if (digits.length > 10) digits = digits.slice(0, 10);

            let formatted = digits;
            if (digits.length >= 7) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
            } else if (digits.length >= 4) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            }

            e.target.value = formatted;
            state.customerPhone = formatted;
            renderClient();
            autoSave();
        });

        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.endsWith('-')) {
                e.target.value = e.target.value.slice(0, -1);
                e.preventDefault();
            }
        });
    }

    ['customerName','customerAddress','notes','waste','subtractSqft','tileBoxCoverage','depositPercent','jointWidth'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            state[id] = id === 'waste' || id === 'subtractSqft' || id === 'tileBoxCoverage' || id === 'depositPercent' || id === 'jointWidth'
             ? parseNumber(e.target.value)
                : e.target.value;
            updateEstimate();
            autoSave();
        });
    });

    ['mortarType','trowelSize'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', (e) => {
            state[id] = e.target.value;
            if (id === 'mortarType') {
                const ts = document.getElementById('trowelSection');
                if (ts) ts.style.display = e.target.value === 'thinset'? 'block' : 'none';
            }
            updateEstimate();
            autoSave();
        });
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        state.isDarkMode =!state.isDarkMode;
        document.body.classList.toggle('dark-mode', state.isDarkMode);
        const ti = document.getElementById('themeIcon');
        if (ti) ti.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';
        localStorage.setItem('perryTheme', state.isDarkMode? 'dark' : 'light');
    });

    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        if (window.bootstrap) new bootstrap.Modal(document.getElementById('clearAllModal')).show();
    });

    document.getElementById('confirmClearBtn')?.addEventListener('click', () => {
        clearAll();
        if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('clearAllModal'))?.hide();
    });

    document.getElementById('confirmDeleteQuoteBtn')?.addEventListener('click', () => {
        if (quoteToDelete) {
            try {
                const quotes = getAllQuotes().filter(q => q.id!== quoteToDelete);
                localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
                renderSavedQuotes();
                showToast('Quote deleted', 2000, 'danger');
            } catch (e) {
                console.error('Failed to delete quote:', e);
                showToast('Delete failed', 2000, 'danger');
            }
            quoteToDelete = null;
            if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteQuoteModal'))?.hide();
        }
    });

    document.getElementById('saveQuoteBtn')?.addEventListener('click', () => saveQuote(false));
    document.getElementById('saveAsNewBtn')?.addEventListener('click', () => saveQuote(true));
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());

    document.getElementById('textQuoteBtn')?.addEventListener('click', () => {
        const data = calculateEstimate();
        if (data.error) {
            showToast(data.error, 3000, 'danger');
            return;
        }
        let msg = `Perry's Tiling Estimate\nCustomer: ${state.customerName}\n`;
        if (state.customerPhone) msg += `Phone: ${state.customerPhone}\n`;
        if (state.customerAddress) msg += `Address: ${state.customerAddress}\n`;
        msg += `\nLABOR BREAKDOWN\n`;

        data.roomBreakdown.forEach(r => {
            const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
            const dims = `${safe(r.dim1).toFixed(1)}×${safe(r.dim2).toFixed(1)}`;
            const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
            const laborPct = ((r.laborMultiplier - 1) * 100).toFixed(0);
            const wastePct = (r.materialWaste * 100).toFixed(0);
            msg += `\n${r.name} [${r.surfaceType}]:\n`;
            msg += `Tile: ${r.tileType} - ${profileLabel}\n`;
            msg += `${dims} = ${safe(r.baseArea).toFixed(1)} sqft @ ${rateText}\n`;
            msg += `Pattern: ${r.pattern} (+${laborPct}% labor, +${wastePct}% waste)\n`;
            msg += `Labor: ${formatCurrency(r.labor)}\n`;
            if (r.originalLabor) msg += `(Original: ${formatCurrency(r.originalLabor)})\n`;
            msg += `Boxes: ${safe(r.boxesExact).toFixed(2)} exact\n`;
            msg += `Thinset: ${Math.ceil(r.exactThinset)} bags (${safe(r.exactThinset).toFixed(2)} calc)\n`;
        });

        if (data.extrasBreakdown.length > 0) {
            msg += `\nEXTRA SERVICES\n`;
            data.extrasBreakdown.forEach(e => {
                msg += `${e.name}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)} = ${formatCurrency(e.total)}\n`;
            });
        }

        msg += `\nTOTAL LABOR: ${formatCurrency(data.grandTotal)}\n`;
        if (data.deposit > 0) {
            msg += `DEPOSIT REQUIRED: ${formatCurrency(data.deposit)}\n`;
            msg += `BALANCE DUE: ${formatCurrency(data.balance)}\n`;
        }
        msg += `Billable Area: ${safe(data.totalSqft).toFixed(1)} sqft\n\n`;
        msg += `MATERIALS NEEDED (Client Supplies):\n`;
        msg += `${data.purchaseThinsetBags} ${state.mortarType} bags (${safe(data.exactThinsetBags).toFixed(2)} calculated)\n`;
        msg += `${data.purchaseGroutBags} grout bags (${safe(data.exactGroutBags).toFixed(2)} calculated @ ${safe(data.groutCoverageUsed).toFixed(0)} sqft/bag)\n`;
        msg += ` - Joint Width: ${safe(parseNumber(state.jointWidth) * 8).toFixed(0)}/8"\n`;
        msg += ` - Total Coverage: ${safe(data.groutSqftTotal).toFixed(1)} sqft\n`;
        msg += ` - Floor: ${safe(data.totalFloorArea).toFixed(1)} sqft | Wall: ${safe(data.totalWallArea).toFixed(1)} sqft\n`;
        msg += `${data.boxes} tile boxes total (${safe(data.boxesExact).toFixed(2)} exact + buffer)\n\n`;
        if (state.notes) msg += `Notes: ${state.notes}\n\n`;
        msg += `Labor only - Client supplies all materials\n`;
        msg += `Quote Date: ${state.quoteDate}\n`;
        msg += `Call Perry: 876-817-3377`;

        navigator.clipboard.writeText(msg);
        showToast('Quote copied to clipboard', 2000, 'success');
    });

    DOM.roomsContainer?.addEventListener('input', (e) => {
        if (!e.target.classList.contains('room-field') &&!e.target.classList.contains('room-name')) return;
        const card = e.target.closest('.room-card');
        if (!card) return;
        const id = parseInt(card.dataset.roomId);
        const room = state.rooms.find(r => r.id === id);
        if (!room) return;
        const field = e.target.dataset.field;
        let value = e.target.value;
        if (['dim1','dim2','customRate'].includes(field)) {
            value = value === ''? 0 : parseFloat(value) || 0;
        }
        room[field] = value;

        if (field === 'surfaceType') {
            renderRooms();
        } else {
            const badgeOut = card.querySelector('.text-primary');
            if (badgeOut) {
                const total = safe(parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1);
                badgeOut.textContent = `${total} sqft`;
            }
        }

        updateEstimate();
        autoSave();
    });

    DOM.roomsContainer?.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-room-btn');
        const removeBtn = e.target.closest('.remove-room-btn');
        const card = e.target.closest('.room-card');
        if (!card) return;

        const id = parseInt(card.dataset.roomId);
        const room = state.rooms.find(r => r.id === id);
        if (!room) return;

        if (removeBtn) {
            state.rooms = state.rooms.filter(r => r.id!== id);
            renderRooms();
            updateEstimate();
            autoSave();
            return;
        }

        if (editBtn) {
            e.preventDefault();
            createRoomModal();
            loadRoomToModal(room);
            if (roomModal) roomModal.show();
        }
    });

    DOM.extrasContainer?.addEventListener('input', (e) => {
        if (!e.target.classList.contains('extra-field')) return;
        const card = e.target.closest('[data-extra-id]');
        if (!card) return;
        const id = parseInt(card.dataset.extraId);
        const extra = state.extras.find(x => x.id === id);
        if (!extra) return;
        const field = e.target.dataset.field;
        extra[field] = (field === 'name' || field === 'unit')? e.target.value : parseNumber(e.target.value);
        updateEstimate();
        autoSave();
    });

    DOM.extrasContainer?.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-extra-btn')) return;
        const card = e.target.closest('[data-extra-id]');
        if (!card) return;
        const id = parseInt(card.dataset.extraId);
        state.extras = state.extras.filter(x => x.id!== id);
        renderExtrasList();
        updateEstimate();
        autoSave();
    });

    DOM.savedQuotes?.addEventListener('click', (e) => {
        const loadBtn = e.target.closest('.load-quote-btn');
        const delBtn = e.target.closest('.delete-quote-btn');
        if (loadBtn) loadQuote(loadBtn.dataset.id);
        if (delBtn) deleteQuote(delBtn.dataset.id);
    });

    document.getElementById('clearAllQuotesBtn')?.addEventListener('click', () => {
        if (window.bootstrap) new bootstrap.Modal(document.getElementById('deleteAllQuotesModal')).show();
    });

    document.getElementById('confirmDeleteAllQuotesBtn')?.addEventListener('click', () => {
        try {
            localStorage.removeItem(QUOTES_KEY);
            renderSavedQuotes();
            showToast('All quotes deleted', 2000, 'danger');
        } catch (e) {
            console.error('Failed to delete all quotes:', e);
            showToast('Delete failed', 2000, 'danger');
        }
        if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteAllQuotesModal'))?.hide();
    });

    document.getElementById('saveRoomBtn')?.addEventListener('click', () => {
        if (editingRoomId!== null) { updateRoomFromModal(); } else { addRoomFromModal(); }
        if (document.activeElement) document.activeElement.blur();
        roomModal?.hide();
        resetModalForm();
    });

    createRoomModal();
}

document.addEventListener('DOMContentLoaded', () => {
    state.isDarkMode = localStorage.getItem('perryTheme')!== 'light';
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';

    bindEvents();
    loadDraft();
    renderSavedQuotes();
    renderExtrasList();
    updateEstimate();
});