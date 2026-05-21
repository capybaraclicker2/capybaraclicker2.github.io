// Chill Guy Clicker - Main Game Engine

// Game State Object
let state = {
    vibes: 0,
    clickPower: 1,
    cps: 0,
    upgrades: {
        coffee: { count: 0, baseCost: 15, costMultiplier: 1.15, cpsContribution: 0.2 },
        socks: { count: 0, baseCost: 100, costMultiplier: 1.15, cpsContribution: 1 },
        pants: { count: 0, baseCost: 500, costMultiplier: 1.15, cpsContribution: 8 },
        glasses: { count: 0, baseCost: 3000, costMultiplier: 1.15, cpsContribution: 40 },
        beats: { count: 0, baseCost: 20000, costMultiplier: 1.15, cpsContribution: 250 },
        sneakers: { count: 0, baseCost: 125000, costMultiplier: 1.15, cpsContribution: 1200 },
        clicker: { count: 0, baseCost: 50, costMultiplier: 1.3, clickContribution: 1 },
        shrug: { count: 0, baseCost: 250, costMultiplier: 1.4, clickContribution: 5 }
    }
};

// Canvas Setup for cozy sparkling particles
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class SparkParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2;
        this.radius = Math.random() * 3 + 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.color = Math.random() > 0.3 ? "#a1887f" : "#ffd54f"; // Soft beige or glowing gold
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // Gravity
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.vy = -Math.random() * 1.5 - 1.5;
        this.vx = (Math.random() - 0.5) * 2;
        this.alpha = 1;
        this.text = text;
        this.fontSize = Math.floor(Math.random() * 8) + 32; // 32px - 40px (make +1 little big)
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = `bold ${this.fontSize}px 'Outfit', sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffd54f";
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

function spawnFlyParticles(x, y, imageUrl) {
    const numParticles = 6;
    for (let i = 0; i < numParticles; i++) {
        const fly = document.createElement('div');
        fly.className = 'fly-particle';
        fly.style.backgroundImage = `url('${imageUrl}')`;
        
        // Position relative to window
        fly.style.left = `${x}px`;
        fly.style.top = `${y}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 30;
        const rot = (Math.random() - 0.5) * 720;
        
        fly.style.setProperty('--tx', `${tx}px`);
        fly.style.setProperty('--ty', `${ty}px`);
        fly.style.setProperty('--rot', `${rot}deg`);
        
        document.body.appendChild(fly);
        
        setTimeout(() => {
            fly.remove();
        }, 700);
    }
}

function spawnClickParticles(x, y) {
    // Spawn floaty sparks
    for (let i = 0; i < 12; i++) {
        particles.push(new SparkParticle(x, y));
    }
    // Spawn floating text
    particles.push(new FloatingText(x, y - 20, `+${state.clickPower}`));
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
}
requestAnimationFrame(animateParticles);

// Dynamic upgrade cost formulas
function getUpgradeCost(key) {
    const upg = state.upgrades[key];
    return Math.floor(upg.baseCost * Math.pow(upg.costMultiplier, upg.count));
}

// Global recalculations
function recalculateStats() {
    let rawCPS = 0;
    let rawClick = 1;

    Object.keys(state.upgrades).forEach(key => {
        const item = state.upgrades[key];
        if (item.cpsContribution) {
            rawCPS += item.count * item.cpsContribution;
        }
        if (item.clickContribution) {
            rawClick += item.count * item.clickContribution;
        }
    });

    state.cps = parseFloat(rawCPS.toFixed(1));
    state.clickPower = rawClick;
}

// Update the DOM Elements
function updateUI() {
    // Stats
    document.getElementById("vibe-count").textContent = Math.floor(state.vibes).toLocaleString();
    document.getElementById("cps-display").textContent = `${state.cps} per second`;
    document.getElementById("click-power-display").textContent = `${state.clickPower} per click`;

    // Shop Upgrade Panels
    Object.keys(state.upgrades).forEach(key => {
        const cost = getUpgradeCost(key);
        const count = state.upgrades[key].count;
        
        const costEl = document.getElementById(`cost-${key}`);
        const qtyEl = document.getElementById(`qty-${key}`);
        const btnEl = document.getElementById(`upg-${key}`);

        if (costEl) costEl.textContent = cost.toLocaleString();
        if (qtyEl) qtyEl.textContent = count;

        if (btnEl) {
            if (state.vibes >= cost) {
                btnEl.classList.remove("locked");
            } else {
                btnEl.classList.add("locked");
            }
        }
    });
}

// Buy upgrades logic
function buyUpgrade(key) {
    const cost = getUpgradeCost(key);
    if (state.vibes >= cost) {
        state.vibes -= cost;
        state.upgrades[key].count++;
        recalculateStats();
        updateUI();
        saveGame();
    }
}

// Save & Load State securely
function saveGame() {
    localStorage.setItem("chillguy_clicker_save", JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem("chillguy_clicker_save");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            
            // Defensive loading typecasting
            if (parsed.vibes !== undefined) state.vibes = parseFloat(parsed.vibes);
            
            if (parsed.upgrades) {
                Object.keys(state.upgrades).forEach(key => {
                    if (parsed.upgrades[key]) {
                        state.upgrades[key].count = parseInt(parsed.upgrades[key].count) || 0;
                    }
                });
            }
        } catch(e) {
            console.error("Error loading Chill Guy clicker save:", e);
        }
    }
    recalculateStats();
    updateUI();
}

function resetGame() {
    if (confirm("Are you sure you want to reset all your vibes and comfy upgrades?")) {
        state.vibes = 0;
        state.clickPower = 1;
        state.cps = 0;
        Object.keys(state.upgrades).forEach(key => {
            state.upgrades[key].count = 0;
        });
        localStorage.removeItem("chillguy_clicker_save");
        recalculateStats();
        updateUI();
    }
}

