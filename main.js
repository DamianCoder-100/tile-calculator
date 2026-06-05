// const CURRENCY = 'JMD';

// const PATTERNS = {
//     'straight': {name: 'Straight Lay', multiplier: 1.0, waste: 0.10},
//     'diagonal': {name: 'Diagonal', multiplier: 1.15, waste: 0.15},
//     'herringbone': {name: 'Herringbone', multiplier: 1.30, waste: 0.20},
//     'chevron': {name: 'Chevron', multiplier: 1.30, waste: 0.20},
//     'basketweave': {name: 'Basketweave', multiplier: 1.25, waste: 0.20}
// };

// const TROWEL_COVERAGE = {'80': 80, '60': 60, '50': 50, '40': 40};

// const ROOM_TYPES = [
//     'Living Room', 'Dining Room', 'Kitchen Floor', 'Bedroom',
//     'Bathroom', 'Bathroom Wall', 'Vanity Top', 'Backsplash',
//     'Hallway', 'Foyer', 'Porch', 'Stairs', 'Other'
// ];

// const EXTRA_SERVICES = [
//     { id: 'remove_door', name: 'Remove & Reinstall Door', rate: 1000, unit: 'each' },
//     { id: 'wall_floor_prep', name: 'Prepare Wall & Floor (batching)', rate: 35, unit: 'sqft' },
//     { id: 'demo_tile', name: 'Demo Old Tile & Mortar', rate: 150, unit: 'sqft' },
//     { id: 'remove_bath', name: 'Remove Bath/Tub', rate: 5000, unit: 'each' },
//     { id: 'countertop', name: 'Countertop Install', rate: 15000, unit: 'each' },
//     { id: 'skirting_tread', name: 'Skirting - Stair Tread', rate: 3500, unit: 'each' },
//     { id: 'baseboard_install', name: 'Baseboard / Skirting Install', rate: 150, unit: 'lnft' },
//     { id: 'cut_door_grill', name: 'Cut Door Grill', rate: 1000, unit: 'each' },
//     { id: 'remove_furniture', name: 'Remove Furniture', rate: 6000, unit: 'room' },
//     { id: 'floor_over', name: 'Floor Over (extra)', rate: 60, unit: 'sqft' },
//     { id: 'tile_trim', name: 'Tile Trim', rate: 300, unit: 'lnft' },
//     { id: 'border_install', name: 'Installing Border', rate: 300, unit: 'lnft' },
//     { id: 'create_shower', name: 'Create Shower', rate: 5000, unit: 'each' },
//     { id: 'create_curb', name: 'Create Curb', rate: 7000, unit: 'each' },
//     { id: 'install_shower_drain', name: 'Install Shower Drain', rate: 3000, unit: 'each' },
//     { id: 'remove_toilet', name: 'Remove Toilet', rate: 2000, unit: 'each' },
//     { id: 'remove_basin', name: 'Remove Basin/Vanity', rate: 1500, unit: 'each' },
//     { id: 'rent_demolition', name: 'Rent Demolition Hammer', rate: 4500, unit: 'each' }
// ];

// const TILE_RATES = {
//     'ceramic': { floor: 180, wall: 200 },
//     'porcelain': { floor: 200, wall: 250 },
//     'plank_porcelain': { floor: 250, wall: 300 },
//     'mosaic': { floor: 300, wall: 350 },
//     'travertine': { floor: 300, wall: 300 },
//     'marble': { floor: 300, wall: 350 },
//     'slate': { floor: 215, wall: 215 },
//     'quarry': { floor: 280, wall: 280 },
//     'large_format': { floor: 250, wall: 300 }
// };

// const TILE_TYPE_LABELS = {
//     ceramic: 'Ceramic',
//     porcelain: 'Porcelain',
//     plank_porcelain: 'Plank Porcelain',
//     mosaic: 'Mosaic',
//     travertine: 'Travertine',
//     marble: 'Marble',
//     slate: 'Slate',
//     quarry: 'Quarry',
//     large_format: 'Large Format Tile'
// };

// let state = {
//     customerName: '', customerPhone: '', customerAddress: '', notes: '',
//     isDarkMode: true, rooms: [], roomIdCounter: 0,
//     quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
//     quoteId: null, tileBoxCoverage: 10, groutJoint: 0.125,
//     mortarType: 'thinset', trowelSize: '60',
//     extras: [],
//     extraIdCounter: 0,
//     depositPercent: 0
// };

// let roomModal = null;
// let quoteToDelete = null;
// let editingRoomId = null;
// const DRAFT_KEY = 'tilingDraft_v3_jmd';
// const QUOTES_KEY = 'tilingQuotes_v3_jmd';

// // ===== UTILS =====
// function formatCurrency(amount) {
//     return new Intl.NumberFormat('en-JM', {
//         style: 'currency',
//         currency: CURRENCY,
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0
//     }).format(amount || 0);
// }

// function formatSqft(sqft) { return `${parseFloat(sqft || 0).toFixed(1)} sqft`; }
// function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
// function parseNumber(value) { const num = parseFloat(value); return isNaN(num) ? 0 : num; }

// function showToast(msg, delay = 3000, type = 'success') {
//     const c = document.querySelector('.toast-container');
//     if (!c) return;
//     const id = `toast-${Date.now()}`;
//     const bg = { success: 'bg-success', danger: 'bg-danger', info: 'bg-info' }[type] || 'bg-success';
//     c.insertAdjacentHTML('beforeend',
//         `<div id="${id}" class="toast align-items-center text-white ${bg} border-0">
//             <div class="d-flex">
//                 <div class="toast-body">${escapeHtml(msg)}</div>
//                 <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
//             </div>
//         </div>`
//     );
//     const el = document.getElementById(id);
//     if (el && window.bootstrap) {
//         new bootstrap.Toast(el, { delay }).show();
//     }
// }

// function debounce(func, wait = 300) { let t; return function(...args) { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }

// // ===== CORE LOGIC =====
// function calculateEstimate() {
//     const {rooms, waste, subtractSqft, tileBoxCoverage, groutJoint, mortarType, trowelSize, depositPercent} = state;
//     let installArea = 0, laborTotal = 0;
    
//     // 1. These variables will accumulate the exact fractional amounts across all rooms
//     let exactThinsetBagsTotal = 0;
//     let exactGroutBagsTotal = 0;
//     const roomBreakdown = [];

//     rooms.forEach(room => {
//         const length = parseNumber(room.length);
//         const width = parseNumber(room.width);
//         const height = parseNumber(room.height);

//         const isWall = room.surfaceType === 'wall';
//         const baseArea = isWall ? (height * width) : (length * width);

//         const tileType = room.tileType || 'ceramic';
//         const defaultRate = isWall
//             ? (TILE_RATES[tileType]?.wall || 200)
//             : (TILE_RATES[tileType]?.floor || 180);

//         const baseRate = parseNumber(room.customRate) > 0
//             ? parseNumber(room.customRate)
//             : defaultRate;

//         const patternConfig = PATTERNS[room.pattern] || { name: 'Straight Lay', multiplier: 1.0 };
//         const difficultyMult = patternConfig.multiplier;
        
//         const heightAdder = (room.isHeight && isWall) ? (60 * baseArea) : 0;
//         let labor = (baseArea * baseRate * difficultyMult) + heightAdder;

//         // 2. Calculate raw material consumption for this room (No rounding yet!)
//         const trowelCov = parseNumber(trowelSize) || 60;
//         let roomThinsetBags = mortarType === 'thinset'
//             ? (baseArea / trowelCov)
//             : (baseArea / 100);

//         const jointDecimal = parseNumber(groutJoint) || 0.125;
//         let roomGroutBags = (baseArea / 100) * (jointDecimal / 0.125);

//         // Adjust for wall waste factor if applicable
//         if (isWall) {
//             roomThinsetBags *= 1.25;
//             roomGroutBags *= 1.10;
//         }

//         // 3. Add the raw exact room numbers directly into our project pool totals
//         exactThinsetBagsTotal += roomThinsetBags;
//         exactGroutBagsTotal += roomGroutBags;
        
//         installArea += baseArea;
//         laborTotal += labor;

//         const roomAreaWithWaste = baseArea * (1 + parseNumber(waste) / 100);
//         const roomBoxes = Math.ceil(roomAreaWithWaste / (parseNumber(tileBoxCoverage) || 10));

//         roomBreakdown.push({
//             id: room.id,
//             name: room.name,
//             tileSize: room.tileSize,
//             tileType: TILE_TYPE_LABELS[tileType] || 'Ceramic',
//             baseArea: baseArea,
//             rate: baseRate,
//             pattern: patternConfig.name,
//             labor: labor,
//             customRate: parseNumber(room.customRate) > 0,
//             boxes: roomBoxes,
//             surfaceType: isWall ? 'Wall' : 'Floor'
//         });
//     });

//     let extrasTotal = 0;
//     const extrasBreakdown = [];
//     state.extras.forEach(extra => {
//         const qty = parseNumber(extra.quantity);
//         const rate = parseNumber(extra.rate);
//         const lineTotal = qty * rate;
//         extrasTotal += lineTotal;
//         extrasBreakdown.push({
//             name: extra.name,
//             quantity: qty,
//             unit: extra.unit,
//             rate: rate,
//             total: lineTotal
//         });
//     });

//     laborTotal += extrasTotal;

//     const billableArea = Math.max(0, installArea - parseNumber(subtractSqft));
//     const tileAreaWithWaste = installArea * (1 + parseNumber(waste) / 100);
//     const boxes = Math.ceil(tileAreaWithWaste / (parseNumber(tileBoxCoverage) || 10));

//     const deposit = laborTotal * (parseNumber(depositPercent) / 100);
//     const balance = laborTotal - deposit;

//     // 4. CRITICAL FIX: Math.ceil is applied ONCE here at the very end.
//     // All leftovers are combined, and the final combined total is rounded to the next whole bag.
//     return {
//         totalSqft: billableArea,
//         installArea: installArea,
//         tileAreaWithWaste,
//         laborTotal,
//         grandTotal: laborTotal,
//         subtotal: laborTotal,
//         deposit,
//         balance,
//         thinsetBags: Math.ceil(exactThinsetBagsTotal),
//         groutBags: Math.ceil(exactGroutBagsTotal),
//         boxes,
//         roomBreakdown,
//         extrasBreakdown,
//         extrasTotal
//     };
// }


// // function calculateEstimate() {
// //     const {rooms, waste, subtractSqft, tileBoxCoverage, groutJoint, mortarType, trowelSize, depositPercent} = state;
// //     let installArea = 0, laborTotal = 0, thinsetBags = 0, groutBags = 0;
// //     const roomBreakdown = [];

// //     rooms.forEach(room => {
// //         const length = parseNumber(room.length);
// //         const width = parseNumber(room.width);
// //         const height = parseNumber(room.height);

// //         const isWall = room.surfaceType === 'wall';
// //         const baseArea = isWall ? (height * width) : (length * width);

// //         const tileType = room.tileType || 'ceramic';
// //         const defaultRate = isWall
// //             ? (TILE_RATES[tileType]?.wall || 200)
// //             : (TILE_RATES[tileType]?.floor || 180);

// //         const baseRate = parseNumber(room.customRate) > 0
// //             ? parseNumber(room.customRate)
// //             : defaultRate;

// //         // Clean lookup directly from source master configurations
// //         const patternConfig = PATTERNS[room.pattern] || { name: 'Straight Lay', multiplier: 1.0 };
// //         const difficultyMult = patternConfig.multiplier;
        
// //         // Safety Patch: Height premiums strictly bound to wall surface variables
// //         const heightAdder = (room.isHeight && isWall) ? (60 * baseArea) : 0;

// //         let labor = (baseArea * baseRate * difficultyMult) + heightAdder;

// //         // Base Bag Factors
// //         const trowelCov = parseNumber(trowelSize) || 60;
// //         let roomThinsetBags = mortarType === 'thinset'
// //             ? (baseArea / trowelCov)
// //             : (baseArea / 100);

// //         const jointDecimal = parseNumber(groutJoint) || 0.125;
// //         let roomGroutBags = (baseArea / 100) * (jointDecimal / 0.125);

// //         // Safety Patch: Scale consumption up for wall installations (back-buttering waste adjustments)
// //         if (isWall) {
// //             roomThinsetBags *= 1.25;
// //             roomGroutBags *= 1.10;
// //         }

// //         thinsetBags += Math.ceil(roomThinsetBags);
// //         groutBags += Math.ceil(roomGroutBags);
// //         installArea += baseArea;
// //         laborTotal += labor;

// //         const roomAreaWithWaste = baseArea * (1 + parseNumber(waste) / 100);
// //         const roomBoxes = Math.ceil(roomAreaWithWaste / (parseNumber(tileBoxCoverage) || 10));

// //         roomBreakdown.push({
// //             id: room.id,
// //             name: room.name,
// //             tileSize: room.tileSize,
// //             tileType: TILE_TYPE_LABELS[tileType] || 'Ceramic',
// //             baseArea: baseArea,
// //             rate: baseRate,
// //             pattern: patternConfig.name,
// //             labor: labor,
// //             customRate: parseNumber(room.customRate) > 0,
// //             boxes: roomBoxes,
// //             surfaceType: isWall ? 'Wall' : 'Floor'
// //         });
// //     });

// //     let extrasTotal = 0;
// //     const extrasBreakdown = [];
// //     state.extras.forEach(extra => {
// //         const qty = parseNumber(extra.quantity);
// //         const rate = parseNumber(extra.rate);
// //         const lineTotal = qty * rate;
// //         extrasTotal += lineTotal;
// //         extrasBreakdown.push({
// //             name: extra.name,
// //             quantity: qty,
// //             unit: extra.unit,
// //             rate: rate,
// //             total: lineTotal
// //         });
// //     });

// //     laborTotal += extrasTotal;

// //     const billableArea = Math.max(0, installArea - parseNumber(subtractSqft));
// //     const tileAreaWithWaste = installArea * (1 + parseNumber(waste) / 100);
// //     const boxes = Math.ceil(tileAreaWithWaste / (parseNumber(tileBoxCoverage) || 10));

// //     const deposit = laborTotal * (parseNumber(depositPercent) / 100);
// //     const balance = laborTotal - deposit;

// //     return {
// //         totalSqft: billableArea,
// //         installArea: installArea,
// //         tileAreaWithWaste,
// //         laborTotal,
// //         grandTotal: laborTotal,
// //         subtotal: laborTotal,
// //         deposit,
// //         balance,
// //         thinsetBags,
// //         groutBags,
// //         boxes,
// //         roomBreakdown,
// //         extrasBreakdown,
// //         extrasTotal
// //     };
// // }














