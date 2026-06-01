const STORAGE_KEY = 'perryQuotes_v3';
const DRAFT_KEY = 'perryDraft_v3';
let rooms = [];
let roomIdCounter = 0;
let toastTimer;

const formFields = ['clientName', 'clientPhone', 'jobAddress', 'jobNotes', 'subtract', 'waste', 'tileSize', 'boxCoverage', 'jointW', 'pattern', 'laborMethod', 'laborRateSqft', 'laborRateRoom', 'laborFixed', 'mortarType', 'trowel', 'tilePriceSqft', 'mortarPrice', 'groutPrice', 'profitMargin', 'taxRate'];

formFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', autoSaveDraft);
    el.addEventListener('change', autoSaveDraft);
});

document.getElementById('mortarType').addEventListener('change', function() {
    const isThinset = this.value === 'thinset';
    document.getElementById('trowelSection').style.display = isThinset? 'block' : 'none';
    document.getElementById('cementSection').style.display = isThinset? 'none' : 'block';
    document.getElementById('mortarLabel').textContent = isThinset? 'Thinset Bags' : 'Cement Bags';
});

document.getElementById('laborMethod').addEventListener('change', function() {
    const method = this.value;
    document.getElementById('laborRateSqftSection').style.display = method === 'sqft'? 'block' : 'none';
    document.getElementById('laborRateRoomSection').style.display = method === 'room'? 'block' : 'none';
    document.getElementById('laborFixedSection').style.display = method === 'fixed'? 'block' : 'none';
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function storageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

function addRoom(type) {
    roomIdCounter++;
    const room = {
        id: roomIdCounter,
        type: type,
        name: '',
        length: '',
        width: '',
        height: type === 'bathroom-wall'? '8' : ''
    };
    rooms.push(room);
    renderRooms();
    autoSaveDraft();
}

function deleteRoom(id) {
    rooms = rooms.filter(r => r.id!== id);
    renderRooms();
    autoSaveDraft();
}

function updateRoom(id, field, value) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        room[field] = value;
        autoSaveDraft();
    }
}

function autoSaveDraft() {
    if (!storageAvailable()) return;
    const draft = {
        rooms: rooms,
        form: {}
    };
    formFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) draft.form[id] = el.value;
    });
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch(e) {
        console.error('Draft save failed:', e);
    }
}

function getRoomTypeName(type) {
    const names = {
        'living': 'Living Room',
        'dining': 'Dining Room',
        'foyer': 'Foyer/Entry',
        'porch': 'Porch/Patio',
        'bedroom': 'Bedroom',
        'bathroom': 'Bathroom - Floor',
        'bathroom-wall': 'Bathroom - Walls',
        'hallway': 'Hallway',
        'stairs': 'Stairs',
        'kitchen': 'Kitchen Floor',
        'backsplash': 'Backsplash',
        'other': 'Other Area'
    };
    return names[type] || 'Room';
}

function renderRooms() {
    const container = document.getElementById('roomsContainer');
    if (rooms.length === 0) {
        container.innerHTML = `
            <div class="empty-rooms-cta">
                <p class="text-muted mb-3">No rooms added yet</p>
                <button class="btn btn-brand dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-plus-circle"></i> Add First Room
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="addRoom('living')">Living Room</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('dining')">Dining Room</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('foyer')">Foyer/Entry</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('porch')">Porch/Patio</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('bedroom')">Bedroom</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('bathroom')">Bathroom - Floor</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('bathroom-wall')">Bathroom - Walls</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('hallway')">Hallway</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('stairs')">Stairs</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('kitchen')">Kitchen Floor</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('backsplash')">Backsplash</a></li>
                    <li><a class="dropdown-item" href="#" onclick="addRoom('other')">Other Area</a></li>
                </ul>
            </div>
        `;
        return;
    }

    container.innerHTML = rooms.map(room => {
        const isWall = room.type === 'bathroom-wall';
        return `
        <div class="room-item">
            <i class="bi bi-x-circle room-delete" onclick="deleteRoom(${room.id})"></i>
            <div class="fw-bold mb-2 pe-4">${getRoomTypeName(room.type)}</div>
            <div class="row g-2">
                <div class="col-12">
                    <input type="text" class="form-control form-control-sm" placeholder="Room name/notes"
                        value="${escapeHtml(room.name)}" oninput="updateRoom(${room.id}, 'name', this.value)">
                </div>
                <div class="${isWall? 'col-4' : 'col-6'}">
                    <input type="number" class="form-control form-control-sm" placeholder="Length (ft)"
                        value="${escapeHtml(room.length)}" inputmode="decimal" step="0.25"
                        oninput="updateRoom(${room.id}, 'length', this.value)">
                </div>
                <div class="${isWall? 'col-4' : 'col-6'}">
                    <input type="number" class="form-control form-control-sm" placeholder="Width (ft)"
                        value="${escapeHtml(room.width)}" inputmode="decimal" step="0.25"
                        oninput="updateRoom(${room.id}, 'width', this.value)">
                </div>
                ${isWall? `
                <div class="col-4">
                    <input type="number" class="form-control form-control-sm" placeholder="Height (ft)"
                        value="${escapeHtml(room.height)}" inputmode="decimal" step="0.25"
                        oninput="updateRoom(${room.id}, 'height', this.value)">
                </div>
                ` : ''}
            </div>
        </div>
    `}).join('');
}