// Interaction Handlers
const clickArea = document.getElementById("clickArea");

clickArea.addEventListener("mousedown", (e) => {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Apply vibes
    state.vibes += state.clickPower;
    spawnClickParticles(x, y);
    spawnFlyParticles(e.clientX, e.clientY, 'dog-fly.png');
    updateUI();

    // Visual juice feedback
    clickArea.classList.add("clicked");
    setTimeout(() => {
        clickArea.classList.remove("clicked");
    }, 80);
});

// Touch support for mobiles
clickArea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    state.vibes += state.clickPower;
    spawnClickParticles(x, y);
    spawnFlyParticles(touch.clientX, touch.clientY, 'dog-fly.png');
    updateUI();

    clickArea.classList.add("clicked");
    setTimeout(() => {
        clickArea.classList.remove("clicked");
    }, 80);
}, { passive: false });

// Register upgrade click listeners
Object.keys(state.upgrades).forEach(key => {
    const el = document.getElementById(`upg-${key}`);
    if (el) {
        el.addEventListener("click", () => {
            buyUpgrade(key);
        });
    }
});

// Reset button listener
document.getElementById("btn-reset").addEventListener("click", resetGame);

// Smooth Auto-Clicker loop (runs 10 times a second for fluid increments)
setInterval(() => {
    if (state.cps > 0) {
        state.vibes += state.cps / 10;
        updateUI();
    }
}, 100);

// SECURE AUTO-SAVE every 10 seconds
let autoSaveEnabled = true;
setInterval(() => { if (autoSaveEnabled) saveGame(); }, 10000);

// Initialize
loadGame();
updateUI();

// =============================================
// NEW CONTROL BUTTONS
// =============================================

// --- Click power badge sync ---
function syncBadge() {
    const el = document.getElementById('click-power-badge-val');
    if (el) el.textContent = `+${state.clickPower}`;
}
const _origUpdateUI = updateUI;
// Patch updateUI to also sync badge
const __baseUpdate = updateUI;

// ⚙️ Settings modal
const settingsOverlay = document.getElementById('settingsOverlay');
document.getElementById('btn-settings').addEventListener('click', () => {
    settingsOverlay.classList.add('open');
});
document.getElementById('closeSettings').addEventListener('click', () => {
    settingsOverlay.classList.remove('open');
});
settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) settingsOverlay.classList.remove('open');
});

// Toggle helpers
function setupToggle(id, onToggle) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
        el.classList.toggle('on');
        onToggle(el.classList.contains('on'));
    });
}

setupToggle('toggle-particles', (on) => {
    // When off, clear particles on each click
    window._particlesEnabled = on;
});
window._particlesEnabled = true;

setupToggle('toggle-autosave', (on) => {
    autoSaveEnabled = on;
});

setupToggle('toggle-cps', (on) => {
    const cpsWrapper = document.querySelector('.cps-display-wrapper');
    if (cpsWrapper) cpsWrapper.style.display = on ? '' : 'none';
});

setupToggle('toggle-sound', () => { /* placeholder */ });

// Patch spawnClickParticles to respect setting
const _origSpawn = spawnClickParticles;
window.spawnClickParticles = function(x, y) {
    if (window._particlesEnabled !== false) _origSpawn(x, y);
};

// ☁️ Save buttons (toolbar + shop header)
function showSaveToast() {
    saveGame();
    const toast = document.getElementById('saveToast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
}
document.getElementById('btn-save').addEventListener('click', showSaveToast);
const shopSaveBtn = document.getElementById('btn-save-shop');
if (shopSaveBtn) shopSaveBtn.addEventListener('click', showSaveToast);

// ⚡ 2x Speed toggle
let speedActive = false;
let fastInterval = null;
const speedBtn = document.getElementById('btn-speed');
speedBtn.addEventListener('click', () => {
    speedActive = !speedActive;
    speedBtn.classList.toggle('active', speedActive);
    if (speedActive) {
        fastInterval = setInterval(() => {
            if (state.cps > 0) {
                state.vibes += state.cps / 10; // extra tick (total 2x)
                updateUI();
            }
        }, 100);
    } else {
        clearInterval(fastInterval);
        fastInterval = null;
    }
});

// ⭐ Free Vibes (30s cooldown)
let freeOnCooldown = false;
const freeBtn = document.getElementById('btn-free');
freeBtn.addEventListener('click', () => {
    if (freeOnCooldown) return;
    const bonus = Math.max(50, Math.floor(state.vibes * 0.05 + 50));
    state.vibes += bonus;
    updateUI();
    syncBadge();

    // Toast
    const toast = document.getElementById('saveToast');
    if (toast) {
        toast.textContent = `⭐ +${bonus.toLocaleString()} Free Vibes!`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.textContent = '☁️ Game Saved!';
        }, 2000);
    }

    // Cooldown 30s
    freeOnCooldown = true;
    freeBtn.classList.add('cooldown');
    let remaining = 30;
    freeBtn.title = `Free Vibes (${remaining}s)`;
    const cd = setInterval(() => {
        remaining--;
        freeBtn.title = `Free Vibes (${remaining}s)`;
        if (remaining <= 0) {
            clearInterval(cd);
            freeOnCooldown = false;
            freeBtn.classList.remove('cooldown');
            freeBtn.title = 'Free Vibes (30s cooldown)';
        }
    }, 1000);
});

// Sync badge on every updateUI call
const _uiInterval = setInterval(() => syncBadge(), 500);
syncBadge();

