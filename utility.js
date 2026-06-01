// utility.js — UI helpers only. No imports from other app files.

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

export function formatMoney(num) {
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getRoomTypeName(type) {
    const names = {
        'living': 'Living Room', 'dining': 'Dining Room', 'foyer': 'Foyer/Entry',
        'porch': 'Porch/Patio', 'bedroom': 'Bedroom', 'bathroom': 'Bathroom - Floor',
        'bathroom-wall': 'Bathroom - Walls', 'hallway': 'Hallway', 'stairs': 'Stairs',
        'kitchen': 'Kitchen Floor', 'backsplash': 'Backsplash', 'other': 'Other Area'
    };
    return names[type] || 'Room';
}

export function renderRooms(container, rooms) {
    if (rooms.length === 0) {
        container.innerHTML = `
            <div class="empty-rooms-cta">
                <p class="text-muted mb-3">No rooms added yet</p>
                <button class="btn btn-brand dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-plus-circle"></i> Add First Room
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" data-room-type="living">Living Room</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="dining">Dining Room</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="foyer">Foyer/Entry</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="porch">Porch/Patio</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" data-room-type="bedroom">Bedroom</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="bathroom">Bathroom - Floor</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="bathroom-wall">Bathroom - Walls</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="hallway">Hallway</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="stairs">Stairs</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="kitchen">Kitchen Floor</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="backsplash">Backsplash</a></li>
                    <li><a class="dropdown-item" href="#" data-room-type="other">Other Area</a></li>
                </ul>
            </div>
        `;
        return;
    }

    container.innerHTML = rooms.map(room => {
        const isWall = room.type === 'bathroom-wall';
        return `
        <div class="room-item" data-room-id="${room.id}">
            <i class="bi bi-x-circle room-delete"></i>
            <div class="fw-bold mb-2 pe-4">${getRoomTypeName(room.type)}</div>
            <div class="row g-2">
                <div class="col-12">
                    <input type="text" class="form-control form-control-sm room-name" placeholder="Room name/notes"
                        value="${escapeHtml(room.name)}" data-field="name">
                </div>
                <div class="${isWall? 'col-4' : 'col-6'}">
                    <input type="number" class="form-control form-control-sm room-dimension" placeholder="Length (ft)"
                        value="${escapeHtml(room.length)}" inputmode="decimal" step="0.25" data-field="length">
                </div>
                <div class="${isWall? 'col-4' : 'col-6'}">
                    <input type="number" class="form-control form-control-sm room-dimension" placeholder="Width (ft)"
                        value="${escapeHtml(room.width)}" inputmode="decimal" step="0.25" data-field="width">
                </div>
                ${isWall? `
                <div class="col-4">
                    <input type="number" class="form-control form-control-sm room-dimension" placeholder="Height (ft)"
                        value="${escapeHtml(room.height)}" inputmode="decimal" step="0.25" data-field="height">
                </div>
                ` : ''}
            </div>
        </div>
    `}).join('');
}

export function showToast(message, duration = 2500, action = null) {
    const toast = document.getElementById('toast');
    document.getElementById('toastText').textContent = message;
    toast.classList.add('show');
    return setTimeout(() => {
        toast.classList.remove('show');
        if (action) action();
    }, duration);
}