function parseTileSize(str) {
    str = str.replace(/\s+/g,'');
    const match = str.match(/^(\d+(\.\d+)?)x(\d+(\.\d+)?)$/i);
    if (!match) {
        showToast('Tile size must be like 12x12');
        return null;
    }
    return {
        l: parseFloat(match[1]),
        w: parseFloat(match[3])
    };
}

function formatMoney(num) {
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(message) {
    clearTimeout(toastTimer);
    const toast = document.getElementById('toast');
    document.getElementById('toastText').textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function calculate() {
    if (rooms.length === 0) {
        showToast('Add at least one room first');
        return;
    }

    const tile = parseTileSize(document.getElementById('tileSize').value);
    if (!tile) return;

    const subtract = parseFloat(document.getElementById('subtract').value) || 0;
    const waste = parseFloat(document.getElementById('waste').value);
    const boxCoverage = parseFloat(document.getElementById('boxCoverage').value);
    const jointW = parseFloat(document.getElementById('jointW').value) || 0.125;
    const patternMultiplier = parseFloat(document.getElementById('pattern').value) || 1;
    const laborMethod = document.getElementById('laborMethod').value;
    const laborRateSqft = parseFloat(document.getElementById('laborRateSqft').value);
    const laborRateRoom = parseFloat(document.getElementById('laborRateRoom').value);
    const laborFixed = parseFloat(document.getElementById('laborFixed').value);
    const mortarType = document.getElementById('mortarType').value;
    const trowelCoverage = parseFloat(document.getElementById('trowel').value) || 60;
    const tilePriceSqft = parseFloat(document.getElementById('tilePriceSqft').value) || 0;
    const mortarPrice = parseFloat(document.getElementById('mortarPrice').value) || 0;
    const groutPrice = parseFloat(document.getElementById('groutPrice').value) || 0;
    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const jobAddress = document.getElementById('jobAddress').value;
    const jobNotes = document.getElementById('jobNotes').value;

    if (waste < 0) {
        showToast('Waste percentage cannot be negative');
        return;
    }
    if (boxCoverage <= 0) {
        showToast('Box coverage must be greater than 0');
        return;
    }
    if (subtract < 0) {
        showToast('Subtract value cannot be negative');
        return;
    }

    let totalBaseSqft = 0;
    let roomDetails = [];

    rooms.forEach(room => {
        const l = parseFloat(room.length) || 0;
        const w = parseFloat(room.width) || 0;
        let sqft = 0;

        if (room.type === 'bathroom-wall') {
            const h = parseFloat(room.height) || 8;
            const perimeter = (l + w) * 2;
            sqft = perimeter * h;
        } else {
            sqft = l * w;
        }

        if (sqft > 0) {
            totalBaseSqft += sqft;
            roomDetails.push({
                name: room.name || getRoomTypeName(room.type),
                sqft: sqft
            });
        }
    });

    if (totalBaseSqft === 0) {
        showToast('Enter dimensions for rooms');
        return;
    }

    const baseSqft = Math.max(0, totalBaseSqft - subtract);
    const totalSqft = baseSqft * (1 + waste/100) * patternMultiplier;

    const billableRooms = rooms.filter(r => {
        const l = parseFloat(r.length) || 0;
        const w = parseFloat(r.width) || 0;
        return l > 0 && w > 0;
    }).length;

    let laborCost = 0;
    if (laborMethod === 'sqft') {
        if (laborRateSqft < 0) {
            showToast('Labor rate cannot be negative');
            return;
        }
        laborCost = baseSqft * laborRateSqft;
    } else if (laborMethod === 'room') {
        if (laborRateRoom < 0) {
            showToast('Labor rate cannot be negative');
            return;
        }
        laborCost = billableRooms * laborRateRoom;
    } else {
        if (laborFixed < 0) {
            showToast('Fixed labor cannot be negative');
            return;
        }
        laborCost = laborFixed;
    }

    let mortarBags = 0;
    if (mortarType === 'thinset') {
        mortarBags = Math.ceil(totalSqft / trowelCoverage);
    } else {
        mortarBags = Math.ceil(totalSqft / 100);
    }

    const groutCoverage = 200 / (((tile.l + tile.w) / (tile.l * tile.w)) * jointW * 12);
    const groutBags = Math.ceil(totalSqft / groutCoverage);
    const tileBoxes = Math.ceil(totalSqft / boxCoverage);
    const tileSqFt = (tile.l * tile.w) / 144;
    const totalTiles = Math.ceil(totalSqft / tileSqFt);

    const tileCost = totalSqft * tilePriceSqft;
    const mortarCost = mortarBags * mortarPrice;
    const groutCost = groutBags * groutPrice;
    const materialCost = tileCost + mortarCost + groutCost;

    const subtotal = materialCost + laborCost;
    const profitAmt = subtotal * (profitMargin / 100);
    const taxableAmt = subtotal + profitAmt;
    const taxAmt = taxableAmt * (taxRate / 100);
    const grandTotal = taxableAmt + taxAmt;

    const breakdownHtml = roomDetails.map(r => `
        <div class="d-flex justify-content-between small text-muted">
            <span>${escapeHtml(r.name)}</span>
            <span>${r.sqft.toFixed(1)} sq ft</span>
        </div>
    `).join('');
    document.getElementById('roomBreakdown').innerHTML = roomDetails.length > 0?
        '<div class="mb-2"><strong class="small">Room Breakdown:</strong>' + breakdownHtml + '</div>' : '';

    document.getElementById('sqftOut').textContent = totalSqft.toLocaleString('en-US', { maximumFractionDigits: 1 });
    document.getElementById('boxesOut').textContent = tileBoxes.toLocaleString('en-US');
    document.getElementById('mortarOut').textContent = mortarBags.toLocaleString('en-US');
    document.getElementById('groutOut').textContent = groutBags.toLocaleString('en-US');
    document.getElementById('laborCostOut').textContent = formatMoney(laborCost);
    document.getElementById('totalTilesOut').textContent = totalTiles.toLocaleString('en-US') + ' tiles';

    if (materialCost > 0) {
        document.getElementById('materialCostSection').style.display = 'block';
        document.getElementById('materialCostOut').textContent = formatMoney(materialCost);
        document.getElementById('tileNote').style.display = 'none';
    } else {
        document.getElementById('materialCostSection').style.display = 'none';
        document.getElementById('tileNote').style.display = 'block';
    }

    if (profitMargin > 0 || taxRate > 0 || materialCost > 0) {
        document.getElementById('subtotalSection').style.display = 'block';
        document.getElementById('subtotalOut').textContent = formatMoney(subtotal);
    } else {
        document.getElementById('subtotalSection').style.display = 'none';
    }

    if (profitMargin > 0) {
        document.getElementById('profitSection').style.display = 'block';
        document.getElementById('profitLabel').textContent = `Profit (${profitMargin}%)`;
        document.getElementById('profitOut').textContent = formatMoney(profitAmt);
    } else {
        document.getElementById('profitSection').style.display = 'none';
    }

    if (taxRate > 0) {
        document.getElementById('taxSection').style.display = 'block';
        document.getElementById('taxLabel').textContent = `Tax (${taxRate}%)`;
        document.getElementById('taxOut').textContent = formatMoney(taxAmt);
    } else {
        document.getElementById('taxSection').style.display = 'none';
    }

    document.getElementById('totalProjectOut').textContent = formatMoney(grandTotal);

    if (clientName || clientPhone || jobAddress || jobNotes) {
        document.getElementById('clientInfo').style.display = 'block';
        let infoHtml = '';
        if (clientName) infoHtml += `<strong>${escapeHtml(clientName)}</strong><br>`;
        if (clientPhone) infoHtml += `<small class="text-muted">${escapeHtml(clientPhone)}</small><br>`;
        if (jobAddress) infoHtml += `<small class="text-muted">${escapeHtml(jobAddress)}</small><br>`;
        if (jobNotes) infoHtml += `<small class="text-muted">${escapeHtml(jobNotes)}</small>`;
        document.getElementById('clientInfo').innerHTML = infoHtml;
    } else {
        document.getElementById('clientInfo').style.display = 'none';
    }

    document.getElementById('quoteDate').textContent = new Date().toLocaleDateString();
    document.getElementById('emptyState').style.display = 'none';
}

function clearForm() {
    rooms = [];
    roomIdCounter = 0;
    renderRooms();
    if (storageAvailable()) {
        localStorage.removeItem(DRAFT_KEY);
    }
    formFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = el.defaultValue || '';
    });
    document.getElementById('subtract').value = '0';
    document.getElementById('waste').value = '10';
    document.getElementById('tileSize').value = '12x12';
    document.getElementById('boxCoverage').value = '10';
    document.getElementById('jointW').value = '0.125';
    document.getElementById('pattern').value = '1';
    document.getElementById('laborMethod').value = 'sqft';
    document.getElementById('laborRateSqft').value = '10.00';
    document.getElementById('laborRateRoom').value = '500.00';
    document.getElementById('laborFixed').value = '1500.00';
    document.getElementById('mortarType').value = 'thinset';
    document.getElementById('trowel').value = '60';
    document.getElementById('tilePriceSqft').value = '0';
    document.getElementById('mortarPrice').value = '0';
    document.getElementById('groutPrice').value = '0';
    document.getElementById('profitMargin').value = '0';
    document.getElementById('taxRate').value = '0';

    document.getElementById('roomBreakdown').innerHTML = '';
    document.getElementById('sqftOut').textContent = '0';
    document.getElementById('boxesOut').textContent = '0';
    document.getElementById('mortarOut').textContent = '0';
    document.getElementById('groutOut').textContent = '0';
    document.getElementById('laborCostOut').textContent = '$0.00';
    document.getElementById('totalTilesOut').textContent = '0 tiles';
    document.getElementById('materialCostSection').style.display = 'none';
    document.getElementById('subtotalSection').style.display = 'none';
    document.getElementById('profitSection').style.display = 'none';
    document.getElementById('taxSection').style.display = 'none';
    document.getElementById('tileNote').style.display = 'block';
    document.getElementById('clientInfo').style.display = 'none';
    document.getElementById('quoteDate').textContent = '';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('totalProjectOut').textContent = '$0.00';

    document.getElementById('mortarType').dispatchEvent(new Event('change'));
    document.getElementById('laborMethod').dispatchEvent(new Event('change'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getQuoteText() {
    const sqft = document.getElementById('sqftOut').textContent;
    const boxes = document.getElementById('boxesOut').textContent;
    const totalTiles = document.getElementById('totalTilesOut').textContent;
    const labor = document.getElementById('laborCostOut').textContent;
    const mortar = document.getElementById('mortarOut').textContent;
    const mortarType = document.getElementById('mortarType').value === 'thinset'? 'Thinset' : 'Cement';
    const grout = document.getElementById('groutOut').textContent;
    const client = document.getElementById('clientName').value || 'Client';
    const phone = document.getElementById('clientPhone').value;
    const address = document.getElementById('jobAddress').value;
    const materialCost = document.getElementById('materialCostOut').textContent;
    const subtotal = document.getElementById('subtotalOut').textContent;
    const profit = document.getElementById('profitOut').textContent;
    const tax = document.getElementById('taxOut').textContent;
    const totalProject = document.getElementById('totalProjectOut').textContent;
    const showSubtotal = document.getElementById('subtotalSection').style.display!== 'none';
    const showProfit = document.getElementById('profitSection').style.display!== 'none';
    const showTax = document.getElementById('taxSection').style.display!== 'none';
    const showMaterials = document.getElementById('materialCostSection').style.display!== 'none';

    let roomList = '';
    rooms.forEach(r => {
        const l = parseFloat(r.length) || 0;
        const w = parseFloat(r.width) || 0;
        const h = parseFloat(r.height) || 0;
        if (l > 0 && w > 0) {
            if (r.type === 'bathroom-wall') {
                roomList += `- ${r.name || getRoomTypeName(r.type)}: ${l}x${w}ft x ${h}ft H\n`;
            } else {
                roomList += `- ${r.name || getRoomTypeName(r.type)}: ${l}x${w}ft\n`;
            }
        }
    });

    let text = `Perry's Tiling - Material Estimate\n\nClient: ${client}\n`;
    if (phone) text += `Phone: ${phone}\n`;
    if (address) text += `Address: ${address}\n`;
    text += `\nROOMS:\n${roomList}\nTotal Area: ${sqft} sq ft\n\nMATERIALS NEEDED:\n- Tile: ${totalTiles} (${boxes} boxes)\n- ${mortarType}: ${mortar} bags\n- Grout: ${grout} bags\n\n`;

    if (showMaterials) text += `Materials: ${materialCost}\n`;
    text += `Labor: ${labor}\n`;
    if (showSubtotal) text += `Subtotal: ${subtotal}\n`;
    if (showProfit) text += `Profit: ${profit}\n`;
    if (showTax) text += `Tax: ${tax}\n`;
    text += `\nGRAND TOTAL: ${totalProject}\n\n`;
    if (!showMaterials) text += `*Client purchases tile. `;
    text += `Estimate valid 30 days.*`;

    return text;
}

function textQuote() {
    const sqft = document.getElementById('sqftOut').textContent;
    if (sqft === '0') {
        showToast('Calculate the project first');
        return;
    }

    const text = encodeURIComponent(getQuoteText());
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (navigator.share) {
        navigator.share({ text: getQuoteText() });
    } else {
        window.location.href = isIOS? `sms:&body=${text}` : `sms:?body=${text}`;
    }
}

function saveQuote() {
    const sqft = document.getElementById('sqftOut').textContent;
    if (sqft === '0' || rooms.length === 0) {
        showToast('Add rooms and calculate first');
        return;
    }

    if (!storageAvailable()) {
        showToast('Storage unavailable - check if private mode');
        return;
    }

    try {
        const quote = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            client: document.getElementById('clientName').value || 'No Name',
            status: 'Pending',
            rooms: JSON.parse(JSON.stringify(rooms)),
            sqft: sqft,
            labor: document.getElementById('laborCostOut').textContent,
            total: document.getElementById('totalProjectOut').textContent,
            details: {
                clientPhone: document.getElementById('clientPhone').value,
                jobAddress: document.getElementById('jobAddress').value,
                jobNotes: document.getElementById('jobNotes').value,
                subtract: document.getElementById('subtract').value,
                tileSize: document.getElementById('tileSize').value,
                waste: document.getElementById('waste').value,
                boxCoverage: document.getElementById('boxCoverage').value,
                jointW: document.getElementById('jointW').value,
                pattern: document.getElementById('pattern').value,
                laborMethod: document.getElementById('laborMethod').value,
                laborRateSqft: document.getElementById('laborRateSqft').value,
                laborRateRoom: document.getElementById('laborRateRoom').value,
                laborFixed: document.getElementById('laborFixed').value,
                boxes: document.getElementById('boxesOut').textContent,
                mortar: document.getElementById('mortarOut').textContent,
                mortarType: document.getElementById('mortarType').value,
                trowel: document.getElementById('trowel').value,
                grout: document.getElementById('groutOut').textContent,
                totalTiles: document.getElementById('totalTilesOut').textContent,
                tilePriceSqft: document.getElementById('tilePriceSqft').value,
                mortarPrice: document.getElementById('mortarPrice').value,
                groutPrice: document.getElementById('groutPrice').value,
                profitMargin: document.getElementById('profitMargin').value,
                taxRate: document.getElementById('taxRate').value,
                materialCost: document.getElementById('materialCostOut').textContent,
                subtotal: document.getElementById('subtotalOut').textContent,
                profit: document.getElementById('profitOut').textContent,
                tax: document.getElementById('taxOut').textContent
            }
        };

        let quotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        quotes.unshift(quote);
        quotes = quotes.slice(0, 20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
        localStorage.removeItem(DRAFT_KEY);
        loadSavedQuotes();
        showToast('Quote saved');
    } catch (e) {
        console.error('Save failed:', e);
        showToast('Save failed - storage full?');
    }
}

function deleteQuote(id, event) {
    event.stopPropagation();
    try {
        let quotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        quotes = quotes.filter(q => q.id!== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
        loadSavedQuotes();
        showToast('Quote deleted');
    } catch (e) {
        showToast('Delete failed');
    }
}

function cycleQuoteStatus(id, event) {
    event.stopPropagation();
    try {
        let quotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const quote = quotes.find(q => q.id === id);
        if (!quote) return;
        const statuses = ['Pending', 'Approved', 'Completed', 'Lost'];
        const currentIdx = statuses.indexOf(quote.status);
        quote.status = statuses[(currentIdx + 1) % statuses.length];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
        loadSavedQuotes();
        showToast(`Status: ${quote.status}`);
    } catch (e) {
        showToast('Status update failed');
    }
}

function loadSavedQuotes() {
    try {
        const quotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (quotes.length === 0) {
            document.getElementById('savedSection').style.display = 'none';
            return;
        }

        document.getElementById('savedSection').style.display = 'block';
        const html = quotes.map(q => {
            const roomCount = q.rooms? q.rooms.length : 1;
            const roomText = roomCount === 1? '1 room' : `${roomCount} rooms`;
            const statusColors = {
                'Pending': 'bg-warning',
                'Approved': 'bg-success',
                'Completed': 'bg-primary',
                'Lost': 'bg-secondary'
            };
            const statusColor = statusColors[q.status] || 'bg-warning';
            return `
                <div class="saved-quote p-2 mb-2 rounded bg-light" onclick="loadQuote(${q.id})">
                    <i class="bi bi-trash delete-quote" onclick="deleteQuote(${q.id}, event)"></i>
                    <div class="d-flex justify-content-between align-items-center pe-4 mb-1">
                        <strong>${escapeHtml(q.client)}</strong>
                        <span class="badge ${statusColor}" onclick="cycleQuoteStatus(${q.id}, event)" style="cursor:pointer;">${q.status}</span>
                    </div>
                    <div class="d-flex justify-content-between pe-4">
                        <small class="text-muted">${roomText} - ${q.sqft} sq ft</small>
                        <small><strong>${q.total || q.labor}</strong></small>
                    </div>
                    <small class="text-muted">${q.date}</small>
                </div>
            `;
        }).join('');
        document.getElementById('savedQuotes').innerHTML = html;
    } catch (e) {
        console.error('Load failed:', e);
        showToast('Could not load saved quotes');
    }
}

function loadQuote(id) {
    let quotes;
    try {
        quotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch(e) {
        showToast('Quote data corrupted');
        return;
    }

    const q = quotes.find(quote => quote.id === id);
    if (!q) return;

    if (q.rooms && q.rooms.length > 0) {
        rooms = q.rooms;
        roomIdCounter = Math.max(...rooms.map(r => r.id || 0));
    } else {
        rooms = [];
        roomIdCounter = 0;
    }
    renderRooms();

    document.getElementById('clientName').value = q.client === 'No Name'? '' : q.client;
    document.getElementById('clientPhone').value = q.details.clientPhone || '';
    document.getElementById('jobAddress').value = q.details.jobAddress || '';
    document.getElementById('jobNotes').value = q.details.jobNotes || '';
    document.getElementById('subtract').value = q.details.subtract || '0';
    document.getElementById('tileSize').value = q.details.tileSize;
    document.getElementById('waste').value = q.details.waste;
    document.getElementById('boxCoverage').value = q.details.boxCoverage || '10';
    document.getElementById('jointW').value = q.details.jointW || '0.125';
    document.getElementById('pattern').value = q.details.pattern || '1';
    document.getElementById('laborMethod').value = q.details.laborMethod || 'sqft';
    document.getElementById('laborRateSqft').value = q.details.laborRateSqft || '10.00';
    document.getElementById('laborRateRoom').value = q.details.laborRateRoom || '500.00';
    document.getElementById('laborFixed').value = q.details.laborFixed || '1500.00';
    if (q.details.mortarType) {
        document.getElementById('mortarType').value = q.details.mortarType;
        document.getElementById('mortarType').dispatchEvent(new Event('change'));
    }
    if (q.details.trowel) {
        document.getElementById('trowel').value = q.details.trowel;
    }
    document.getElementById('tilePriceSqft').value = q.details.tilePriceSqft || '0';
    document.getElementById('mortarPrice').value = q.details.mortarPrice || '0';
    document.getElementById('groutPrice').value = q.details.groutPrice || '0';
    document.getElementById('profitMargin').value = q.details.profitMargin || '0';
    document.getElementById('taxRate').value = q.details.taxRate || '0';
    document.getElementById('laborMethod').dispatchEvent(new Event('change'));

    if (rooms.length === 0) {
        document.getElementById('sqftOut').textContent = q.sqft;
        document.getElementById('boxesOut').textContent = q.details.boxes || '0';
        document.getElementById('mortarOut').textContent = q.details.mortar || '0';
        document.getElementById('groutOut').textContent = q.details.grout || '0';
        document.getElementById('laborCostOut').textContent = q.labor || '$0.00';
        document.getElementById('totalTilesOut').textContent = q.details.totalTiles || '0 tiles';
        document.getElementById('totalProjectOut').textContent = q.total || q.labor || '$0.00';
        if (q.details.materialCost && q.details.materialCost!== '$0.00') {
            document.getElementById('materialCostSection').style.display = 'block';
            document.getElementById('materialCostOut').textContent = q.details.materialCost;
            document.getElementById('tileNote').style.display = 'none';
        }
        if (q.details.subtotal) {
            document.getElementById('subtotalSection').style.display = 'block';
            document.getElementById('subtotalOut').textContent = q.details.subtotal;
        }
        if (q.details.profit && parseFloat(q.details.profitMargin) > 0) {
            document.getElementById('profitSection').style.display = 'block';
            document.getElementById('profitLabel').textContent = `Profit (${q.details.profitMargin}%)`;
            document.getElementById('profitOut').textContent = q.details.profit;
        }
        if (q.details.tax && parseFloat(q.details.taxRate) > 0) {
            document.getElementById('taxSection').style.display = 'block';
            document.getElementById('taxLabel').textContent = `Tax (${q.details.taxRate}%)`;
            document.getElementById('taxOut').textContent = q.details.tax;
        }
        document.getElementById('emptyState').style.display = 'none';
        showToast('Old quote loaded');
    } else {
        calculate();
        showToast('Quote loaded');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// INIT - Fixed: render rooms first so first-time users see the dropdown
renderRooms();

if (storageAvailable()) {
    const draftRaw = localStorage.getItem(DRAFT_KEY);
    if (draftRaw) {
        try {
            const draft = JSON.parse(draftRaw);
            if (draft.rooms && draft.rooms.length > 0) {
                rooms = draft.rooms;
                roomIdCounter = Math.max(...rooms.map(r => r.id || 0));
                renderRooms();
            }
            if (draft.form) {
                formFields.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && draft.form[id]!== undefined) {
                        el.value = draft.form[id];
                    }
                });
                document.getElementById('mortarType').dispatchEvent(new Event('change'));
                document.getElementById('laborMethod').dispatchEvent(new Event('change'));
            }
            if (draft.rooms && draft.rooms.length > 0) {
                showToast('Draft restored');
            }
        } catch (e) {
            console.error('Draft load failed:', e);
        }
    }
}

loadSavedQuotes();