// // THIS ONE IS GOOD FOR REFERENCE - IT SHOWS THE STEP-BY-STEP CALCULATION WITH INTERMEDIATE VARIABLES EXPOSED, BUT IT LEADS TO INCONSISTENT MATERIAL TALLYING DUE TO PER-ROOM ROUNDING. THE FINAL VERSION COMBINES ALL RAW MATERIAL NUMBERS FIRST AND THEN ROUNDS ONCE AT THE END, ENSURING ACCURATE TOTALS.

// // ===== RENDER =====
// function updateEstimate() {
//     const data = calculateEstimate();
    
//     const elements = {
//         sqftOutLarge: data.totalSqft.toFixed(1),
//         sqftOut: data.totalSqft.toFixed(1),
//         totalProjectOut: formatCurrency(data.grandTotal),
//         laborCostOut: formatCurrency(data.laborTotal),
//         mortarOut: data.thinsetBags,
//         groutOut: data.groutBags,
//         boxesOut: data.boxes,
//         mortarLabel: state.mortarType === 'thinset' ? 'Thinset Bags' : 'Cement Bags'
//     };

//     Object.entries(elements).forEach(([id, val]) => {
//         const el = document.getElementById(id);
//         if (el) el.textContent = val;
//     });

//     const depositDiv = document.getElementById('depositSection');
//     if (depositDiv) {
//         if (data.deposit > 0) {
//             const depOut = document.getElementById('depositOut');
//             const balOut = document.getElementById('balanceOut');
//             if (depOut) depOut.textContent = formatCurrency(data.deposit);
//             if (balOut) balOut.textContent = formatCurrency(data.balance);
//             depositDiv.style.display = 'block';
//         } else {
//             depositDiv.style.display = 'none';
//         }
//     }

//     const roomBreakdownList = document.getElementById('roomBreakdownList');
//     if (roomBreakdownList) {
//         roomBreakdownList.innerHTML = data.roomBreakdown.map(r => {
//             const rateText = r.customRate ? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
//             return `
//                 <div class="mb-2 pb-2 border-bottom">
//                     <div class="d-flex justify-content-between align-items-center">
//                         <div class="fw-bold">${escapeHtml(r.name)} <span class="badge ${r.surfaceType === 'Wall' ? 'bg-info' : 'bg-secondary'} ms-1">${r.surfaceType}</span></div>
//                         <span class="badge bg-primary">${r.boxes} boxes</span>
//                     </div>
//                     <div class="d-flex justify-content-between small">
//                         <span>Tile: ${escapeHtml(r.tileType)} - ${escapeHtml(r.tileSize)}</span>
//                     </div>
//                     <div class="d-flex justify-content-between small">
//                         <span>${formatSqft(r.baseArea)} @ ${rateText} - ${r.pattern}</span>
//                         <span>${formatCurrency(r.labor)}</span>
//                     </div>
//                 </div>
//             `;
//         }).join('');
//     }

//     const extrasDiv = document.getElementById('extrasBreakdownList');
//     const extrasSection = document.getElementById('extrasSection');
//     if (extrasDiv && extrasSection) {
//         extrasDiv.innerHTML = data.extrasBreakdown.map(e =>
//             `<div class="d-flex justify-content-between small mb-1">
//                 <span>${escapeHtml(e.name)}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)}</span>
//                 <span>${formatCurrency(e.total)}</span>
//             </div>`
//         ).join('');
//         extrasSection.style.display = data.extrasBreakdown.length ? 'block' : 'none';
//     }

//     updateClientInfo();
    
//     const emptyState = document.getElementById('emptyState');
//     if (emptyState) emptyState.style.display = state.rooms.length ? 'none' : 'block';

//     const materialList = document.getElementById('materialList');
//     if (materialList) {
//         const materials = [];
//         if (data.thinsetBags > 0) materials.push(`<li class="list-group-item d-flex justify-content-between"><span>${state.mortarType === 'thinset' ? 'Thinset' : 'Cement'}</span><span>${data.thinsetBags} bags</span></li>`);
//         if (data.groutBags > 0) materials.push(`<li class="list-group-item d-flex justify-content-between"><span>Grout</span><span>${data.groutBags} bags</span></li>`);
//         if (data.totalSqft > 0) materials.push(`<li class="list-group-item d-flex justify-content-between"><span>Tile Boxes Total</span><span>${data.boxes} boxes</span></li>`);
//         materialList.innerHTML = materials.join('') || '<li class="list-group-item text-muted">No materials calculated yet</li>';
//     }
// }

// function updateClientInfo() {
//     const name = state.customerName.trim();
//     const phone = state.customerPhone.trim();
//     const info = document.getElementById('clientInfo');
//     if (info) {
//         if (name || phone) {
//             info.innerHTML = `<strong>${escapeHtml(name) || 'Customer'}</strong><br><small>${escapeHtml(phone) || ''}</small>`;
//             info.style.display = 'block';
//         } else {
//             info.style.display = 'none';
//         }
//     }
// }

// function renderRooms() {
//     const container = document.getElementById('roomsContainer');
//     if (!container) return;
//     if (state.rooms.length === 0) {
//         container.innerHTML = '<p class="text-muted text-center mb-0">Click "Add Room" to start</p>';
//         return;
//     }
//     container.innerHTML = state.rooms.map(room => {
//         const isWall = room.surfaceType === 'wall';
//         return `
//         <div class="card room-card mb-2" data-room-id="${room.id}">
//             <div class="card-body">
//                 <div class="d-flex justify-content-between align-items-center mb-2">
//                     <div>
//                         <input type="text" class="form-control form-control-sm fw-bold room-name mb-1" value="${escapeHtml(room.name)}" data-field="name">
//                         <span class="badge bg-secondary">
//                             ${escapeHtml(room.tileType ? TILE_TYPE_LABELS[room.tileType] : 'Ceramic')} -
//                             ${escapeHtml(room.tileSize)}
//                         </span>
//                     </div>
//                     <div class="d-flex gap-1">
//                         <button class="btn btn-sm btn-outline-primary edit-room-btn"><i class="bi bi-pencil"></i></button>
//                         <button class="btn btn-sm btn-outline-danger remove-room-btn"><i class="bi bi-x"></i></button>
//                     </div>
//                 </div>
//                 <div class="row g-2">
//                     <div class="col-md-3 col-6">
//                         <label class="form-label small mb-0">Surface Type</label>
//                         <select class="form-select form-select-sm room-field" data-field="surfaceType">
//                             <option value="floor" ${!isWall ? 'selected' : ''}>Floor</option>
//                             <option value="wall" ${isWall ? 'selected' : ''}>Wall</option>
//                         </select>
//                     </div>
//                     <div class="col-md-3 col-6 ${isWall ? 'd-none' : ''}">
//                         <label class="form-label small mb-0">Length ft</label>
//                         <input type="number" class="form-control form-control-sm room-field" data-field="length" value="${room.length || ''}" placeholder="0" min="0" step="0.1">
//                     </div>
//                     <div class="col-md-3 col-6">
//                         <label class="form-label small mb-0">Width ft</label>
//                         <input type="number" class="form-control form-control-sm room-field" data-field="width" value="${room.width || ''}" placeholder="0" min="0" step="0.1">
//                     </div>
//                     <div class="col-md-3 col-6 ${isWall ? '' : 'd-none'}">
//                         <label class="form-label small mb-0">Height ft</label>
//                         <input type="number" class="form-control form-control-sm room-field" data-field="height" value="${room.height || ''}" placeholder="0" min="0" step="0.1">
//                     </div>
//                     <div class="col-md-3 col-6">
//                         <label class="form-label small mb-0">Tile Type</label>
//                         <select class="form-select form-select-sm room-field" data-field="tileType">
//                             ${Object.keys(TILE_RATES).map(t =>
//                                 `<option value="${t}" ${room.tileType === t ? 'selected' : ''}>${TILE_TYPE_LABELS[t]}</option>`
//                             ).join('')}
//                         </select>
//                     </div>
//                     <div class="col-md-4">
//                         <label class="form-label small mb-0">Custom Rate J$/sqft</label>
//                         <input type="number" class="form-control form-control-sm room-field" data-field="customRate" value="${room.customRate || ''}" placeholder="Auto" min="0" step="1">
//                     </div>
//                     <div class="col-md-4">
//                         <label class="form-label small mb-0">Tile Size/Style</label>
//                         <input type="text" class="form-control form-control-sm room-field" data-field="tileSize" value="${room.tileSize || ''}" placeholder="12x24, Mosaic">
//                     </div>
//                     <div class="col-md-4">
//                         <label class="form-label small mb-0">Pattern</label>
//                         <select class="form-select form-select-sm room-field" data-field="pattern">
//                             ${Object.keys(PATTERNS).map(k => `<option value="${k}" ${room.pattern === k ? 'selected' : ''}>${PATTERNS[k].name}</option>`).join('')}
//                         </select>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `}).join('');
// }

// function addExtraService(service) {
//     const id = state.extraIdCounter++;
//     state.extras.push({
//         id,
//         name: service.name,
//         quantity: 1,
//         rate: service.rate,
//         unit: service.unit
//     });
//     renderExtras();
//     updateEstimate();
//     saveDraft();
// }

// function renderExtras() {
//     const container = document.getElementById('extrasContainer');
//     if (!container) return;
//     if (state.extras.length === 0) {
//         container.innerHTML = '<p class="text-muted text-center mb-0">No extras added</p>';
//         return;
//     }
//     container.innerHTML = state.extras.map(extra => `
//         <div class="card mb-2" data-extra-id="${extra.id}">
//             <div class="card-body py-2">
//                 <div class="row g-2 align-items-center">
//                     <div class="col-md-4">
//                         <input type="text" class="form-control form-control-sm extra-field" data-field="name" value="${escapeHtml(extra.name)}" placeholder="Service name">
//                     </div>
//                     <div class="col-md-2">
//                         <input type="number" class="form-control form-control-sm extra-field" data-field="quantity" value="${extra.quantity}" min="0" step="0.1" placeholder="Qty">
//                     </div>
//                     <div class="col-md-2">
//                         <input type="number" class="form-control form-control-sm extra-field" data-field="rate" value="${extra.rate}" min="0" step="1" placeholder="Rate">
//                     </div>
//                     <div class="col-md-2">
//                         <select class="form-select form-select-sm extra-field" data-field="unit">
//                             <option value="each" ${extra.unit === 'each' ? 'selected' : ''}>each</option>
//                             <option value="sqft" ${extra.unit === 'sqft' ? 'selected' : ''}>sqft</option>
//                             <option value="lnft" ${extra.unit === 'lnft' ? 'selected' : ''}>lnft</option>
//                             <option value="room" ${extra.unit === 'room' ? 'selected' : ''}>room</option>
//                         </select>
//                     </div>
//                     <div class="col-md-1 text-end">
//                         <strong>${formatCurrency(extra.quantity * extra.rate)}</strong>
//                     </div>
//                     <div class="col-md-1">
//                         <button class="btn btn-sm btn-outline-danger remove-extra-btn"><i class="bi bi-x"></i></button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// // ===== MODAL + ROOMS =====
// function createRoomModal() {
//     const modalEl = document.getElementById('addRoomModal');
//     if (!modalEl || !window.bootstrap) return;
//     if (!roomModal) {
//         roomModal = new bootstrap.Modal(modalEl);
//     }

//     const saveBtn = document.getElementById('saveRoomBtn');
//     if (saveBtn) {
//         saveBtn.onclick = () => {
//             if (editingRoomId !== null) {
//                 updateRoomFromModal();
//             } else {
//                 addRoomFromModal();
//             }
//             roomModal.hide();
//             resetModalForm();
//         };
//     }
// }

// function resetModalForm() {
//     editingRoomId = null;
//     ['roomName','roomLength','roomWidth','roomHeight','customRate','tileSize'].forEach(id => {
//         const el = document.getElementById(id);
//         if (el) el.value = '';
//     });
//     const roomWidthWall = document.getElementById('roomWidthWall');
//     if (roomWidthWall) roomWidthWall.value = '';

//     const rt = document.getElementById('roomTileType'); if (rt) rt.value = 'ceramic';
//     const pt = document.getElementById('pattern'); if (pt) pt.value = 'straight';
//     const ih = document.getElementById('isHeight'); if (ih) ih.checked = false;

//     const surfaceFloor = document.getElementById('surfaceFloor');
//     if (surfaceFloor) surfaceFloor.checked = true;
    
//     const fi = document.getElementById('floorInputs'); if (fi) fi.style.display = 'flex';
//     const wi = document.getElementById('wallInputs'); if (wi) wi.style.display = 'none';
    
//     const mt = document.querySelector('#addRoomModal .modal-title'); if (mt) mt.textContent = 'Add Room/Area';
//     const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Add Room';
// }

// function loadRoomToModal(room) {
//     editingRoomId = room.id;
//     document.getElementById('roomName').value = room.name || '';
//     document.getElementById('roomLength').value = room.length || '';
//     document.getElementById('roomWidth').value = room.width || '';
//     document.getElementById('roomHeight').value = room.height || '';

//     const roomWidthWall = document.getElementById('roomWidthWall');
//     if (roomWidthWall) roomWidthWall.value = room.width || '';

//     document.getElementById('roomTileType').value = room.tileType || 'ceramic';
//     document.getElementById('customRate').value = room.customRate || '';
//     document.getElementById('tileSize').value = room.tileSize || '';
//     document.getElementById('pattern').value = room.pattern || 'straight';
//     document.getElementById('isHeight').checked = room.isHeight || false;

//     const isWall = room.surfaceType === 'wall';
//     if (isWall) {
//         document.getElementById('surfaceWall').checked = true;
//         document.getElementById('floorInputs').style.display = 'none';
//         document.getElementById('wallInputs').style.display = 'flex';
//     } else {
//         document.getElementById('surfaceFloor').checked = true;
//         document.getElementById('floorInputs').style.display = 'flex';
//         document.getElementById('wallInputs').style.display = 'none';
//     }

//     const mt = document.querySelector('#addRoomModal .modal-title'); if (mt) mt.textContent = 'Edit Room/Area';
//     const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Save Changes';
// }

// function addRoomFromModal() {
//     const id = state.roomIdCounter++;
//     const surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';

//     const width = surfaceType === 'wall'
//         ? parseNumber(document.getElementById('roomWidthWall').value)
//         : parseNumber(document.getElementById('roomWidth').value);

