// Generate a simple bird sprite (yellow circle with beak and eye)
function createBirdSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 72; // 3 frames * 24px
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 3; i++) {
        // Body
        ctx.fillStyle = '#f8e71c';
        ctx.beginPath();
        ctx.arc(12 + i * 24, 12, 10, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(16 + i * 24, 8, 2, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(20 + i * 24, 12);
        ctx.lineTo(24 + i * 24, 12);
        ctx.lineTo(20 + i * 24, 16);
        ctx.fill();
    }
    return canvas.toDataURL();
}

// Simple blue background
function createPyramidBackground() {
    const width = 662;
    const height = 666;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Sky
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, width, height);

    // --- Draw more realistic clouds ---
    function drawCloud(cx, cy, scale = 1, alpha = 1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#f7f7d7";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 40 * scale, 24 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 30 * scale, cy + 8 * scale, 28 * scale, 18 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - 30 * scale, cy + 8 * scale, 28 * scale, 18 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx, cy + 16 * scale, 32 * scale, 16 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Place clouds at various positions and scales
    drawCloud(120, 110, 1.1, 0.9);
    drawCloud(250, 100, 0.9, 0.8);
    drawCloud(400, 120, 1.2, 0.85);
    drawCloud(550, 105, 1.0, 0.8);
    drawCloud(60, 150, 0.7, 0.7);
    drawCloud(320, 160, 0.8, 0.6);

    // --- Draw blocky pyramids ---
    const baseY = height - 112; // ground height offset
    const pyramidBase = 160;    // width of pyramid base (bigger)
    const pyramidHeight = 140;  // height of pyramid (bigger)
    const pyramidColors = ['#e6c97a', '#d2b16d', '#c2a05a'];

    for (let i = -pyramidBase/2; i < width; i += pyramidBase - 20) {
        ctx.fillStyle = "#f7e9a0";
        ctx.beginPath();
        ctx.moveTo(i, baseY); // left base
        ctx.lineTo(i + pyramidBase, baseY); // right base
        ctx.lineTo(i + pyramidBase / 2, baseY - pyramidHeight); // tip
        ctx.closePath();
        ctx.fill();
    }

    return canvas.toDataURL();
}

// Simple green pipe (top)
function createPipeTop() {
    const canvas = document.createElement('canvas');
    canvas.width = 52;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, 0, 52, 320);
    ctx.fillStyle = '#4a8a1d';
    ctx.fillRect(0, 0, 52, 20);
    return canvas.toDataURL();
}

// Simple green pipe (bottom)
function createPipeBottom() {
    const canvas = document.createElement('canvas');
    canvas.width = 52;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, 0, 52, 320);
    ctx.fillStyle = '#4a8a1d';
    ctx.fillRect(0, 300, 52, 20);
    return canvas.toDataURL();
}

// Simple brown ground
function createGround() {
    const canvas = document.createElement('canvas');
    canvas.width = 48;   // or 24, as you prefer
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f7e9a0'; // sand color
    ctx.fillRect(0, canvas.height - 112, canvas.width, 112);
    return canvas.toDataURL();
}

// Export assets as global variable
window.assets = {
    bird: createBirdSprite(),
    background: createPyramidBackground(),
    pipeTop: createPipeTop(),
    pipeBottom: createPipeBottom(),
    ground: createGround()
};

// Simple sound effect functions (no sound for now, but you can add Web Audio API here)
window.sounds = {
    flap: () => {},
    score: () => {},
    hit: () => {}
};

window.assets.ground = createGround();
console.log(window.assets.ground); 