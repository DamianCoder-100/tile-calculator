// calculator.js — Pure math functions only. No DOM access.

export function parseTileSize(str) {
    str = str.replace(/\s+/g,'');
    const match = str.match(/^(\d+(\.\d+)?)x(\d+(\.\d+)?)$/i);
    if (!match) return null;

    const l = parseFloat(match[1]);
    const w = parseFloat(match[3]);

    if (l <= 0 || w <= 0) return null;

    return { l, w };
}

export function calculateRooms(rooms, config) {
    let totalBaseSqft = 0;
    let roomDetails = [];

    rooms.forEach(room => {
        const l = Math.max(0, parseFloat(room.length) || 0);
        const w = Math.max(0, parseFloat(room.width) || 0);
        let sqft = 0;

        if (room.type === 'bathroom-wall') {
            const h = Math.max(0, parseFloat(room.height) || 8);
            const perimeter = (l + w) * 2;
            sqft = perimeter * h;
        } else {
            sqft = l * w;
        }

        if (sqft > 0) {
            totalBaseSqft += sqft;
            roomDetails.push({
                name: room.name || room.type,
                sqft: sqft
            });
        }
    });

    const subtract = Math.max(0, config.subtract || 0);
    const baseSqft = Math.max(0, totalBaseSqft - subtract);
    const waste = Math.max(0, config.waste || 0);
    const patternMultiplier = Math.max(1, config.patternMultiplier || 1);
    const totalSqft = baseSqft * (1 + waste/100) * patternMultiplier;

    return { totalBaseSqft, baseSqft, totalSqft, roomDetails };
}

export function calculateMaterials(totalSqft, config) {
    if (totalSqft <= 0) {
        return { mortarBags: 0, groutBags: 0, tileBoxes: 0, totalTiles: 0 };
    }

    const trowelCoverage = Math.max(1, config.trowelCoverage || 60);
    let mortarBags = 0;
    if (config.mortarType === 'thinset') {
        mortarBags = Math.ceil(totalSqft / trowelCoverage);
    } else {
        mortarBags = Math.ceil(totalSqft / 100);
    }

    const jointW = Math.max(0.01, config.jointW || 0.125);
    const tileArea = config.tile.l * config.tile.w;
    const groutCoverage = tileArea > 0
    ? 200 / (((config.tile.l + config.tile.w) / tileArea) * jointW * 12)
        : 200;
    const groutBags = Math.ceil(totalSqft / Math.max(1, groutCoverage));

    const boxCoverage = Math.max(0.01, config.boxCoverage || 10);
    const tileBoxes = Math.ceil(totalSqft / boxCoverage);
    const tileSqFt = (config.tile.l * config.tile.w) / 144;
    const totalTiles = tileSqFt > 0? Math.ceil(totalSqft / tileSqFt) : 0;

    return { mortarBags, groutBags, tileBoxes, totalTiles };
}

export function calculateCosts(baseSqft, totalSqft, materials, config, billableRooms) {
    baseSqft = Math.max(0, baseSqft);
    totalSqft = Math.max(0, totalSqft);
    billableRooms = Math.max(0, billableRooms);

    let laborCost = 0;
    if (config.laborMethod === 'sqft') {
        laborCost = baseSqft * Math.max(0, config.laborRateSqft || 0);
    } else if (config.laborMethod === 'room') {
        laborCost = billableRooms * Math.max(0, config.laborRateRoom || 0);
    } else {
        laborCost = Math.max(0, config.laborFixed || 0);
    }

    const tileCost = totalSqft * Math.max(0, config.tilePriceSqft || 0);
    const mortarCost = materials.mortarBags * Math.max(0, config.mortarPrice || 0);
    const groutCost = materials.groutBags * Math.max(0, config.groutPrice || 0);
    const materialCost = tileCost + mortarCost + groutCost;

    const subtotal = materialCost + laborCost;
    const profitMargin = Math.max(0, Math.min(100, config.profitMargin || 0));
    const profitAmt = subtotal * (profitMargin / 100);
    const taxableAmt = subtotal + profitAmt;
    const taxRate = Math.max(0, Math.min(100, config.taxRate || 0));
    const taxAmt = taxableAmt * (taxRate / 100);
    const grandTotal = taxableAmt + taxAmt;

    return { laborCost, materialCost, subtotal, profitAmt, taxAmt, grandTotal };
}