//     const room = {
//         id,
//         name: document.getElementById('roomName').value || `Room ${state.rooms.length + 1}`,
//         surfaceType: surfaceType,
//         length: parseNumber(document.getElementById('roomLength').value),
//         width: width,
//         height: parseNumber(document.getElementById('roomHeight').value),
//         tileType: document.getElementById('roomTileType').value,
//         customRate: parseNumber(document.getElementById('customRate').value),
//         tileSize: document.getElementById('tileSize').value,
//         pattern: document.getElementById('pattern').value,
//         isHeight: document.getElementById('isHeight').checked
//     };
//     state.rooms.push(room);
//     renderRooms();
//     updateEstimate();
//     saveDraft();
// }

// function updateRoomFromModal() {
//     if (editingRoomId === null) return;
//     const room = state.rooms.find(r => r.id === editingRoomId);
//     if (!room) return;

//     const surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';

//     const width = surfaceType === 'wall'
//         ? parseNumber(document.getElementById('roomWidthWall').value)
//         : parseNumber(document.getElementById('roomWidth').value);

//     room.name = document.getElementById('roomName').value || room.name;
//     room.surfaceType = surfaceType;
//     room.length = parseNumber(document.getElementById('roomLength').value);
//     room.width = width;
//     room.height = parseNumber(document.getElementById('roomHeight').value);
//     room.tileType = document.getElementById('roomTileType').value;
//     room.customRate = parseNumber(document.getElementById('customRate').value);
//     room.tileSize = document.getElementById('tileSize').value;
//     room.pattern = document.getElementById('pattern').value;
//     room.isHeight = document.getElementById('isHeight').checked;

//     showToast('Room updated', 2000, 'success');
//     renderRooms();
//     updateEstimate();
//     saveDraft();
// }

// // ===== STORAGE =====
// function saveDraft() {
//     const draft = {...state, savedAt: new Date().toISOString()};
//     localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
// }

// function loadDraft() {
//     const draft = localStorage.getItem(DRAFT_KEY);
//     if (draft) {
//         const parsed = JSON.parse(draft);
//         state = {...state, ...parsed};
//         state.roomIdCounter = state.rooms.length ? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
//         state.extraIdCounter = state.extras.length ? Math.max(...state.extras.map(e => e.id)) + 1 : 0;
        
//         Object.keys(state).forEach(key => {
//             const el = document.getElementById(key);
//             if (el && typeof state[key] === 'string') el.value = state[key];
//         });
        
//         const elements = {
//             mortarType: state.mortarType,
//             trowelSize: state.trowelSize,
//             depositPercent: state.depositPercent
//         };
//         Object.entries(elements).forEach(([id, value]) => {
//             const el = document.getElementById(id);
//             if (el) el.value = value;
//         });

//         const ts = document.getElementById('trowelSection'); 
//         if (ts) ts.style.display = state.mortarType === 'thinset' ? 'block' : 'none';
        
//         renderRooms();
//         renderExtras();
//         showToast(`Draft restored`, 2000, 'info');
//     }
// }

// function saveQuote(asNew = false) {
//     const quotes = getAllQuotes();
//     const id = asNew || !state.quoteId ? `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : state.quoteId;
//     const quote = {...state, id, savedAt: new Date().toISOString()};
//     const existingIndex = quotes.findIndex(q => q.id === id);
//     if (existingIndex >= 0) {
//         quotes[existingIndex] = quote;
//     } else {
//         quotes.push(quote);
//     }
//     localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
//     state.quoteId = id;
    
//     const qm = document.getElementById('quoteMode');
//     if (qm) {
//         qm.textContent = 'Saved Quote';
//         qm.className = 'badge bg-success';
//     }
//     renderSavedQuotes();
//     showToast(asNew ? 'Quote saved as new' : 'Quote saved', 2000, 'success');
// }

// function getAllQuotes() {
//     const quotes = localStorage.getItem(QUOTES_KEY);
//     return quotes ? JSON.parse(quotes) : [];
// }

// function loadQuote(id) {
//     const quotes = getAllQuotes();
//     const quote = quotes.find(q => q.id === id);
//     if (!quote) return;
//     state = {...quote};
//     state.roomIdCounter = state.rooms.length ? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
//     state.extraIdCounter = state.extras.length ? Math.max(...state.extras.map(e => e.id)) + 1 : 0;
    
//     Object.keys(state).forEach(key => {
//         const el = document.getElementById(key);
//         if (el && typeof state[key] === 'string') el.value = state[key];
//     });

//     const elements = {
//         mortarType: state.mortarType,
//         trowelSize: state.trowelSize,
//         depositPercent: state.depositPercent || 0
//     };
//     Object.entries(elements).forEach(([id, value]) => {
//         const el = document.getElementById(id);
//         if (el) el.value = value;
//     });

//     const ts = document.getElementById('trowelSection');
//     if (ts) ts.style.display = state.mortarType === 'thinset' ? 'block' : 'none';
    
//     const qm = document.getElementById('quoteMode');
//     if (qm) {
//         qm.textContent = 'Loaded Quote';
//         qm.className = 'badge bg-info';
//     }

//     renderRooms();
//     renderExtras();
//     updateEstimate();
//     showToast('Quote loaded', 2000, 'info');
// }

// function deleteQuote(id) {
//     quoteToDelete = id;
//     if (window.bootstrap) {
//         new bootstrap.Modal(document.getElementById('deleteQuoteModal')).show();
//     }
// }

// function renderSavedQuotes() {
//     const quotes = getAllQuotes();
//     const section = document.getElementById('savedSection');
//     const container = document.getElementById('savedQuotes');
//     if (!section || !container) return;
//     if (quotes.length === 0) {
//         section.style.display = 'none';
//         return;
//     }
//     section.style.display = 'block';
//     container.innerHTML = quotes.map(q => `
//         <div class="saved-quote-item p-2 border rounded mb-2">
//             <div class="d-flex justify-content-between align-items-center">
//                 <div>
//                     <strong>${escapeHtml(q.customerName || 'Unnamed')}</strong>
//                     <div class="small text-muted">${new Date(q.savedAt).toLocaleDateString('en-JM')} - ${formatCurrency(calculateEstimateFromData(q).grandTotal)}</div>
//                 </div>
//                 <div>
//                     <button class="btn btn-sm btn-outline-primary load-quote-btn me-1" data-id="${q.id}">Load</button>
//                     <button class="btn btn-sm btn-outline-danger delete-quote-btn" data-id="${q.id}">Del</button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// function calculateEstimateFromData(data) {
//     const tempState = state;
//     state = data;
//     const result = calculateEstimate();
//     state = tempState;
//     return result;
// }

// function clearAll() {
//     state = {
//         customerName: '', customerPhone: '', customerAddress: '', notes: '',
//         isDarkMode: state.isDarkMode, rooms: [], roomIdCounter: 0,
//         quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
//         quoteId: null, tileBoxCoverage: 10, groutJoint: 0.125,
//         mortarType: 'thinset', trowelSize: '60',
//         extras: [], extraIdCounter: 0,
//         depositPercent: 0
//     };
//     ['customerName','customerPhone','customerAddress','notes'].forEach(id => {
//         const el = document.getElementById(id);
//         if (el) el.value = '';
//     });
//     const dp = document.getElementById('depositPercent'); if (dp) dp.value = '0';
//     const qm = document.getElementById('quoteMode');
//     if (qm) {
//         qm.textContent = 'New Quote';
//         qm.className = 'badge bg-secondary';
//     }
//     localStorage.removeItem(DRAFT_KEY);
//     renderRooms();
//     renderExtras();
//     updateEstimate();
// }

// // ===== EVENTS =====
// function bindEvents() {
//     const qd = document.getElementById('quoteDate'); if (qd) qd.textContent = state.quoteDate;
//     const ed = document.getElementById('estimateDate'); if (ed) ed.textContent = state.quoteDate;
//     createRoomModal();

//     const roomTypeMenu = document.getElementById('roomTypeMenu');
//     if (roomTypeMenu) {
//         roomTypeMenu.innerHTML = ROOM_TYPES.map(t =>
//             `<li><a class="dropdown-item" href="#" data-room-type="${t}">${t}</a></li>`
//         ).join('');

//         roomTypeMenu.addEventListener('click', (e) => {
//             e.preventDefault();
//             const item = e.target.closest('[data-room-type]');
//             if (!item) return;

//             const roomType = item.dataset.roomType;
//             createRoomModal();
//             resetModalForm();
//             document.getElementById('roomName').value = roomType;

//             const isWall = roomType.toLowerCase().includes('wall');
//             const sf = document.getElementById('surfaceFloor'); if (sf) sf.checked = !isWall;
//             const sw = document.getElementById('surfaceWall'); if (sw) sw.checked = isWall;
//             const fi = document.getElementById('floorInputs'); if (fi) fi.style.display = isWall ? 'none' : 'flex';
//             const wi = document.getElementById('wallInputs'); if (wi) wi.style.display = isWall ? 'flex' : 'none';

//             if (roomModal) roomModal.show();
//         });
//     }

//     document.querySelectorAll('input[name="surfaceType"]').forEach(radio => {
//         radio.addEventListener('change', (e) => {
//             const isFloor = e.target.value === 'floor';
//             const fi = document.getElementById('floorInputs'); if (fi) fi.style.display = isFloor ? 'flex' : 'none';
//             const wi = document.getElementById('wallInputs'); if (wi) wi.style.display = isFloor ? 'none' : 'flex';
//         });
//     });

//     const extraServicesMenu = document.getElementById('extraServicesMenu');
//     if (extraServicesMenu) {
//         extraServicesMenu.innerHTML = EXTRA_SERVICES.map(s =>
//             `<li><a class="dropdown-item" href="#" data-service-id="${s.id}">${s.name} - ${formatCurrency(s.rate)}/${s.unit}</a></li>`
//         ).join('');
//         extraServicesMenu.addEventListener('click', (e) => {
//             e.preventDefault();
//             const serviceId = e.target.dataset.serviceId;
//             if (serviceId) {
//                 const service = EXTRA_SERVICES.find(s => s.id === serviceId);
//                 if (service) addExtraService(service);
//             }
//         });
//     }

//     document.getElementById('addCustomExtraBtn')?.addEventListener('click', () => {
//         addExtraService({ name: 'Custom Service', rate: 0, unit: 'each' });
//     });

//     const roomTileType = document.getElementById('roomTileType');
//     if (roomTileType) {
//         roomTileType.innerHTML = Object.keys(TILE_RATES).map(t =>
//             `<option value="${t}">${TILE_TYPE_LABELS[t]}</option>`
//         ).join('');
//     }

//     const autoSave = debounce(() => saveDraft(), 1000);

//     ['customerName','customerPhone','customerAddress','notes','waste','subtractSqft','tileBoxCoverage','depositPercent'].forEach(id => {
//         document.getElementById(id)?.addEventListener('input', (e) => {
//             state[id] = e.target.value;
//             updateEstimate();
//             autoSave();
//         });
//     });

//     ['groutJoint','mortarType','trowelSize'].forEach(id => {
//         document.getElementById(id)?.addEventListener('change', (e) => {
//             state[id] = e.target.value;
//             if (id === 'mortarType') {
//                 const ts = document.getElementById('trowelSection');
//                 if (ts) ts.style.display = e.target.value === 'thinset' ? 'block' : 'none';
//             }
//             updateEstimate();
//             autoSave();
//         });
//     });

//     document.getElementById('themeToggle')?.addEventListener('click', () => {
//         state.isDarkMode = !state.isDarkMode;
//         document.body.classList.toggle('dark-mode', state.isDarkMode);
//         const ti = document.getElementById('themeIcon');
//         if (ti) ti.className = state.isDarkMode ? 'bi bi-sun' : 'bi bi-moon-stars';
//         localStorage.setItem('perryTheme', state.isDarkMode ? 'dark' : 'light');
//     });

//     document.getElementById('clearAllBtn')?.addEventListener('click', () => {
//         if (window.bootstrap) new bootstrap.Modal(document.getElementById('clearAllModal')).show();
//     });
    
//     document.getElementById('confirmClearBtn')?.addEventListener('click', () => {
//         clearAll();
//         if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('clearAllModal'))?.hide();
//     });

//     document.getElementById('confirmDeleteQuoteBtn')?.addEventListener('click', () => {
//         if (quoteToDelete) {
//             const quotes = getAllQuotes().filter(q => q.id !== quoteToDelete);
//             localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
//             renderSavedQuotes();
//             showToast('Quote deleted', 2000, 'danger');
//             quoteToDelete = null;
//             if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteQuoteModal'))?.hide();
//         }
//     });

//     document.getElementById('saveQuoteBtn')?.addEventListener('click', () => saveQuote(false));
//     document.getElementById('saveAsNewBtn')?.addEventListener('click', () => saveQuote(true));
//     document.getElementById('printBtn')?.addEventListener('click', () => window.print());
    
//     document.getElementById('textQuoteBtn')?.addEventListener('click', () => {
//         const data = calculateEstimate();
//         let msg = `Perry's Tiling Estimate\nCustomer: ${state.customerName}\n`;
//         if (state.customerPhone) msg += `Phone: ${state.customerPhone}\n`;
//         if (state.customerAddress) msg += `Address: ${state.customerAddress}\n`;
//         msg += `\nLABOR BREAKDOWN\n`;

//         data.roomBreakdown.forEach(r => {
//             const rateText = r.customRate ? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
//             msg += `\n${r.name} [${r.surfaceType}]:\n`;
//             msg += `Tile: ${r.tileType} ${r.tileSize}\n`;
//             msg += `${r.baseArea.toFixed(1)} sqft @ ${rateText} - ${r.pattern}\n`;
//             msg += `Labor: ${formatCurrency(r.labor)}\n`;
//             msg += `Boxes: ${r.boxes}\n`;
//         });

//         if (data.extrasBreakdown.length > 0) {
//             msg += `\nEXTRA SERVICES\n`;
//             data.extrasBreakdown.forEach(e => {
//                 msg += `${e.name}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)} = ${formatCurrency(e.total)}\n`;
//             });
//         }

//         msg += `\nTOTAL LABOR: ${formatCurrency(data.grandTotal)}\n`;
//         if (data.deposit > 0) {
//             msg += `DEPOSIT REQUIRED: ${formatCurrency(data.deposit)}\n`;
//             msg += `BALANCE DUE: ${formatCurrency(data.balance)}\n`;
//         }
//         msg += `Billable Area: ${data.totalSqft.toFixed(1)} sqft\n`;
//         msg += `Tile to Order: ${data.tileAreaWithWaste.toFixed(1)} sqft\n\n`;
//         msg += `MATERIALS NEEDED (Client Supplies):\n`;
//         msg += `${data.thinsetBags} ${state.mortarType} bags\n`;
//         msg += `${data.groutBags} grout bags\n`;
//         msg += `${data.boxes} tile boxes total\n\n`;
//         if (state.notes) msg += `Notes: ${state.notes}\n\n`;
//         msg += `Labor only - Client supplies all materials\n`;
//         msg += `Quote Date: ${state.quoteDate}\n`;
//         msg += `Call Perry: 876-817-3377`;

