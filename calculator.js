// calculator.js — Pure math functions only. No DOM access.

export function parseTileSize(str) {
    if (!str) return null;
    str = str.toString().trim().replace(/\s+/g,'');

    // Match only NxM where N and M are positive numbers. Reject 12x12x12
    const match = str.match(/^(\d+(\.\d+)?)x(\d+(\.\d+)?)$/i);
    if (!match) return null;

    const l = parseFloat(match[1]);
    const w = parseFloat(match[3]);

    // Reject 0, negative, or unreasonably large tiles > 120"
    if (l <= 0 || w <= 0 || l > 120 || w > 120) return null;

    return { l, w };
}

export function calculateMaterials(totalSqft, config, tileForCalc, boxCoverage) {
    if (totalSqft <= 0) {
        return { mortarBags: 0, groutBags: 0, tileBoxes: 0, totalTiles: 0 };
    }

    // Hard fallbacks if rendering.js passes garbage
    tileForCalc = tileForCalc && tileForCalc.l > 0 && tileForCalc.w > 0
       ? tileForCalc
        : { l: 12, w: 12 };

    boxCoverage = boxCoverage > 0? boxCoverage : 10;

    const trowelCoverage = Math.max(1, parseFloat(config.trowelCoverage) || 60);
    let mortarBags = 0;
    if (config.mortarType === 'thinset') {
        mortarBags = Math.ceil(totalSqft / trowelCoverage);
    } else {
        mortarBags = Math.ceil(totalSqft / 100);
    }

    const jointW = Math.max(0.01, parseFloat(config.groutJoint) || 0.125);
    const tileArea = tileForCalc.l * tileForCalc.w;

    // Grout formula: 200 / ((L+W)/(L*W) * joint * 12)
    // Prevent divide by zero if tileArea is somehow 0
    const groutCoverage = tileArea > 0
      ? 200 / (((tileForCalc.l + tileForCalc.w) / tileArea) * jointW * 12)
        : 200;
    const groutBags = Math.ceil(totalSqft / Math.max(1, groutCoverage));

    const coverage = Math.max(0.01, boxCoverage);
    const tileBoxes = Math.ceil(totalSqft / coverage);
    const tileSqFt = (tileForCalc.l * tileForCalc.w) / 144;
    const totalTiles = tileSqFt > 0? Math.ceil(totalSqft / tileSqFt) : 0;

    return { mortarBags, groutBags, tileBoxes, totalTiles };
}

export function calculateCosts(baseSqft, totalSqft, materials, config, billableRooms) {
    // Sanitize all inputs - never trust parseFloat from outside
    baseSqft = Math.max(0, parseFloat(baseSqft) || 0);
    totalSqft = Math.max(0, parseFloat(totalSqft) || 0);
    billableRooms = Math.max(0, parseInt(billableRooms) || 0);

    const laborRateSqft = Math.max(0, parseFloat(config.laborRateSqft) || 0);
    const laborRateRoom = Math.max(0, parseFloat(config.laborRateRoom) || 0);
    const laborFixed = Math.max(0, parseFloat(config.laborFixed) || 0);

    let laborCost = 0;
    if (config.laborMethod === 'sqft') {
        laborCost = baseSqft * laborRateSqft;
    } else if (config.laborMethod === 'room') {
        laborCost = billableRooms * laborRateRoom;
    } else {
        laborCost = laborFixed;
    }

    const mortarPrice = Math.max(0, parseFloat(config.mortarPrice) || 0);
    const groutPrice = Math.max(0, parseFloat(config.groutPrice) || 0);
    const mortarCost = materials.mortarBags * mortarPrice;
    const groutCost = materials.groutBags * groutPrice;
    const materialCost = mortarCost + groutCost;

    const subtotal = materialCost + laborCost;
    const profitMargin = Math.max(0, Math.min(100, parseFloat(config.profitMargin) || 0));
    const profitAmt = subtotal * (profitMargin / 100);
    const taxableAmt = subtotal + profitAmt;
    const taxRate = Math.max(0, Math.min(100, parseFloat(config.taxRate) || 0));
    const taxAmt = taxableAmt * (taxRate / 100);
    const grandTotal = taxableAmt + taxAmt;

    return { laborCost, materialCost, subtotal, profitAmt, taxAmt, grandTotal };
}