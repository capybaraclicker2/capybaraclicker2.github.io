// Capybara Clicker Game Engine

document.addEventListener('DOMContentLoaded', () => {
    // 1. Game State
    let state = {
        capybaras: 0,
        clickPower: 1,
        totalCPS: 0,
        upgrades: {
            clicker: { count: 0, cost: 15, base: 15, cps: 0, power: 1 },
            auto: { count: 0, cost: 100, base: 100, cps: 1, power: 0 },
            farm: { count: 0, cost: 1100, base: 1100, cps: 10, power: 0 },
            temple: { count: 0, cost: 12000, base: 12000, cps: 100, power: 0 }
        }
    };

    // 2. DOM Elements
    const countDisplay = document.getElementById('capybara-count');
    const cpsDisplay = document.getElementById('cps-display');
    const clickPowerDisplay = document.getElementById('click-power-display');
    const clickArea = document.getElementById('click-area');
    const capybaraImg = document.querySelector('.capybara-image-file');
    const svgFallback = document.getElementById('svg-fallback');
    
    // Upgrades DOM
    const btnClicker = document.getElementById('upg-clicker');
    const btnAuto = document.getElementById('upg-auto');
    const btnFarm = document.getElementById('upg-farm');
    const btnTemple = document.getElementById('upg-temple');
    
    const countClicker = document.getElementById('count-clicker');
    const countAuto = document.getElementById('count-auto');
    const countFarm = document.getElementById('count-farm');
    const countTemple = document.getElementById('count-temple');

    // Controls DOM
    const btnSave = document.getElementById('btn-save');
    const btnReset = document.getElementById('btn-reset');

    // 3. Dynamic Skins Integration
    let loadedSkins = [];

    function checkSkins() {
        const skinsToTry = ['capybara1.png', 'capybara2.png', 'capybara3.png', 'capybara4.png'];
        let checksPending = skinsToTry.length;

        skinsToTry.forEach((skinUrl) => {
            const tempImg = new Image();
            tempImg.onload = () => {
                loadedSkins.push(skinUrl);
                checksPending--;
                if (checksPending === 0) finalizeSkins();
            };
            tempImg.onerror = () => {
                checksPending--;
                if (checksPending === 0) finalizeSkins();
            };
            tempImg.src = skinUrl;
        });
    }

    function finalizeSkins() {
        if (loadedSkins.length > 0) {
            // Sort to keep order consistent
            loadedSkins.sort();
            svgFallback.style.display = 'none';
            capybaraImg.style.display = 'block';
            changeSkin();
        } else {
            // Try single capybara.png fallback
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
                loadedSkins.push('capybara.png');
                svgFallback.style.display = 'none';
                capybaraImg.style.display = 'block';
                capybaraImg.src = 'capybara.png';
            };
            fallbackImg.onerror = () => {
                // Keep SVG fallback
                svgFallback.style.display = 'block';
                capybaraImg.style.display = 'none';
            };
            fallbackImg.src = 'capybara.png';
        }
    }

    function changeSkin() {
        if (loadedSkins.length > 0) {
            // Pick a random skin from loaded ones
            const randomSkin = loadedSkins[Math.floor(Math.random() * loadedSkins.length)];
            capybaraImg.src = randomSkin;
        }
    }

    // 4. Format Numbers (e.g. 1,234,567)
    function formatNumber(num) {
        return Math.floor(num).toLocaleString('en-US');
    }

    // 5. Update Game UI
    function updateUI() {
        countDisplay.innerText = formatNumber(state.capybaras);
        cpsDisplay.innerText = `${formatNumber(state.totalCPS)} per second`;
        if (clickPowerDisplay) {
            clickPowerDisplay.innerText = `${formatNumber(state.clickPower)} per click`;
        }

        // Update upgrade counts
        countClicker.innerText = state.upgrades.clicker.count;
        countAuto.innerText = state.upgrades.auto.count;
        countFarm.innerText = state.upgrades.farm.count;
        countTemple.innerText = state.upgrades.temple.count;

        // Update upgrade costs displays
        btnClicker.querySelector('.upgrade-cost').innerText = formatNumber(state.upgrades.clicker.cost);
        btnAuto.querySelector('.upgrade-cost').innerText = formatNumber(state.upgrades.auto.cost);
        btnFarm.querySelector('.upgrade-cost').innerText = formatNumber(state.upgrades.farm.cost);
        btnTemple.querySelector('.upgrade-cost').innerText = formatNumber(state.upgrades.temple.cost);

        // Manage buttons affordability (visual feedback)
        checkAffordability(btnClicker, state.upgrades.clicker.cost);
        checkAffordability(btnAuto, state.upgrades.auto.cost);
        checkAffordability(btnFarm, state.upgrades.farm.cost);
        checkAffordability(btnTemple, state.upgrades.temple.cost);
    }

    function checkAffordability(element, cost) {
        if (state.capybaras >= cost) {
            element.classList.remove('locked');
            element.classList.add('affordable');
        } else {
            element.classList.remove('affordable');
            element.classList.add('locked');
        }
    }

    // 6. Upgrade logic
    function buyUpgrade(key) {
        const upgrade = state.upgrades[key];
        if (state.capybaras >= upgrade.cost) {
            state.capybaras -= upgrade.cost;
            upgrade.count += 1;
            
            // Calculate new cost (increases exponentially by 15%)
            upgrade.cost = Math.floor(upgrade.base * Math.pow(1.15, upgrade.count));
            
            recalculateCPSAndPower();
            updateUI();
            
            // Subtle click effect on buy
            triggerSaveAnimation();
        }
    }

    function recalculateCPSAndPower() {
        // Calculate new CPS
        let cps = 0;
        cps += state.upgrades.auto.count * state.upgrades.auto.cps;
        cps += state.upgrades.farm.count * state.upgrades.farm.cps;
        cps += state.upgrades.temple.count * state.upgrades.temple.cps;
        state.totalCPS = cps;

        // Calculate click power
        state.clickPower = 1 + (state.upgrades.clicker.count * state.upgrades.clicker.power);
    }

    // Attach shop events
    btnClicker.addEventListener('click', () => buyUpgrade('clicker'));
    btnAuto.addEventListener('click', () => buyUpgrade('auto'));
    btnFarm.addEventListener('click', () => buyUpgrade('farm'));
    btnTemple.addEventListener('click', () => buyUpgrade('temple'));

    // 7. Handling Main Click & Juicy Feedback
    const mainPanel = document.querySelector('.clicker-main-panel');

    function triggerJuice(x, y) {
        // Trigger Screen Shake
        if (mainPanel) {
            mainPanel.classList.remove('shake');
            void mainPanel.offsetWidth; // Trigger reflow to restart CSS animation
            mainPanel.classList.add('shake');
        }
        
        // Spawn Sparkle Explosion
        const colors = ['#ffd700', '#ffa726', '#ffffff', '#ff8a80', '#81c784'];
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-particle';
            sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 25 + Math.random() * 50; 
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            sparkle.style.setProperty('--tx', `${tx}px`);
            sparkle.style.setProperty('--ty', `${ty}px`);
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 600);
        }
    }

    function spawnFlyParticles(x, y, imageUrl) {
        const numParticles = 6;
        for (let i = 0; i < numParticles; i++) {
            const fly = document.createElement('div');
            fly.className = 'fly-particle';
            fly.style.backgroundImage = `url('${imageUrl}')`;
            
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

    clickArea.addEventListener('mousedown', (e) => {
        state.capybaras += state.clickPower;
        changeSkin();
        updateUI();
        createParticle(e.clientX, e.clientY, `+${state.clickPower}`);
        triggerJuice(e.clientX, e.clientY);
        spawnFlyParticles(e.clientX, e.clientY, 'capaybara-fly.png');
    });

    // Handle touch screens correctly
    clickArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        state.capybaras += state.clickPower;
        changeSkin();
        updateUI();
        createParticle(touch.clientX, touch.clientY, `+${state.clickPower}`);
        triggerJuice(touch.clientX, touch.clientY);
        spawnFlyParticles(touch.clientX, touch.clientY, 'capaybara-fly.png');
    }, { passive: false });

    // Floating text particle spawner
    function createParticle(x, y, text) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.innerText = text;
        
        // Position correctly in screen coords
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        document.body.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
        }, 800);
    }

    // 8. Continuous Auto-Clicker Engine (Ticking every 100ms)
    setInterval(() => {
        if (state.totalCPS > 0) {
            state.capybaras += state.totalCPS / 10;
            updateUI();
        }
    }, 100);

    // 9. Save & Load (localStorage)
    function saveGame() {
        localStorage.setItem('capybara_clicker_save', JSON.stringify(state));
        console.log("Game auto-saved!");
    }

    function loadGame() {
        const saved = localStorage.getItem('capybara_clicker_save');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                
                // Ensure backward compatibility of schema with defensive typecasting
                if (parsed.capybaras !== undefined) state.capybaras = parseFloat(parsed.capybaras) || 0;
                if (parsed.clickPower !== undefined) state.clickPower = parseFloat(parsed.clickPower) || 1;
                if (parsed.totalCPS !== undefined) state.totalCPS = parseFloat(parsed.totalCPS) || 0;
                
                if (parsed.upgrades) {
                    for (const key in parsed.upgrades) {
                        if (state.upgrades[key] && parsed.upgrades[key]) {
                            state.upgrades[key].count = parseInt(parsed.upgrades[key].count) || 0;
                            state.upgrades[key].cost = parseFloat(parsed.upgrades[key].cost) || state.upgrades[key].base;
                        }
                    }
                }
                
                recalculateCPSAndPower();
                updateUI();
            } catch (err) {
                console.error("Error loading save file", err);
            }
        }
    }

    function resetGame() {
        if (confirm("Are you sure you want to reset your capybara empire? All your upgrades and capybaras will be permanently cleared!")) {
            state = {
                capybaras: 0,
                clickPower: 1,
                totalCPS: 0,
                upgrades: {
                    clicker: { count: 0, cost: 15, base: 15, cps: 0, power: 1 },
                    auto: { count: 0, cost: 100, base: 100, cps: 1, power: 0 },
                    farm: { count: 0, cost: 1100, base: 1100, cps: 10, power: 0 },
                    temple: { count: 0, cost: 12000, base: 12000, cps: 100, power: 0 }
                }
            };
            saveGame();
            recalculateCPSAndPower();
            updateUI();
        }
    }

    function triggerSaveAnimation() {
        btnSave.innerHTML = `<i class="ri-checkbox-circle-fill"></i> Saved!`;
        setTimeout(() => {
            btnSave.innerHTML = `<i class="ri-save-3-fill"></i> Save Game`;
        }, 1500);
    }

    // Attach saving events
    btnSave.addEventListener('click', () => {
        saveGame();
        triggerSaveAnimation();
    });
    btnReset.addEventListener('click', resetGame);

    // Auto-save every 10 seconds
    setInterval(saveGame, 10000);

    // Initial load
    checkSkins();
    loadGame();
    recalculateCPSAndPower();
    updateUI();
});