//         navigator.clipboard.writeText(msg);
//         showToast('Quote copied to clipboard', 2000, 'success');
//     });

//     document.getElementById('roomsContainer')?.addEventListener('input', (e) => {
//         if (!e.target.classList.contains('room-field') && !e.target.classList.contains('room-name')) return;
//         const card = e.target.closest('.room-card');
//         if (!card) return;
//         const id = parseInt(card.dataset.roomId);
//         const room = state.rooms.find(r => r.id === id);
//         if (!room) return;
//         const field = e.target.dataset.field;
//         let value = e.target.value;
//         if (['length','width','height','customRate'].includes(field)) {
//             value = value === '' ? 0 : parseFloat(value) || 0;
//         }
//         room[field] = value;

//         if (field === 'surfaceType') {
//             renderRooms();
//         }

//         updateEstimate();
//         autoSave();
//     });

//     document.getElementById('roomsContainer')?.addEventListener('click', (e) => {
//         const editBtn = e.target.closest('.edit-room-btn');
//         const removeBtn = e.target.closest('.remove-room-btn');
//         const card = e.target.closest('.room-card');
//         if (!card) return;

//         const id = parseInt(card.dataset.roomId);
//         const room = state.rooms.find(r => r.id === id);
//         if (!room) return;

//         if (removeBtn) {
//             state.rooms = state.rooms.filter(r => r.id !== id);
//             renderRooms();
//             updateEstimate();
//             autoSave();
//             return;
//         }

//         if (editBtn) {
//             e.preventDefault();
//             createRoomModal();
//             loadRoomToModal(room);
//             if (roomModal) roomModal.show();
//         }
//     });

//     document.getElementById('extrasContainer')?.addEventListener('input', (e) => {
//         if (!e.target.classList.contains('extra-field')) return;
//         const card = e.target.closest('[data-extra-id]');
//         if (!card) return;
//         const id = parseInt(card.dataset.extraId);
//         const extra = state.extras.find(x => x.id === id);
//         if (!extra) return;
//         const field = e.target.dataset.field;
//         extra[field] = (field === 'name' || field === 'unit') ? e.target.value : parseNumber(e.target.value);
//         updateEstimate();
//         autoSave();
//     });

//     document.getElementById('extrasContainer')?.addEventListener('click', (e) => {
//         if (!e.target.closest('.remove-extra-btn')) return;
//         const card = e.target.closest('[data-extra-id]');
//         if (!card) return;
//         const id = parseInt(card.dataset.extraId);
//         state.extras = state.extras.filter(x => x.id !== id);
//         renderExtras();
//         updateEstimate();
//         autoSave();
//     });

//     document.getElementById('savedQuotes')?.addEventListener('click', (e) => {
//         const loadBtn = e.target.closest('.load-quote-btn');
//         const delBtn = e.target.closest('.delete-quote-btn');
//         if (loadBtn) loadQuote(loadBtn.dataset.id);
//         if (delBtn) deleteQuote(delBtn.dataset.id);
//     });

//     document.getElementById('clearAllQuotesBtn')?.addEventListener('click', () => {
//         if (window.bootstrap) new bootstrap.Modal(document.getElementById('deleteAllQuotesModal')).show();
//     });

//     document.getElementById('confirmDeleteAllQuotesBtn')?.addEventListener('click', () => {
//         localStorage.removeItem(QUOTES_KEY);
//         renderSavedQuotes();
//         showToast('All quotes deleted', 2000, 'danger');
//         if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteAllQuotesModal'))?.hide();
//     });

//     createRoomModal();
// }

// document.addEventListener('DOMContentLoaded', () => {
//     state.isDarkMode = localStorage.getItem('perryTheme') !== 'light';
//     document.body.classList.toggle('dark-mode', state.isDarkMode);
//     const themeIcon = document.getElementById('themeIcon');
//     if (themeIcon) themeIcon.className = state.isDarkMode ? 'bi bi-sun' : 'bi bi-moon-stars';

//     bindEvents();
//     loadDraft();
//     renderSavedQuotes();
//     renderExtras();
//     updateEstimate();
// });







// // ==========================================
// // PERRY'S TILING CALCULATOR - ENGINE v4.6 (JMD)
// // Perry Mode: Pooled materials, Grout = Floor + Wall
// // TILE_PROFILES dropdown, Labor subtract fix
// // ==========================================

// const CURRENCY = 'JMD';

// const PATTERNS = {
//     'straight': {name: 'Straight Lay', multiplier: 1.0, waste: 0.10},
//     'diagonal': {name: 'Diagonal', multiplier: 1.15, waste: 0.15},
//     'herringbone': {name: 'Herringbone', multiplier: 1.30, waste: 0.20},
//     'chevron': {name: 'Chevron', multiplier: 1.30, waste: 0.20},
//     'basketweave': {name: 'Basketweave', multiplier: 1.25, waste: 0.20}
// };

// const TROWEL_COVERAGE = {'80': 80, '60': 60, '50': 50, '40': 40};

// // New: TILE_PROFILES for dropdown selection
// const TILE_PROFILES = {
//     '3x6': { label: '3x6 Subway', length: 3, width: 6, thickness: 0.25 },
//     '6x24': { label: '6x24 Plank', length: 6, width: 24, thickness: 0.375 },
//     '12x12': { label: '12x12', length: 12, width: 12, thickness: 0.375 },
//     '12x24': { label: '12x24', length: 12, width: 24, thickness: 0.375 },
//     '24x24': { label: '24x24', length: 24, width: 24, thickness: 0.375 },
//     '24x48': { label: '24x48 Large Format', length: 24, width: 48, thickness: 0.375 },
//     'mosaic': { label: 'Mosaic Sheet', length: 12, width: 12, thickness: 0.25 }
// };

// const ROOM_TYPES = [
//     'Living Room', 'Dining Room', 'Kitchen Floor', 'Bedroom',
//     'Bathroom', 'Bathroom Wall', 'Vanity Top', 'Backsplash',
//     'Hallway', 'Foyer', 'Porch', 'Stairs', 'Other'
// ];

// const EXTRA_SERVICES = [
//     { id: 'remove_door', name: 'Remove & Reinstall Door', rate: 1000, unit: 'each' },
//     { id: 'wall_floor_prep', name: 'Prepare Wall & Floor (batching)', rate: 35, unit: 'sqft' },
//     { id: 'demo_tile', name: 'Demo Old Tile & Mortar', rate: 150, unit: 'sqft' },
//     { id: 'remove_bath', name: 'Remove Bath/Tub', rate: 5000, unit: 'each' },
//     { id: 'countertop', name: 'Countertop Install', rate: 15000, unit: 'each' },
//     { id: 'skirting_tread', name: 'Skirting - Stair Tread', rate: 3500, unit: 'each' },
//     { id: 'baseboard_install', name: 'Baseboard / Skirting Install', rate: 150, unit: 'lnft' },
//     { id: 'cut_door_grill', name: 'Cut Door Grill', rate: 1000, unit: 'each' },
//     { id: 'remove_furniture', name: 'Remove Furniture', rate: 6000, unit: 'room' },
//     { id: 'floor_over', name: 'Floor Over (extra)', rate: 60, unit: 'sqft' },
//     { id: 'tile_trim', name: 'Tile Trim', rate: 300, unit: 'lnft' },
//     { id: 'border_install', name: 'Installing Border', rate: 300, unit: 'lnft' },
//     { id: 'create_shower', name: 'Create Shower', rate: 5000, unit: 'each' },
//     { id: 'create_curb', name: 'Create Curb', rate: 7000, unit: 'each' },
//     { id: 'install_shower_drain', name: 'Install Shower Drain', rate: 3000, unit: 'each' },
//     { id: 'remove_toilet', name: 'Remove Toilet', rate: 2000, unit: 'each' },
//     { id: 'remove_basin', name: 'Remove Basin/Vanity', rate: 1500, unit: 'each' },
//     { id: 'rent_demolition', name: 'Rent Demolition Hammer', rate: 4500, unit: 'each' }
// ];

// const TILE_RATES = {
//     'ceramic': { floor: 180, wall: 200 },
//     'porcelain': { floor: 200, wall: 250 },
//     'plank_porcelain': { floor: 250, wall: 300 },
//     'mosaic': { floor: 300, wall: 350 },
//     'travertine': { floor: 300, wall: 300 },
//     'marble': { floor: 300, wall: 350 },
//     'slate': { floor: 215, wall: 215 },
//     'quarry': { floor: 280, wall: 280 },
//     'large_format': { floor: 250, wall: 300 }
// };

// const TILE_TYPE_LABELS = {
//     ceramic: 'Ceramic',
//     porcelain: 'Porcelain',
//     plank_porcelain: 'Plank Porcelain',
//     mosaic: 'Mosaic',
//     travertine: 'Travertine',
//     marble: 'Marble',
//     slate: 'Slate',
//     quarry: 'Quarry',
//     large_format: 'Large Format Tile'
// };

// const GROUT_BAG_COVERAGE = 100;

// let state = {
//     customerName: '', customerPhone: '', customerAddress: '', notes: '',
//     isDarkMode: true, rooms: [], roomIdCounter: 0,
//     quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
//     quoteId: null, tileBoxCoverage: 10,
//     mortarType: 'thinset', trowelSize: '60',
//     extras: [], extraIdCounter: 0, depositPercent: 0
// };

// let roomModal = null;
// let quoteToDelete = null;
// let editingRoomId = null;
// const DRAFT_KEY = 'tilingDraft_v4_jmd';
// const QUOTES_KEY = 'tilingQuotes_v4_jmd';

// function formatCurrency(amount) {
//     return new Intl.NumberFormat('en-JM', {
//         style: 'currency', currency: CURRENCY, minimumFractionDigits: 0, maximumFractionDigits: 0
//     }).format(amount || 0);
// }

// function formatSqft(sqft) { return `${parseFloat(sqft || 0).toFixed(1)} sqft`; }
// function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
// function parseNumber(value) { const num = parseFloat(value); return isNaN(num)? 0 : num; }

// function showToast(msg, delay = 3000, type = 'success') {
//     const c = document.querySelector('.toast-container');
//     if (!c) return;
//     const id = `toast-${Date.now()}`;
//     const bg = { success: 'bg-success', danger: 'bg-danger', info: 'bg-info' }[type] || 'bg-success';
//     c.insertAdjacentHTML('beforeend',
//         `<div id="${id}" class="toast align-items-center text-white ${bg} border-0">
//             <div class="d-flex">
//                 <div class="toast-body">${escapeHtml(msg)}</div>
//                 <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
//             </div>
//         </div>`
//     );
//     const el = document.getElementById(id);
//     if (el && window.bootstrap) { new bootstrap.Toast(el, { delay }).show(); }
// }

// function debounce(func, wait = 300) { let t; return function(...args) { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }

// function calculateEstimate() {
//     const {rooms, waste, subtractSqft, tileBoxCoverage, mortarType, trowelSize, depositPercent} = state;

//     let totalGrossInstallArea = 0;
//     let totalFloorArea = 0;
//     let totalWallArea = 0;
//     let baseLaborAccumulator = 0;
//     let exactThinsetBagsTotal = 0;
//     let totalProjectBoxesCount = 0;

//     const roomBreakdown = [];
//     const globalWasteFactor = parseNumber(waste) / 100;

//     rooms.forEach(room => {
//         const d1 = parseNumber(room.dim1);
//         const d2 = parseNumber(room.dim2);
//         const baseArea = d1 * d2;
//         totalGrossInstallArea += baseArea;

//         const isWall = room.surfaceType === 'wall';
//         if (isWall) {
//             totalWallArea += baseArea;
//         } else {
//             totalFloorArea += baseArea;
//         }

//         const tileType = room.tileType || 'ceramic';
//         const defaultRate = isWall? (TILE_RATES[tileType]?.wall || 200) : (TILE_RATES[tileType]?.floor || 180);
//         const baseRate = parseNumber(room.customRate) > 0? parseNumber(room.customRate) : defaultRate;
//         const patternConfig = PATTERNS[room.pattern] || { name: 'Straight Lay', multiplier: 1.0, waste: 0.10 };
//         const combinedWasteFactor = Math.max(globalWasteFactor, patternConfig.waste);

//         const heightAdder = (room.isHeight && isWall)? (60 * baseArea) : 0;
//         let roomLaborTotal = (baseArea * baseRate * patternConfig.multiplier) + heightAdder;
//         baseLaborAccumulator += roomLaborTotal;

//         const trowelCov = parseNumber(trowelSize) || 60;
//         let roomThinsetBags = mortarType === 'thinset'? (baseArea / trowelCov) : (baseArea / 100);
//         if (isWall) roomThinsetBags *= 1.25;
//         exactThinsetBagsTotal += roomThinsetBags;

//         const roomAreaWithWaste = baseArea * (1 + combinedWasteFactor);
//         const roomBoxes = Math.ceil(roomAreaWithWaste / (parseNumber(tileBoxCoverage) || 10));
//         totalProjectBoxesCount += roomBoxes;

//         roomBreakdown.push({
//             id: room.id,
//             name: room.name,
//             tileType: TILE_TYPE_LABELS[tileType] || 'Ceramic',
//             tileProfile: room.tileProfile || '12x24',
//             baseArea: baseArea,
//             rate: baseRate,
//             pattern: patternConfig.name,
//             labor: roomLaborTotal,
//             customRate: parseNumber(room.customRate) > 0,
//             boxes: roomBoxes,
//             surfaceType: isWall? 'Wall' : 'Floor',
//             dim1: d1,
//             dim2: d2,
//             exactThinset: roomThinsetBags
//         });
//     });

//     // Perry Mode: Grout = Total Floor + Total Wall, no tile size math
//     const totalGroutSqft = totalFloorArea + totalWallArea;
//     const exactGroutBags = totalGroutSqft / GROUT_BAG_COVERAGE;
//     const purchaseGroutBags = Math.ceil(exactGroutBags);

//     let extrasTotal = 0;
//     const extrasBreakdown = [];
//     state.extras.forEach(extra => {
//         const qty = parseNumber(extra.quantity);
//         const rate = parseNumber(extra.rate);
//         const lineTotal = qty * rate;
//         extrasTotal += lineTotal;
//         extrasBreakdown.push({
//             name: extra.name, quantity: qty, unit: extra.unit, rate: rate, total: lineTotal
//         });
//     });

//     // FIX: Labor subtraction - if subtractSqft reduces billable area, reduce labor too
//     const deductionSqft = parseNumber(subtractSqft);
//     const netBillableArea = Math.max(0, totalGrossInstallArea - deductionSqft);

//     let laborDeductionCredit = 0;
//     if (totalGrossInstallArea > 0 && deductionSqft > 0) {
//         const averageLaborPerSqft = baseLaborAccumulator / totalGrossInstallArea;
//         laborDeductionCredit = Math.min(baseLaborAccumulator, deductionSqft * averageLaborPerSqft);
//     }

//     let modifiedLaborSubtotal = Math.max(0, baseLaborAccumulator - laborDeductionCredit) + extrasTotal;
//     const deposit = modifiedLaborSubtotal * (parseNumber(state.depositPercent) / 100);
//     const balance = modifiedLaborSubtotal - deposit;
//     const purchaseThinsetBags = Math.ceil(exactThinsetBagsTotal);

//     return {
//         totalSqft: netBillableArea,
//         installArea: totalGrossInstallArea,
//         totalFloorArea,
//         totalWallArea,
//         laborTotal: modifiedLaborSubtotal,
//         grandTotal: modifiedLaborSubtotal,
//         subtotal: modifiedLaborSubtotal,
//         deposit,
//         balance,
//         exactThinsetBags: exactThinsetBagsTotal,
//         purchaseThinsetBags: purchaseThinsetBags,
//         exactGroutBags: exactGroutBags,
//         purchaseGroutBags: purchaseGroutBags,
//         groutSqftTotal: totalGroutSqft,
//         boxes: totalProjectBoxesCount,
//         roomBreakdown,
//         extrasBreakdown,
//         extrasTotal
//     };
// }

// function updateEstimate() {
//     const data = calculateEstimate();
//     const elements = {
//         sqftOutLarge: data.totalSqft.toFixed(1),
//         sqftOut: data.totalSqft.toFixed(1),
//         totalProjectOut: formatCurrency(data.grandTotal),
//         laborCostOut: formatCurrency(data.laborTotal),
//         mortarOut: data.purchaseThinsetBags,
//         groutOut: data.purchaseGroutBags,
//         boxesOut: data.boxes,
//         mortarLabel: state.mortarType === 'thinset'? 'Thinset Bags' : 'Cement Bags'
//     };
//     Object.entries(elements).forEach(([id, val]) => {
//         const el = document.getElementById(id);
//         if (el) el.textContent = val;
//     });
//     const depositDiv = document.getElementById('depositSection');
//     if (depositDiv) {
//         if (data.deposit > 0) {
//             const depOut = document.getElementById('depositOut');
//             const balOut = document.getElementById('balanceOut');
//             if (depOut) depOut.textContent = formatCurrency(data.deposit);
//             if (balOut) balOut.textContent = formatCurrency(data.balance);
//             depositDiv.style.display = 'block';
//         } else {
//             depositDiv.style.display = 'none';
//         }
//     }
//     const roomBreakdownList = document.getElementById('roomBreakdownList');
//     if (roomBreakdownList) {
//         roomBreakdownList.innerHTML = data.roomBreakdown.map(r => {
//             const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
//             const dims = `${r.dim1.toFixed(1)}×${r.dim2.toFixed(1)}`;
//             const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
//             return `
//                 <div class="mb-2 pb-2 border-bottom">
//                     <div class="d-flex justify-content-between align-items-center">
//                         <div class="fw-bold">${escapeHtml(r.name)} <span class="badge ${r.surfaceType === 'Wall'? 'bg-info' : 'bg-secondary'} ms-1">${r.surfaceType}</span></div>
//                         <span class="badge bg-primary">${r.boxes} boxes</span>
//                     </div>
//                     <div class="d-flex justify-content-between small">
//                         <span>Tile: ${escapeHtml(r.tileType)} - ${escapeHtml(profileLabel)}</span>
//                     </div>
//                     <div class="d-flex justify-content-between small">
//                         <span>${dims} = ${formatSqft(r.baseArea)} @ ${rateText} - ${r.pattern}</span>
//                         <span>${formatCurrency(r.labor)}</span>
//                     </div>
//                     <div class="d-flex justify-content-between small text-muted">
//                         <span>Thinset: ${Math.ceil(r.exactThinset)} bags (${r.exactThinset.toFixed(2)} calc)</span>
//                     </div>
//                 </div>
//             `;
//         }).join('');
//     }
//     const extrasDiv = document.getElementById('extrasBreakdownList');
//     const extrasSection = document.getElementById('extrasSection');
//     if (extrasDiv && extrasSection) {
//         extrasDiv.innerHTML = data.extrasBreakdown.map(e =>
//             `<div class="d-flex justify-content-between small mb-1">
//                 <span>${escapeHtml(e.name)}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)}</span>
//                 <span>${formatCurrency(e.total)}</span>
//             </div>`
//         ).join('');
//         extrasSection.style.display = data.extrasBreakdown.length? 'block' : 'none';
//     }
//     updateClientInfo();
//     const emptyState = document.getElementById('emptyState');
//     if (emptyState) emptyState.style.display = state.rooms.length? 'none' : 'block';
//     const materialList = document.getElementById('materialList');
//     if (materialList) {
//         const materials = [];
//         if (data.purchaseThinsetBags > 0) {
//             materials.push(`<li class="list-group-item d-flex justify-content-between">
//                 <span>${state.mortarType === 'thinset'? 'Thinset' : 'Cement'}</span>
//                 <span><strong>${data.purchaseThinsetBags} bags</strong> <small class="text-muted">(${data.exactThinsetBags.toFixed(2)} calc)</small></span>
//             </li>`);
//         }
//         if (data.purchaseGroutBags > 0) {
//             materials.push(`<li class="list-group-item d-flex justify-content-between">
//                 <span>Grout</span>
//                 <span><strong>${data.purchaseGroutBags} bags</strong> <small class="text-muted">(${data.exactGroutBags.toFixed(2)} calc, ${data.groutSqftTotal.toFixed(1)} sqft)</small></span>
//             </li>`);
//         }
//         if (data.totalFloorArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Floor Area</span><span>${data.totalFloorArea.toFixed(1)} sqft</span></li>`);
//         if (data.totalWallArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Wall Area</span><span>${data.totalWallArea.toFixed(1)} sqft</span></li>`);
//         if (data.totalSqft > 0) materials.push(`<li class="list-group-item d-flex justify-content-between"><span>Tile Boxes Total</span><span>${data.boxes} boxes</span></li>`);
//         materialList.innerHTML = materials.join('') || '<li class="list-group-item text-muted">No materials calculated yet</li>';
//     }
// }

// function updateClientInfo() {
//     const name = state.customerName.trim();
//     const phone = state.customerPhone.trim();
//     const info = document.getElementById('clientInfo');
//     if (info) {
//         if (name || phone) {
//             info.innerHTML = `<strong>${escapeHtml(name) || 'Customer'}</strong><br><small>${escapeHtml(phone) || ''}</small>`;
//             info.style.display = 'block';
//         } else {
//             info.style.display = 'none';
//         }
//     }
// }

// function renderRooms() {
//     const container = document.getElementById('roomsContainer');
//     if (!container) return;
//     if (state.rooms.length === 0) {
//         container.innerHTML = '<p class="text-muted text-center mb-0">Click "Add Room" to start</p>';
//         return;
//     }
//     container.innerHTML = state.rooms.map(room => {
//         const isWall = room.surfaceType === 'wall';
//         const profileLabel = TILE_PROFILES[room.tileProfile]?.label || room.tileProfile || '12x24';
//         return `
//         <div class="card room-card mb-2" data-room-id="${room.id}">
//             <div class="card-body p-3">
//                 <div class="d-flex justify-content-between align-items-center mb-2">
//                     <div class="w-50">
//                         <input type="text" class="form-control form-control-sm fw-bold room-name border-0 bg-transparent p-0" value="${escapeHtml(room.name)}" data-field="name">
//                     </div>
//                     <div class="d-flex gap-2">
//                         <button class="btn btn-sm btn-outline-primary edit-room-btn" title="Edit Advanced"><i class="bi bi-pencil"></i> Advanced</button>
//                         <button class="btn btn-sm btn-outline-danger remove-room-btn"><i class="bi bi-x"></i></button>
//                     </div>
//                 </div>
//                 <div class="row g-2 align-items-center">
//                     <div class="col-4">
//                         <select class="form-select form-select-sm room-field fw-bold" data-field="surfaceType">
//                             <option value="floor" ${!isWall? 'selected' : ''}>Floor</option>
//                             <option value="wall" ${isWall? 'selected' : ''}>Wall</option>
//                         </select>
//                     </div>
//                     <div class="col-4">
//                         <div class="input-group input-group-sm">
//                             <span class="input-group-text small px-1">${isWall? 'H' : 'L'}</span>
//                             <input type="number" class="form-control room-field" data-field="dim1" value="${room.dim1 || ''}" placeholder="0" step="0.1">
//                         </div>
//                     </div>
//                     <div class="col-4">
//                         <div class="input-group input-group-sm">
//                             <span class="input-group-text small px-1">W</span>
//                             <input type="number" class="form-control room-field" data-field="dim2" value="${room.dim2 || ''}" placeholder="0" step="0.1">
//                         </div>
//                     </div>
//                 </div>
//                 <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
//                     <span>${escapeHtml(TILE_TYPE_LABELS[room.tileType || 'ceramic'])} - ${escapeHtml(profileLabel)}</span>
//                     <span class="fw-bold text-primary">${((parseNumber(room.dim1)) * (parseNumber(room.dim2))).toFixed(1)} sqft</span>
//                 </div>
//             </div>
//         </div>
//     `}).join('');
// }

// function addExtraService(service) {
//     const id = state.extraIdCounter++;
//     state.extras.push({
//         id, name: service.name, quantity: 1, rate: service.rate, unit: service.unit
//     });
//     renderExtras();
//     updateEstimate();
//     saveDraft();
// }

// function renderExtras() {
//     const container = document.getElementById('extrasContainer');
//     if (!container) return;
//     if (state.extras.length === 0) {
//         container.innerHTML = '<p class="text-muted text-center mb-0">No extras added</p>';
//         return;
//     }
//     container.innerHTML = state.extras.map(extra => `
//         <div class="card mb-2" data-extra-id="${extra.id}">
//             <div class="card-body py-2">
//                 <div class="row g-2 align-items-center">
//                     <div class="col-md-4">
//                         <input type="text" class="form-control form-control-sm extra-field" data-field="name" value="${escapeHtml(extra.name)}">
//                     </div>
//                     <div class="col-md-2">
//                         <input type="number" class="form-control form-control-sm extra-field" data-field="quantity" value="${extra.quantity}" step="0.1">
//                     </div>
//                     <div class="col-md-2">
//                         <input type="number" class="form-control form-control-sm extra-field" data-field="rate" value="${extra.rate}">
//                     </div>
//                     <div class="col-md-2">
//                         <select class="form-select form-select-sm extra-field" data-field="unit">
//                             <option value="each" ${extra.unit === 'each'? 'selected' : ''}>each</option>
//                             <option value="sqft" ${extra.unit === 'sqft'? 'selected' : ''}>sqft</option>
//                             <option value="lnft" ${extra.unit === 'lnft'? 'selected' : ''}>lnft</option>
//                             <option value="room" ${extra.unit === 'room'? 'selected' : ''}>room</option>
//                         </select>
//                     </div>
//                     <div class="col-md-1 text-end">
//                         <strong>${formatCurrency(extra.quantity * extra.rate)}</strong>
//                     </div>
//                     <div class="col-md-1">
//                         <button class="btn btn-sm btn-outline-danger remove-extra-btn"><i class="bi bi-x"></i></button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// function createRoomModal() {
//     const modalEl = document.getElementById('addRoomModal');
//     if (!modalEl ||!window.bootstrap) return;
//     if (!roomModal) { roomModal = new bootstrap.Modal(modalEl); }
//     const saveBtn = document.getElementById('saveRoomBtn');
//     if (saveBtn) {
//         saveBtn.onclick = () => {
//             if (editingRoomId!== null) { updateRoomFromModal(); } else { addRoomFromModal(); }
//             // Fix for aria-hidden focus bug
//             if (document.activeElement) document.activeElement.blur();
//             roomModal.hide();
//             resetModalForm();
//         };
//     }
// }

// function resetModalForm() {
//     editingRoomId = null;
//     ['roomName','roomDim1','roomDim2','customRate'].forEach(id => {
//         const el = document.getElementById(id); if (el) el.value = '';
//     });
//     const rt = document.getElementById('roomTileType'); if (rt) rt.value = 'ceramic';
//     const tp = document.getElementById('roomTileProfile'); if (tp) tp.value = '12x24';
//     const pt = document.getElementById('pattern'); if (pt) pt.value = 'straight';
//     const ih = document.getElementById('isHeight'); if (ih) ih.checked = false;
//     const surfaceFloor = document.getElementById('surfaceFloor'); if (surfaceFloor) surfaceFloor.checked = true;
//     const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Set Space Metrics';
//     const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Add Room';
// }

// function loadRoomToModal(room) {
//     editingRoomId = room.id;
//     document.getElementById('roomName').value = room.name || '';
//     document.getElementById('roomDim1').value = room.dim1 || '';
//     document.getElementById('roomDim2').value = room.dim2 || '';
//     document.getElementById('roomTileType').value = room.tileType || 'ceramic';
//     document.getElementById('roomTileProfile').value = room.tileProfile || '12x24';
//     document.getElementById('customRate').value = room.customRate || '';
//     document.getElementById('pattern').value = room.pattern || 'straight';
//     document.getElementById('isHeight').checked = room.isHeight || false;
//     if (room.surfaceType === 'wall') {
//         document.getElementById('surfaceWall').checked = true;
//     } else {
//         document.getElementById('surfaceFloor').checked = true;
//     }
//     const mt = document.querySelector('#addRoomModal.modal-title'); if (mt) mt.textContent = 'Edit Advanced Room Parameters';
//     const sb = document.getElementById('saveRoomBtn'); if (sb) sb.textContent = 'Save Changes';
// }

// function addRoomFromModal() {
//     const id = state.roomIdCounter++;
//     const surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
//     const room = {
//         id,
//         name: document.getElementById('roomName').value || `Area ${state.rooms.length + 1}`,
//         surfaceType: surfaceType,
//         dim1: parseNumber(document.getElementById('roomDim1').value),
//         dim2: parseNumber(document.getElementById('roomDim2').value),
//         tileType: document.getElementById('roomTileType').value,
//         tileProfile: document.getElementById('roomTileProfile').value,
//         customRate: parseNumber(document.getElementById('customRate').value),
//         pattern: document.getElementById('pattern').value,
//         isHeight: document.getElementById('isHeight').checked
//     };
//     state.rooms.push(room);
//     renderRooms();
//     updateEstimate();
//     saveDraft();
// }

// function updateRoomFromModal() {
//     if (editingRoomId === null) return;
//     const room = state.rooms.find(r => r.id === editingRoomId);
//     if (!room) return;
//     room.name = document.getElementById('roomName').value || room.name;
//     room.surfaceType = document.querySelector('input[name="surfaceType"]:checked')?.value || 'floor';
//     room.dim1 = parseNumber(document.getElementById('roomDim1').value);
//     room.dim2 = parseNumber(document.getElementById('roomDim2').value);
//     room.tileType = document.getElementById('roomTileType').value;
//     room.tileProfile = document.getElementById('roomTileProfile').value;
//     room.customRate = parseNumber(document.getElementById('customRate').value);
//     room.pattern = document.getElementById('pattern').value;
//     room.isHeight = document.getElementById('isHeight').checked;
//     showToast('Room parameters synced', 2000, 'success');
//     renderRooms();
//     updateEstimate();
//     saveDraft();
// }

// function saveDraft() {
//     const draft = {...state, savedAt: new Date().toISOString()};
//     localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
// }

// function loadDraft() {
//     const draft = localStorage.getItem(DRAFT_KEY);
//     if (draft) {
//         const parsed = JSON.parse(draft);
//         state = {...state,...parsed};
//         state.subtractSqft = parseNumber(state.subtractSqft);
//         state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
//         state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;
//         Object.keys(state).forEach(key => {
//             const el = document.getElementById(key);
//             if (el && typeof state[key] === 'string') el.value = state[key];
//         });
//         const elements = {
//             mortarType: state.mortarType, trowelSize: state.trowelSize, depositPercent: state.depositPercent
//         };
//         Object.entries(elements).forEach(([id, value]) => {
//             const el = document.getElementById(id); if (el) el.value = value;
//         });
//         const ts = document.getElementById('trowelSection'); if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
//         renderRooms();
//         renderExtras();
//         showToast(`Draft restored`, 2000, 'info');
//     }
// }

// function saveQuote(asNew = false) {
//     const quotes = getAllQuotes();
//     const id = asNew ||!state.quoteId? `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : state.quoteId;
//     const quote = {...state, id, savedAt: new Date().toISOString()};
//     const existingIndex = quotes.findIndex(q => q.id === id);
//     if (existingIndex >= 0) { quotes[existingIndex] = quote; } else { quotes.push(quote); }
//     localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
//     state.quoteId = id;
//     const qm = document.getElementById('quoteMode'); if (qm) { qm.textContent = 'Saved Quote'; qm.className = 'badge bg-success'; }
//     renderSavedQuotes();
//     showToast(asNew? 'Quote saved as new configuration' : 'Quote modifications saved', 2000, 'success');
// }

// function getAllQuotes() { const quotes = localStorage.getItem(QUOTES_KEY); return quotes? JSON.parse(quotes) : []; }

// function loadQuote(id) {
//     const quotes = getAllQuotes();
//     const quote = quotes.find(q => q.id === id);
//     if (!quote) return;
//     state = {...quote};
//     state.subtractSqft = parseNumber(state.subtractSqft);
//     state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
//     state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;
//     Object.keys(state).forEach(key => {
//         const el = document.getElementById(key);
//         if (el && typeof state[key] === 'string') el.value = state[key];
//     });
//     const elements = { mortarType: state.mortarType, trowelSize: state.trowelSize, depositPercent: state.depositPercent || 0 };
//     Object.entries(elements).forEach(([id, value]) => {
//         const el = document.getElementById(id); if (el) el.value = value;
//     });
//     const ts = document.getElementById('trowelSection'); if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
//     const qm = document.getElementById('quoteMode'); if (qm) { qm.textContent = 'Loaded Quote'; qm.className = 'badge bg-info'; }
//     renderRooms();
//     renderExtras();
//     updateEstimate();
//     showToast('Quote configuration loaded', 2000, 'info');
// }

// function deleteQuote(id) {
//     quoteToDelete = id;
//     if (window.bootstrap) {
//         new bootstrap.Modal(document.getElementById('deleteQuoteModal')).show();
//     }
// }

// function renderSavedQuotes() {
//     const quotes = getAllQuotes();
//     const section = document.getElementById('savedSection');
//     const container = document.getElementById('savedQuotes');
//     if (!section ||!container) return;
//     if (quotes.length === 0) {
//         section.style.display = 'none';
//         return;
//     }
//     section.style.display = 'block';
//     container.innerHTML = quotes.map(q => `
//         <div class="saved-quote-item p-2 border rounded mb-2">
//             <div class="d-flex justify-content-between align-items-center">
//                 <div>
//                     <strong>${escapeHtml(q.customerName || 'Unnamed')}</strong>
//                     <div class="small text-muted">${new Date(q.savedAt).toLocaleDateString('en-JM')} - ${formatCurrency(calculateEstimateFromData(q).grandTotal)}</div>
//                 </div>
//                 <div>
//                     <button class="btn btn-sm btn-outline-primary load-quote-btn me-1" data-id="${q.id}">Load</button>
//                     <button class="btn btn-sm btn-outline-danger delete-quote-btn" data-id="${q.id}">Del</button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// function calculateEstimateFromData(data) {
//     const tempState = state;
//     state = data;
//     const result = calculateEstimate();
//     state = tempState;
//     return result;
// }

// function clearAll() {
//     state = {
//         customerName: '', customerPhone: '', customerAddress: '', notes: '',
//         isDarkMode: state.isDarkMode, rooms: [], roomIdCounter: 0,
//         quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
//         quoteId: null, tileBoxCoverage: 10,
//         mortarType: 'thinset', trowelSize: '60',
//         extras: [], extraIdCounter: 0,
//         depositPercent: 0
//     };
//     ['customerName','customerPhone','customerAddress','notes'].forEach(id => {
//         const el = document.getElementById(id);
//         if (el) el.value = '';
//     });
//    const dp = document.getElementById('depositPercent'); if (dp) dp.value = '0';
//     const qm = document.getElementById('quoteMode');
//     if (qm) {
//         qm.textContent = 'New Quote';
//         qm.className = 'badge bg-secondary';
//     }
//     localStorage.removeItem(DRAFT_KEY);
//     renderRooms();
//     renderExtras();
//     updateEstimate();
// }

// function bindEvents() {
//     const qd = document.getElementById('quoteDate'); if (qd) qd.textContent = state.quoteDate;
//     const ed = document.getElementById('estimateDate'); if (ed) ed.textContent = state.quoteDate;
//     createRoomModal();
//     const roomTypeMenu = document.getElementById('roomTypeMenu');
//     if (roomTypeMenu) {
//         roomTypeMenu.innerHTML = ROOM_TYPES.map(t =>
//             `<li><a class="dropdown-item" href="#" data-room-type="${t}">${t}</a></li>`
//         ).join('');
//         roomTypeMenu.addEventListener('click', (e) => {
//             e.preventDefault();
//             const item = e.target.closest('[data-room-type]');
//             if (!item) return;
//             const roomType = item.dataset.roomType;
//             createRoomModal();
//             resetModalForm();
//             document.getElementById('roomName').value = roomType;
//             const isWall = roomType.toLowerCase().includes('wall');
//             const sf = document.getElementById('surfaceFloor'); if (sf) sf.checked =!isWall;
//             const sw = document.getElementById('surfaceWall'); if (sw) sw.checked = isWall;
//             if (roomModal) roomModal.show();
//         });
//     }
//     const extraServicesMenu = document.getElementById('extraServicesMenu');
//     if (extraServicesMenu) {
//         extraServicesMenu.innerHTML = EXTRA_SERVICES.map(s =>
//             `<li><a class="dropdown-item" href="#" data-service-id="${s.id}">${s.name} - ${formatCurrency(s.rate)}/${s.unit}</a></li>`
//         ).join('');
//         extraServicesMenu.addEventListener('click', (e) => {
//             e.preventDefault();
//             const serviceId = e.target.dataset.serviceId;
//             if (serviceId) {
//                 const service = EXTRA_SERVICES.find(s => s.id === serviceId);
//                 if (service) addExtraService(service);
//             }
//         });
//     }

//     document.getElementById('addCustomExtraBtn')?.addEventListener('click', () => {
//         addExtraService({ name: 'Custom Service', rate: 0, unit: 'each' });
//     });

//     const roomTileType = document.getElementById('roomTileType');
//     if (roomTileType) {
//         roomTileType.innerHTML = Object.keys(TILE_RATES).map(t =>
//             `<option value="${t}">${TILE_TYPE_LABELS[t]}</option>`
//         ).join('');
//     }

//     // New: Populate TILE_PROFILES dropdown
//     const roomTileProfile = document.getElementById('roomTileProfile');
//     if (roomTileProfile) {
//         roomTileProfile.innerHTML = Object.keys(TILE_PROFILES).map(p =>
//             `<option value="${p}">${TILE_PROFILES[p].label}</option>`
//         ).join('');
//     }

//     const autoSave = debounce(() => saveDraft(), 1000);

//     ['customerName','customerPhone','customerAddress','notes','waste','subtractSqft','tileBoxCoverage','depositPercent'].forEach(id => {
//         document.getElementById(id)?.addEventListener('input', (e) => {
//             state[id] = id === 'waste' || id === 'subtractSqft' || id === 'tileBoxCoverage' || id === 'depositPercent'
//            ? parseNumber(e.target.value)
//                 : e.target.value;
//             updateEstimate();
//             autoSave();
//         });
//     });

//     ['mortarType','trowelSize'].forEach(id => {
//         document.getElementById(id)?.addEventListener('change', (e) => {
//             state[id] = e.target.value;
//             if (id === 'mortarType') {
//                 const ts = document.getElementById('trowelSection');
//                 if (ts) ts.style.display = e.target.value === 'thinset'? 'block' : 'none';
//             }
//             updateEstimate();
//             autoSave();
//         });
//     });

//     document.getElementById('themeToggle')?.addEventListener('click', () => {
//         state.isDarkMode =!state.isDarkMode;
//         document.body.classList.toggle('dark-mode', state.isDarkMode);
//         const ti = document.getElementById('themeIcon');
//         if (ti) ti.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';
//         localStorage.setItem('perryTheme', state.isDarkMode? 'dark' : 'light');
//     });

//     document.getElementById('clearAllBtn')?.addEventListener('click', () => {
//         if (window.bootstrap) new bootstrap.Modal(document.getElementById('clearAllModal')).show();
//     });

//     document.getElementById('confirmClearBtn')?.addEventListener('click', () => {
//         clearAll();
//         if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('clearAllModal'))?.hide();
//     });

//     document.getElementById('confirmDeleteQuoteBtn')?.addEventListener('click', () => {
//         if (quoteToDelete) {
//             const quotes = getAllQuotes().filter(q => q.id!== quoteToDelete);
//             localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
//             renderSavedQuotes();
//             showToast('Quote deleted', 2000, 'danger');
//             quoteToDelete = null;
//             if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteQuoteModal'))?.hide();
//         }
//     });

//     document.getElementById('saveQuoteBtn')?.addEventListener('click', () => saveQuote(false));
//     document.getElementById('saveAsNewBtn')?.addEventListener('click', () => saveQuote(true));
//     document.getElementById('printBtn')?.addEventListener('click', () => window.print());

//     document.getElementById('textQuoteBtn')?.addEventListener('click', () => {
//         const data = calculateEstimate();
//         let msg = `Perry's Tiling Estimate\nCustomer: ${state.customerName}\n`;
//         if (state.customerPhone) msg += `Phone: ${state.customerPhone}\n`;
//         if (state.customerAddress) msg += `Address: ${state.customerAddress}\n`;
//         msg += `\nLABOR BREAKDOWN\n`;

//         data.roomBreakdown.forEach(r => {
//             const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
//             const dims = `${r.dim1.toFixed(1)}×${r.dim2.toFixed(1)}`;
//             const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
//             msg += `\n${r.name} [${r.surfaceType}]:\n`;
//             msg += `Tile: ${r.tileType} - ${profileLabel}\n`;
//             msg += `${dims} = ${r.baseArea.toFixed(1)} sqft @ ${rateText} - ${r.pattern}\n`;
//             msg += `Labor: ${formatCurrency(r.labor)}\n`;
//             msg += `Boxes: ${r.boxes}\n`;
//             msg += `Thinset: ${Math.ceil(r.exactThinset)} bags (${r.exactThinset.toFixed(2)} calc)\n`;
//         });

//         if (data.extrasBreakdown.length > 0) {
//             msg += `\nEXTRA SERVICES\n`;
//             data.extrasBreakdown.forEach(e => {
//                 msg += `${e.name}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)} = ${formatCurrency(e.total)}\n`;
//             });
//         }

//         msg += `\nTOTAL LABOR: ${formatCurrency(data.grandTotal)}\n`;
//         if (data.deposit > 0) {
//             msg += `DEPOSIT REQUIRED: ${formatCurrency(data.deposit)}\n`;
//             msg += `BALANCE DUE: ${formatCurrency(data.balance)}\n`;
//         }
//         msg += `Billable Area: ${data.totalSqft.toFixed(1)} sqft\n\n`;
//         msg += `MATERIALS NEEDED (Client Supplies):\n`;
//         msg += `${data.purchaseThinsetBags} ${state.mortarType} bags (${data.exactThinsetBags.toFixed(2)} calculated)\n`;
//         msg += `${data.purchaseGroutBags} grout bags (${data.exactGroutBags.toFixed(2)} calculated)\n`;
//         msg += ` - Total Coverage: ${data.groutSqftTotal.toFixed(1)} sqft\n`;
//         msg += ` - Floor: ${data.totalFloorArea.toFixed(1)} sqft | Wall: ${data.totalWallArea.toFixed(1)} sqft\n`;
//         msg += `${data.boxes} tile boxes total\n\n`;
//         if (state.notes) msg += `Notes: ${state.notes}\n\n`;
//         msg += `Labor only - Client supplies all materials\n`;
//         msg += `Quote Date: ${state.quoteDate}\n`;
//         msg += `Call Perry: 876-817-3377`;

//         navigator.clipboard.writeText(msg);
//         showToast('Quote copied to clipboard', 2000, 'success');
//     });

//     document.getElementById('roomsContainer')?.addEventListener('input', (e) => {
//         if (!e.target.classList.contains('room-field') &&!e.target.classList.contains('room-name')) return;
//         const card = e.target.closest('.room-card');
//         if (!card) return;
//         const id = parseInt(card.dataset.roomId);
//         const room = state.rooms.find(r => r.id === id);
//         if (!room) return;
//         const field = e.target.dataset.field;
//         let value = e.target.value;
//         if (['dim1','dim2','customRate'].includes(field)) {
//             value = value === ''? 0 : parseFloat(value) || 0;
//         }
//         room[field] = value;

//         if (field === 'surfaceType') {
//             renderRooms();
//         } else {
//             const badgeOut = card.querySelector('.text-primary');
//             if (badgeOut) {
//                 const total = (parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1);
//                 badgeOut.textContent = `${total} sqft`;
//             }
//         }

//         updateEstimate();
//         autoSave();
//     });

//     document.getElementById('roomsContainer')?.addEventListener('click', (e) => {
//         const editBtn = e.target.closest('.edit-room-btn');
//         const removeBtn = e.target.closest('.remove-room-btn');
//         const card = e.target.closest('.room-card');
//         if (!card) return;

//         const id = parseInt(card.dataset.roomId);
//         const room = state.rooms.find(r => r.id === id);
//         if (!room) return;

//         if (removeBtn) {
//             state.rooms = state.rooms.filter(r => r.id!== id);
//             renderRooms();
//             updateEstimate();
//             autoSave();
//             return;
//         }

//         if (editBtn) {
//             e.preventDefault();
//             createRoomModal();
//             loadRoomToModal(room);
//             if (roomModal) roomModal.show();
//         }
//     });

//     document.getElementById('extrasContainer')?.addEventListener('input', (e) => {
//         if (!e.target.classList.contains('extra-field')) return;
//         const card = e.target.closest('[data-extra-id]');
//         if (!card) return;
//         const id = parseInt(card.dataset.extraId);
//         const extra = state.extras.find(x => x.id === id);
//         if (!extra) return;
//         const field = e.target.dataset.field;
//         extra[field] = (field === 'name' || field === 'unit')? e.target.value : parseNumber(e.target.value);
//         updateEstimate();
//         autoSave();
//     });

//     document.getElementById('extrasContainer')?.addEventListener('click', (e) => {
//         if (!e.target.closest('.remove-extra-btn')) return;
//         const card = e.target.closest('[data-extra-id]');
//         if (!card) return;
//         const id = parseInt(card.dataset.extraId);
//         state.extras = state.extras.filter(x => x.id!== id);
//         renderExtras();
//         updateEstimate();
//         autoSave();
//     });

//     document.getElementById('savedQuotes')?.addEventListener('click', (e) => {
//         const loadBtn = e.target.closest('.load-quote-btn');
//         const delBtn = e.target.closest('.delete-quote-btn');
//         if (loadBtn) loadQuote(loadBtn.dataset.id);
//         if (delBtn) deleteQuote(delBtn.dataset.id);
//     });

//     document.getElementById('clearAllQuotesBtn')?.addEventListener('click', () => {
//         if (window.bootstrap) new bootstrap.Modal(document.getElementById('deleteAllQuotesModal')).show();
//     });

//     document.getElementById('confirmDeleteAllQuotesBtn')?.addEventListener('click', () => {
//         localStorage.removeItem(QUOTES_KEY);
//         renderSavedQuotes();
//         showToast('All quotes deleted', 2000, 'danger');
//         if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteAllQuotesModal'))?.hide();
//     });

//     createRoomModal();
// }

// document.addEventListener('DOMContentLoaded', () => {
//     state.isDarkMode = localStorage.getItem('perryTheme')!== 'light';
//     document.body.classList.toggle('dark-mode', state.isDarkMode);
//     const themeIcon = document.getElementById('themeIcon');
//     if (themeIcon) themeIcon.className = state.isDarkMode? 'bi bi-sun' : 'bi bi-moon-stars';

//     bindEvents();
//     loadDraft();
//     renderSavedQuotes();
//     renderExtras();
//     updateEstimate();
// });




// ==========================================
// PERRY'S TILING CALCULATOR - ENGINE v4.6 (JMD)
// Perry Mode: Pooled materials, Grout = Floor + Wall
// TILE_PROFILES dropdown, Labor subtract fix
// + Phone formatting, Mobile header responsive
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

// New: TILE_PROFILES for dropdown selection
const TILE_PROFILES = {
    '3x6': { label: '3x6 Subway', length: 3, width: 6, thickness: 0.25 },
    '6x24': { label: '6x24 Plank', length: 6, width: 24, thickness: 0.375 },
    '12x12': { label: '12x12', length: 12, width: 12, thickness: 0.375 },
    '12x24': { label: '12x24', length: 12, width: 24, thickness: 0.375 },
    '24x24': { label: '24x24', length: 24, width: 24, thickness: 0.375 },
    '24x48': { label: '24x48 Large Format', length: 24, width: 48, thickness: 0.375 },
    'mosaic': { label: 'Mosaic Sheet', length: 12, width: 12, thickness: 0.25 }
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
    ceramic: 'Ceramic',
    porcelain: 'Porcelain',
    plank_porcelain: 'Plank Porcelain',
    mosaic: 'Mosaic',
    travertine: 'Travertine',
    marble: 'Marble',
    slate: 'Slate',
    quarry: 'Quarry',
    large_format: 'Large Format Tile'
};

const GROUT_BAG_COVERAGE = 100;

let state = {
    customerName: '', customerPhone: '', customerAddress: '', notes: '',
    isDarkMode: true, rooms: [], roomIdCounter: 0,
    quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
    quoteId: null, tileBoxCoverage: 10,
    mortarType: 'thinset', trowelSize: '60',
    extras: [], extraIdCounter: 0, depositPercent: 0
};

let roomModal = null;
let quoteToDelete = null;
let editingRoomId = null;
const DRAFT_KEY = 'tilingDraft_v4_jmd';
const QUOTES_KEY = 'tilingQuotes_v4_jmd';

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-JM', {
        style: 'currency', currency: CURRENCY, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatSqft(sqft) { return `${parseFloat(sqft || 0).toFixed(1)} sqft`; }
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function parseNumber(value) { const num = parseFloat(value); return isNaN(num)? 0 : num; }

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

function calculateEstimate() {
    const {rooms, waste, subtractSqft, tileBoxCoverage, mortarType, trowelSize, depositPercent} = state;

    let totalGrossInstallArea = 0;
    let totalFloorArea = 0;
    let totalWallArea = 0;
    let baseLaborAccumulator = 0;
    let exactThinsetBagsTotal = 0;
    let totalProjectBoxesCount = 0;

    const roomBreakdown = [];
    const globalWasteFactor = parseNumber(waste) / 100;

    rooms.forEach(room => {
        const d1 = parseNumber(room.dim1);
        const d2 = parseNumber(room.dim2);
        const baseArea = d1 * d2;
        totalGrossInstallArea += baseArea;

        const isWall = room.surfaceType === 'wall';
        if (isWall) {
            totalWallArea += baseArea;
        } else {
            totalFloorArea += baseArea;
        }

        const tileType = room.tileType || 'ceramic';
        const defaultRate = isWall? (TILE_RATES[tileType]?.wall || 200) : (TILE_RATES[tileType]?.floor || 180);
        const baseRate = parseNumber(room.customRate) > 0? parseNumber(room.customRate) : defaultRate;
        const patternConfig = PATTERNS[room.pattern] || { name: 'Straight Lay', multiplier: 1.0, waste: 0.10 };
        const combinedWasteFactor = Math.max(globalWasteFactor, patternConfig.waste);

        const heightAdder = (room.isHeight && isWall)? (60 * baseArea) : 0;
        let roomLaborTotal = (baseArea * baseRate * patternConfig.multiplier) + heightAdder;
        baseLaborAccumulator += roomLaborTotal;

        const trowelCov = parseNumber(trowelSize) || 60;
        let roomThinsetBags = mortarType === 'thinset'? (baseArea / trowelCov) : (baseArea / 100);
        if (isWall) roomThinsetBags *= 1.25;
        exactThinsetBagsTotal += roomThinsetBags;

        const roomAreaWithWaste = baseArea * (1 + combinedWasteFactor);
        const roomBoxes = Math.ceil(roomAreaWithWaste / (parseNumber(tileBoxCoverage) || 10));
        totalProjectBoxesCount += roomBoxes;

        roomBreakdown.push({
            id: room.id,
            name: room.name,
            tileType: TILE_TYPE_LABELS[tileType] || 'Ceramic',
            tileProfile: room.tileProfile || '12x24',
            baseArea: baseArea,
            rate: baseRate,
            pattern: patternConfig.name,
            labor: roomLaborTotal,
            customRate: parseNumber(room.customRate) > 0,
            boxes: roomBoxes,
            surfaceType: isWall? 'Wall' : 'Floor',
            dim1: d1,
            dim2: d2,
            exactThinset: roomThinsetBags
        });
    });

    // Perry Mode: Grout = Total Floor + Total Wall, no tile size math
    const totalGroutSqft = totalFloorArea + totalWallArea;
    const exactGroutBags = totalGroutSqft / GROUT_BAG_COVERAGE;
    const purchaseGroutBags = Math.ceil(exactGroutBags);

    let extrasTotal = 0;
    const extrasBreakdown = [];
    state.extras.forEach(extra => {
        const qty = parseNumber(extra.quantity);
        const rate = parseNumber(extra.rate);
        const lineTotal = qty * rate;
        extrasTotal += lineTotal;
        extrasBreakdown.push({
            name: extra.name, quantity: qty, unit: extra.unit, rate: rate, total: lineTotal
        });
    });

    // FIX: Labor subtraction - if subtractSqft reduces billable area, reduce labor too
    const deductionSqft = parseNumber(subtractSqft);
    const netBillableArea = Math.max(0, totalGrossInstallArea - deductionSqft);

    let laborDeductionCredit = 0;
    if (totalGrossInstallArea > 0 && deductionSqft > 0) {
        const averageLaborPerSqft = baseLaborAccumulator / totalGrossInstallArea;
        laborDeductionCredit = Math.min(baseLaborAccumulator, deductionSqft * averageLaborPerSqft);
    }

    let modifiedLaborSubtotal = Math.max(0, baseLaborAccumulator - laborDeductionCredit) + extrasTotal;
    const deposit = modifiedLaborSubtotal * (parseNumber(state.depositPercent) / 100);
    const balance = modifiedLaborSubtotal - deposit;
    const purchaseThinsetBags = Math.ceil(exactThinsetBagsTotal);

    return {
        totalSqft: netBillableArea,
        installArea: totalGrossInstallArea,
        totalFloorArea,
        totalWallArea,
        laborTotal: modifiedLaborSubtotal,
        grandTotal: modifiedLaborSubtotal,
        subtotal: modifiedLaborSubtotal,
        deposit,
        balance,
        exactThinsetBags: exactThinsetBagsTotal,
        purchaseThinsetBags: purchaseThinsetBags,
        exactGroutBags: exactGroutBags,
        purchaseGroutBags: purchaseGroutBags,
        groutSqftTotal: totalGroutSqft,
        boxes: totalProjectBoxesCount,
        roomBreakdown,
        extrasBreakdown,
        extrasTotal
    };
}

function updateEstimate() {
    const data = calculateEstimate();
    const elements = {
        sqftOutLarge: data.totalSqft.toFixed(1),
        sqftOut: data.totalSqft.toFixed(1),
        totalProjectOut: formatCurrency(data.grandTotal),
        laborCostOut: formatCurrency(data.laborTotal),
        mortarOut: data.purchaseThinsetBags,
        groutOut: data.purchaseGroutBags,
        boxesOut: data.boxes,
        mortarLabel: state.mortarType === 'thinset'? 'Thinset Bags' : 'Cement Bags'
    };
    Object.entries(elements).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });
    const depositDiv = document.getElementById('depositSection');
    if (depositDiv) {
        if (data.deposit > 0) {
            const depOut = document.getElementById('depositOut');
            const balOut = document.getElementById('balanceOut');
            if (depOut) depOut.textContent = formatCurrency(data.deposit);
            if (balOut) balOut.textContent = formatCurrency(data.balance);
            depositDiv.style.display = 'block';
        } else {
            depositDiv.style.display = 'none';
        }
    }
    const roomBreakdownList = document.getElementById('roomBreakdownList');
    if (roomBreakdownList) {
        roomBreakdownList.innerHTML = data.roomBreakdown.map(r => {
            const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
            const dims = `${r.dim1.toFixed(1)}×${r.dim2.toFixed(1)}`;
            const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
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
                        <span>${formatCurrency(r.labor)}</span>
                    </div>
                    <div class="d-flex justify-content-between small text-muted">
                        <span>Thinset: ${Math.ceil(r.exactThinset)} bags (${r.exactThinset.toFixed(2)} calc)</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    const extrasDiv = document.getElementById('extrasBreakdownList');
    const extrasSection = document.getElementById('extrasSection');
    if (extrasDiv && extrasSection) {
        extrasDiv.innerHTML = data.extrasBreakdown.map(e =>
            `<div class="d-flex justify-content-between small mb-1">
                <span>${escapeHtml(e.name)}: ${e.quantity} ${e.unit} @ ${formatCurrency(e.rate)}</span>
                <span>${formatCurrency(e.total)}</span>
            </div>`
        ).join('');
        extrasSection.style.display = data.extrasBreakdown.length? 'block' : 'none';
    }
    updateClientInfo();
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = state.rooms.length? 'none' : 'block';
    const materialList = document.getElementById('materialList');
    if (materialList) {
        const materials = [];
        if (data.purchaseThinsetBags > 0) {
            materials.push(`<li class="list-group-item d-flex justify-content-between">
                <span>${state.mortarType === 'thinset'? 'Thinset' : 'Cement'}</span>
                <span><strong>${data.purchaseThinsetBags} bags</strong> <small class="text-muted">(${data.exactThinsetBags.toFixed(2)} calc)</small></span>
            </li>`);
        }
        if (data.purchaseGroutBags > 0) {
            materials.push(`<li class="list-group-item d-flex justify-content-between">
                <span>Grout</span>
                <span><strong>${data.purchaseGroutBags} bags</strong> <small class="text-muted">(${data.exactGroutBags.toFixed(2)} calc, ${data.groutSqftTotal.toFixed(1)} sqft)</small></span>
            </li>`);
        }
        if (data.totalFloorArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Floor Area</span><span>${data.totalFloorArea.toFixed(1)} sqft</span></li>`);
        if (data.totalWallArea > 0) materials.push(`<li class="list-group-item d-flex justify-content-between small text-muted"><span>Wall Area</span><span>${data.totalWallArea.toFixed(1)} sqft</span></li>`);
        if (data.totalSqft > 0) materials.push(`<li class="list-group-item d-flex justify-content-between"><span>Tile Boxes Total</span><span>${data.boxes} boxes</span></li>`);
        materialList.innerHTML = materials.join('') || '<li class="list-group-item text-muted">No materials calculated yet</li>';
    }
}

function updateClientInfo() {
    const name = state.customerName.trim();
    const phone = state.customerPhone.trim();
    const info = document.getElementById('clientInfo');
    if (info) {
        if (name || phone) {
            info.innerHTML = `<strong>${escapeHtml(name) || 'Customer'}</strong><br><small>${escapeHtml(phone) || ''}</small>`;
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    }
}

function renderRooms() {
    const container = document.getElementById('roomsContainer');
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
                    <span class="fw-bold text-primary">${((parseNumber(room.dim1)) * (parseNumber(room.dim2))).toFixed(1)} sqft</span>
                </div>
            </div>
        </div>
    `}).join('');
}

function addExtraService(service) {
    const id = state.extraIdCounter++;
    state.extras.push({
        id, name: service.name, quantity: 1, rate: service.rate, unit: service.unit
    });
    renderExtras();
    updateEstimate();
    saveDraft();
}

function renderExtras() {
    const container = document.getElementById('extrasContainer');
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
    const saveBtn = document.getElementById('saveRoomBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            if (editingRoomId!== null) { updateRoomFromModal(); } else { addRoomFromModal(); }
            // Fix for aria-hidden focus bug
            if (document.activeElement) document.activeElement.blur();
            roomModal.hide();
            resetModalForm();
        };
    }
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
        id,
        name: document.getElementById('roomName').value || `Area ${state.rooms.length + 1}`,
        surfaceType: surfaceType,
        dim1: parseNumber(document.getElementById('roomDim1').value),
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
    const draft = {...state, savedAt: new Date().toISOString()};
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
        const parsed = JSON.parse(draft);
        state = {...state,...parsed};
        state.subtractSqft = parseNumber(state.subtractSqft);
        state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
        state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;
        Object.keys(state).forEach(key => {
            const el = document.getElementById(key);
            if (el && typeof state[key] === 'string') el.value = state[key];
        });
        const elements = {
            mortarType: state.mortarType, trowelSize: state.trowelSize, depositPercent: state.depositPercent
        };
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id); if (el) el.value = value;
        });
        const ts = document.getElementById('trowelSection'); if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
        renderRooms();
        renderExtras();
        showToast(`Draft restored`, 2000, 'info');
    }
}

function saveQuote(asNew = false) {
    const quotes = getAllQuotes();
    const id = asNew ||!state.quoteId? `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : state.quoteId;
    const quote = {...state, id, savedAt: new Date().toISOString()};
    const existingIndex = quotes.findIndex(q => q.id === id);
    if (existingIndex >= 0) { quotes[existingIndex] = quote; } else { quotes.push(quote); }
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
    state.quoteId = id;
    const qm = document.getElementById('quoteMode'); if (qm) { qm.textContent = 'Saved Quote'; qm.className = 'badge bg-success'; }
    renderSavedQuotes();
    showToast(asNew? 'Quote saved as new configuration' : 'Quote modifications saved', 2000, 'success');
}

function getAllQuotes() { const quotes = localStorage.getItem(QUOTES_KEY); return quotes? JSON.parse(quotes) : []; }

function loadQuote(id) {
    const quotes = getAllQuotes();
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;
    state = {...quote};
    state.subtractSqft = parseNumber(state.subtractSqft);
    state.roomIdCounter = state.rooms.length? Math.max(...state.rooms.map(r => r.id)) + 1 : 0;
    state.extraIdCounter = state.extras.length? Math.max(...state.extras.map(e => e.id)) + 1 : 0;
    Object.keys(state).forEach(key => {
        const el = document.getElementById(key);
        if (el && typeof state[key] === 'string') el.value = state[key];
    });
    const elements = { mortarType: state.mortarType, trowelSize: state.trowelSize, depositPercent: state.depositPercent || 0 };
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id); if (el) el.value = value;
    });
    const ts = document.getElementById('trowelSection'); if (ts) ts.style.display = state.mortarType === 'thinset'? 'block' : 'none';
    const qm = document.getElementById('quoteMode'); if (qm) { qm.textContent = 'Loaded Quote'; qm.className = 'badge bg-info'; }
    renderRooms();
    renderExtras();
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
    const section = document.getElementById('savedSection');
    const container = document.getElementById('savedQuotes');
    if (!section ||!container) return;
    if (quotes.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    container.innerHTML = quotes.map(q => `
        <div class="saved-quote-item p-2 border rounded mb-2">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${escapeHtml(q.customerName || 'Unnamed')}</strong>
                    <div class="small text-muted">${new Date(q.savedAt).toLocaleDateString('en-JM')} - ${formatCurrency(calculateEstimateFromData(q).grandTotal)}</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary load-quote-btn me-1" data-id="${q.id}">Load</button>
                    <button class="btn btn-sm btn-outline-danger delete-quote-btn" data-id="${q.id}">Del</button>
                </div>
            </div>
        </div>
    `).join('');
}

function calculateEstimateFromData(data) {
    const tempState = state;
    state = data;
    const result = calculateEstimate();
    state = tempState;
    return result;
}

function clearAll() {
    state = {
        customerName: '', customerPhone: '', customerAddress: '', notes: '',
        isDarkMode: state.isDarkMode, rooms: [], roomIdCounter: 0,
        quoteDate: new Date().toLocaleDateString('en-JM'), waste: 10, subtractSqft: 0,
        quoteId: null, tileBoxCoverage: 10,
        mortarType: 'thinset', trowelSize: '60',
        extras: [], extraIdCounter: 0,
        depositPercent: 0
    };
    ['customerName','customerPhone','customerAddress','notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const dp = document.getElementById('depositPercent'); if (dp) dp.value = '0';
    const qm = document.getElementById('quoteMode');
    if (qm) {
        qm.textContent = 'New Quote';
        qm.className = 'badge bg-secondary';
    }
    localStorage.removeItem(DRAFT_KEY);
    renderRooms();
    renderExtras();
    updateEstimate();
}

function bindEvents() {
    const qd = document.getElementById('quoteDate'); if (qd) qd.textContent = state.quoteDate;
    const ed = document.getElementById('estimateDate'); if (ed) ed.textContent = state.quoteDate;
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
    // const extraServicesMenu = document.getElementById('extraServicesMenu');
    // if (extraServicesMenu) {
    //     extraServicesMenu.innerHTML = EXTRA_SERVICES.map(s =>
    //         `<li><a class="dropdown-item" href="#" data-service-id="${s.id}">${s.name} - ${formatCurrency(s.rate)}/${s.unit}</a></li>`
    //     ).join('');
    //     extraServicesMenu.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         const serviceId = e.target.dataset.serviceId;
    //         if (serviceId) {
    //             const service = EXTRA_SERVICES.find(s => s.id === serviceId);
    //             if (service) addExtraService(service);
    //         }
    //     });
    // }


    const extraServicesMenu = document.getElementById('extraServicesMenu');
if (extraServicesMenu) {
    const presetItems = EXTRA_SERVICES.map(s =>
        `<li><a class="dropdown-item d-flex justify-content-between align-items-center py-2" href="#" data-service-id="${s.id}">
            <span>${s.name}</span>
            <span class="badge bg-secondary ms-2">${formatCurrency(s.rate)}/${s.unit}</span>
        </a></li>`
    ).join('');
    
    // Insert presets at top, keeps your divider + Custom Service button below
    extraServicesMenu.insertAdjacentHTML('afterbegin', presetItems);
    
    extraServicesMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const item = e.target.closest('[data-service-id]');
        if (item) {
            const service = EXTRA_SERVICES.find(s => s.id === item.dataset.serviceId);
            if (service) addExtraService(service);
            bootstrap.Dropdown.getInstance(document.querySelector('.dropdown-toggle'))?.hide();
        }
    });
}

document.getElementById('addCustomExtraBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    addExtraService({ name: 'Custom Service', rate: 0, unit: 'each' });
    bootstrap.Dropdown.getInstance(document.querySelector('.dropdown-toggle'))?.hide();
});

    document.getElementById('addCustomExtraBtn')?.addEventListener('click', () => {
        addExtraService({ name: 'Custom Service', rate: 0, unit: 'each' });
    });

    const roomTileType = document.getElementById('roomTileType');
    if (roomTileType) {
        roomTileType.innerHTML = Object.keys(TILE_RATES).map(t =>
            `<option value="${t}">${TILE_TYPE_LABELS[t]}</option>`
        ).join('');
    }

    // New: Populate TILE_PROFILES dropdown
    const roomTileProfile = document.getElementById('roomTileProfile');
    if (roomTileProfile) {
        roomTileProfile.innerHTML = Object.keys(TILE_PROFILES).map(p =>
            `<option value="${p}">${TILE_PROFILES[p].label}</option>`
        ).join('');
    }

    const autoSave = debounce(() => saveDraft(), 1000);

    // Phone formatting: XXX-XXX-XXXX Jamaica format
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
            updateClientInfo();
            autoSave();
        });

        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.endsWith('-')) {
                e.target.value = e.target.value.slice(0, -1);
                e.preventDefault();
            }
        });
    }

    ['customerName','customerAddress','notes','waste','subtractSqft','tileBoxCoverage','depositPercent'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            state[id] = id === 'waste' || id === 'subtractSqft' || id === 'tileBoxCoverage' || id === 'depositPercent'
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
            const quotes = getAllQuotes().filter(q => q.id!== quoteToDelete);
            localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
            renderSavedQuotes();
            showToast('Quote deleted', 2000, 'danger');
            quoteToDelete = null;
            if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteQuoteModal'))?.hide();
        }
    });

    document.getElementById('saveQuoteBtn')?.addEventListener('click', () => saveQuote(false));
    document.getElementById('saveAsNewBtn')?.addEventListener('click', () => saveQuote(true));
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());

    document.getElementById('textQuoteBtn')?.addEventListener('click', () => {
        const data = calculateEstimate();
        let msg = `Perry's Tiling Estimate\nCustomer: ${state.customerName}\n`;
        if (state.customerPhone) msg += `Phone: ${state.customerPhone}\n`;
        if (state.customerAddress) msg += `Address: ${state.customerAddress}\n`;
        msg += `\nLABOR BREAKDOWN\n`;

        data.roomBreakdown.forEach(r => {
            const rateText = r.customRate? `Custom ${formatCurrency(r.rate)}/sqft` : `${formatCurrency(r.rate)}/sqft`;
            const dims = `${r.dim1.toFixed(1)}×${r.dim2.toFixed(1)}`;
            const profileLabel = TILE_PROFILES[r.tileProfile]?.label || r.tileProfile;
            msg += `\n${r.name} [${r.surfaceType}]:\n`;
            msg += `Tile: ${r.tileType} - ${profileLabel}\n`;
            msg += `${dims} = ${r.baseArea.toFixed(1)} sqft @ ${rateText} - ${r.pattern}\n`;
            msg += `Labor: ${formatCurrency(r.labor)}\n`;
            msg += `Boxes: ${r.boxes}\n`;
            msg += `Thinset: ${Math.ceil(r.exactThinset)} bags (${r.exactThinset.toFixed(2)} calc)\n`;
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
        msg += `Billable Area: ${data.totalSqft.toFixed(1)} sqft\n\n`;
        msg += `MATERIALS NEEDED (Client Supplies):\n`;
        msg += `${data.purchaseThinsetBags} ${state.mortarType} bags (${data.exactThinsetBags.toFixed(2)} calculated)\n`;
        msg += `${data.purchaseGroutBags} grout bags (${data.exactGroutBags.toFixed(2)} calculated)\n`;
        msg += ` - Total Coverage: ${data.groutSqftTotal.toFixed(1)} sqft\n`;
        msg += ` - Floor: ${data.totalFloorArea.toFixed(1)} sqft | Wall: ${data.totalWallArea.toFixed(1)} sqft\n`;
        msg += `${data.boxes} tile boxes total\n\n`;
        if (state.notes) msg += `Notes: ${state.notes}\n\n`;
        msg += `Labor only - Client supplies all materials\n`;
        msg += `Quote Date: ${state.quoteDate}\n`;
        msg += `Call Perry: 876-817-3377`;

        navigator.clipboard.writeText(msg);
        showToast('Quote copied to clipboard', 2000, 'success');
    });

    document.getElementById('roomsContainer')?.addEventListener('input', (e) => {
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
                const total = (parseNumber(room.dim1) * parseNumber(room.dim2)).toFixed(1);
                badgeOut.textContent = `${total} sqft`;
            }
        }

        updateEstimate();
        autoSave();
    });

    document.getElementById('roomsContainer')?.addEventListener('click', (e) => {
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

    document.getElementById('extrasContainer')?.addEventListener('input', (e) => {
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

    document.getElementById('extrasContainer')?.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-extra-btn')) return;
        const card = e.target.closest('[data-extra-id]');
        if (!card) return;
        const id = parseInt(card.dataset.extraId);
        state.extras = state.extras.filter(x => x.id!== id);
        renderExtras();
        updateEstimate();
        autoSave();
    });

    document.getElementById('savedQuotes')?.addEventListener('click', (e) => {
        const loadBtn = e.target.closest('.load-quote-btn');
        const delBtn = e.target.closest('.delete-quote-btn');
        if (loadBtn) loadQuote(loadBtn.dataset.id);
        if (delBtn) deleteQuote(delBtn.dataset.id);
    });

    document.getElementById('clearAllQuotesBtn')?.addEventListener('click', () => {
        if (window.bootstrap) new bootstrap.Modal(document.getElementById('deleteAllQuotesModal')).show();
    });

    document.getElementById('confirmDeleteAllQuotesBtn')?.addEventListener('click', () => {
        localStorage.removeItem(QUOTES_KEY);
        renderSavedQuotes();
        showToast('All quotes deleted', 2000, 'danger');
        if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById('deleteAllQuotesModal'))?.hide();
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
    renderExtras();
    updateEstimate();
});