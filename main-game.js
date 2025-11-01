// --- MAIN GAME ELEMENTS ---
const gameArea = document.getElementById('game-area');
const myDuckDisplay = document.getElementById('my-duck-display');
const saveToPondBtn = document.getElementById('save-to-pond-btn');
const sellDuckBtn = document.getElementById('sell-duck-btn');
const duckImageContainer = document.getElementById('duck-image-container');
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsMainView = document.getElementById('settings-main-view');
const showHowToPlayBtn = document.getElementById('show-how-to-play-btn');
const showResetBtn = document.getElementById('show-reset-btn');
const howToPlaySection = document.getElementById('how-to-play-section');
const resetSection = document.getElementById('reset-section');
const settingsBackBtns = document.querySelectorAll('.settings-back-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const devModeTrigger = document.getElementById('dev-mode-trigger');
const passwordSection = document.getElementById('password-section');
const devPasswordInput = document.getElementById('dev-password-input');
const devPasswordSubmit = document.getElementById('dev-password-submit');
const devSettingsSection = document.getElementById('dev-settings-section');
const devGuaranteedBtn = document.getElementById('dev-guaranteed-accessories');
const devGuaranteedStatus = document.getElementById('dev-guaranteed-status');
const devSpawnSpeedInput = document.getElementById('dev-spawn-speed');
const devDuckSpeedInput = document.getElementById('dev-duck-speed');
const devUnlockAllBtn = document.getElementById('dev-unlock-all');
const devMobileViewBtn = document.getElementById('dev-mobile-view-btn');
const showContactBtn = document.getElementById('show-contact-btn');
const contactSection = document.getElementById('contact-section');
const showAboutBtn = document.getElementById('show-about-btn');
const aboutSection = document.getElementById('about-section');
const sellChargeDisplay = document.getElementById('sell-charge-display');

// --- NEW SETTINGS UPGRADE ELEMENTS ---
const showUpgradesBtn = document.getElementById('show-upgrades-btn');
const upgradesSection = document.getElementById('upgrades-section');
// --- END NEW ---

// --- DUCK NAMING ELEMENTS ---
const duckNameDisplay = document.getElementById('duck-name-display');
const duckNameInputMain = document.getElementById('duck-name-input-main');

// --- PACK SHOP ELEMENTS ---
const showPacksBtn = document.getElementById('show-packs-btn');
const packOverlay = document.getElementById('pack-overlay');
const closePackBtn = document.getElementById('close-pack-btn');
const buyBronzePackBtn = document.getElementById('buy-bronze-pack');
const buySilverPackBtn = document.getElementById('buy-silver-pack');
const buyGoldPackBtn = document.getElementById('buy-gold-pack');

// --- PACK RESULT ELEMENTS ---
const packResultOverlay = document.getElementById('pack-result-overlay');
const closeResultBtn = document.getElementById('close-result-btn'); // This is the "Close" button
const resultImageContainer = document.getElementById('result-image-container');
const resultItemName = document.getElementById('result-item-name');
const equipResultBtn = document.getElementById('equip-result-btn');
const sendResultToPondBtn = document.getElementById('send-result-to-pond-btn');

// --- SHOP & UPGRADE ELEMENTS ---
const showShopBtn = document.getElementById('show-shop-btn');
const shopOverlay = document.getElementById('shop-overlay');
const closeShopBtn = document.getElementById('close-shop-btn');
const shopTimer = document.getElementById('shop-timer');
const shopItemsContainer = document.getElementById('shop-items-container');
// --- Tab Elements REMOVED ---
const upgradeSpawnBtn = document.getElementById('upgrade-spawn-btn');
const upgradeSpawnInfo = document.getElementById('upgrade-spawn-info');
// --- MODIFIED: Renamed item rate elements ---
const upgradeItemRateBtn = document.getElementById('upgrade-itemRate-btn');
const upgradeItemRateInfo = document.getElementById('upgrade-itemRate-info');
// --- END MODIFIED ---
const upgradeSellBtn = document.getElementById('upgrade-sell-btn');
const upgradeSellInfo = document.getElementById('upgrade-sell-info');
// --- END NEW ---

// --- MAIN GAME VARIABLES ---
let lastFrameTime = 0;
let timeSinceLastSpawn = 0;
let devModeGuaranteedAccessories = false;
let devModeUnlocked = false;
let duckSpawnCount = 0;
let shopTimerInterval = null; // For the shop countdown
let sellTimerInterval = null; // --- MODIFIED: For the sell CHARGE timer ---
let lastWonItem = null; // --- NEW: Stores the item from the pack ---

// --- PACK COSTS (MODIFIED) ---
const BRONZE_PACK_COST = 80;
const SILVER_PACK_COST = 400;
const GOLD_PACK_COST = 1500;

// --- SELL COOLDOWN (MOVED to duck-data.js) ---


// --- MAIN DUCK RENDER FUNCTION ---
function renderMainDuck() {
    // 1. Get the current "look" from the hidden placeholder elements
    let currentLook = {};
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => {
        const type = el.getAttribute('data-type');
        let src = el.getAttribute('data-src'); // Read from data-src
        // Convert 'null' string back to actual null
        if (src === 'null') src = null;
        if (type && src !== undefined) {
            currentLook[type] = src;
        }
    });
    const isFlipped = duckImageContainer.classList.contains('is-flipped');

    // 2. Clear the container (of visible images and old placeholders)
    duckImageContainer.innerHTML = '';

    // 3. Build the final set of images to render
    let imagesToRender = {};

    // 3a. Add default base parts
    BASE_DUCK_PARTS.forEach(part => {
        imagesToRender[part.type] = part.src;
    });

    // 3b. Override defaults with accessories from currentLook
    for (const type in currentLook) {
        imagesToRender[type] = currentLook[type];
    }

    // 4. Render all final images with correct z-index
    for (const type in imagesToRender) {
        const src = imagesToRender[type];

        // --- Skip rendering if src is null OR if it's the flip effect image ---
        if (src === null || src === 'images/flip-effect.png') {
            continue;
        }
        // --- END ---

        const img = document.createElement('img');
        img.src = src;

        // Assign z-index from the master list
        img.style.zIndex = LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type]; // Default to 0 if type not in LAYER_ORDER

        // Add appropriate class (base or accessory)
        const isBasePart = BASE_DUCK_PARTS.some(part => part.src === src);
        img.className = isBasePart ? 'base-duck-image' : 'accessory-image'; // Use accessory-image class for actual accessories now

        duckImageContainer.appendChild(img);
    }

    // 5. Re-add hidden placeholder elements for current accessories (including null src and flip effect)
    for (const type in currentLook) {
        const src = currentLook[type];
        const placeholder = document.createElement('div'); // Use div as placeholder
        placeholder.className = 'accessory-image'; // Keep class for identification
        placeholder.setAttribute('data-type', type);
        placeholder.setAttribute('data-src', src === null ? 'null' : src); // Store 'null' string if src is null
        placeholder.style.display = 'none'; // Hide the placeholder
        duckImageContainer.appendChild(placeholder);
    }

    // 6. Restore Flipped State
    if (isFlipped) {
        duckImageContainer.classList.add('is-flipped');
    } else {
        duckImageContainer.classList.remove('is-flipped');
    }

    // --- MODIFIED: This logic is now in checkSellCharges() ---
    // (This ensures the value updates live with the timer)
    checkSellCharges();
    // --- END MODIFICATION ---
}
// --------------------------------------------------------


// --- SETTINGS & DEV FUNCTIONS ---
function openSettings() {
    settingsOverlay.classList.remove('hidden');
    settingsBtn.classList.add('is-rotated');
    settingsMainView.classList.remove('hidden');
    howToPlaySection.classList.add('hidden');
    resetSection.classList.add('hidden');
    contactSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    // --- NEW: Hide upgrades section on open ---
    if (upgradesSection) upgradesSection.classList.add('hidden');

    // Set current values in dev inputs when opening
    if (devModeUnlocked) {
        devSpawnSpeedInput.value = DUCK_SPAWN_RATE_MS;
        devDuckSpeedInput.value = DUCK_SPEED_PX_PER_FRAME;
    }
}
function closeSettings() {
    settingsOverlay.classList.add('hidden');
    settingsBtn.classList.remove('is-rotated');
    passwordSection.classList.add('hidden');
    if (!devModeUnlocked) {
        devModeTrigger.classList.remove('hidden');
    }
}
function resetGame() {
    if (confirm("Are you sure? This will reset your Pond, Gallery, and Coins.")) {
        localStorage.removeItem('savedDucks');
        localStorage.removeItem('discoveredAccessories');
        localStorage.removeItem('userCoins'); // NEW: Reset coins
        localStorage.removeItem('hasVisited'); // Reset welcome flag too
        // --- NEW: Reset pond/gallery/upgrade flags ---
        localStorage.removeItem('hasVisitedPond');
        localStorage.removeItem('hasVisitedGallery');
        localStorage.removeItem('speedLevel'); // Still remove old data
        localStorage.removeItem('spawnLevel');
        localStorage.removeItem('accessoryLevel'); // NEW
        localStorage.removeItem('sellLevel'); // NEW
        // --- NEW: Reset shop data ---
        localStorage.removeItem('dailyShop');
        localStorage.removeItem('shopPurchased');
        // --- MODIFIED: Reset sell timer ---
        localStorage.removeItem('sellCharges');
        localStorage.removeItem('nextSellChargeTime');
        // --- NEW: Reset current duck save ---
        localStorage.removeItem('currentDuckSave');
        // --- END NEW ---

        // --- MODIFIED: Use new notice popup ---
        showNotice('Progress reset.', 'Success');

        // Reload after a short delay so user can read the notice
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}
function onDevTriggerClick() {
    openSettings();
    passwordSection.classList.remove('hidden');
    devModeTrigger.classList.add('hidden');
}
function checkDevPassword() {
    if (devPasswordInput.value === "1111") {
        passwordSection.classList.add('hidden');
        devSettingsSection.classList.remove('hidden');
        devModeUnlocked = true;

        // Load defaults into inputs
        devSpawnSpeedInput.value = DUCK_SPAWN_RATE_MS;
        devDuckSpeedInput.value = DUCK_SPEED_PX_PER_FRAME;
    } else {
        // --- MODIFIED: Use new notice popup ---
        showNotice("Incorrect Code.", 'Error');
        devPasswordInput.value = '';
    }
}
function toggleGuaranteedAccessories() {
    devModeGuaranteedAccessories = !devModeGuaranteedAccessories;
    devGuaranteedStatus.textContent = devModeGuaranteedAccessories ? "ON" : "OFF";
    devGuaranteedStatus.style.color = devModeGuaranteedAccessories ? "#33CC33" : "#FFF";
}
function unlockAllAccessories() {
    let allAccessorySrcs = ACCESSORIES.map(acc => acc.src);
    // Convert nulls to 'null' for storage consistency
    const keysToStore = allAccessorySrcs.map(src => src === null ? 'null' : src);
    localStorage.setItem('discoveredAccessories', JSON.stringify(keysToStore));

    // --- MODIFIED: Use new notice popup ---
    showNotice('All accessories unlocked! Go to the Gallery to see them.', 'Success');
}
function toggleMobileView() {
    document.body.classList.toggle('mobile-view');
    renderMainDuck(); // Re-render the duck
}
// --- END SETTINGS ---

// --- ACCESSORY TRACKING ---
function trackDiscoveredAccessory(accessorySrc) {
    if (accessorySrc === undefined) return;

    // --- 1. Permanent discovery (localStorage) ---
    let discovered = JSON.parse(localStorage.getItem('discoveredAccessories')) || [];
    const key = accessorySrc === null ? 'null' : accessorySrc;

    if (!discovered.includes(key)) {
        discovered.push(key);
        localStorage.setItem('discoveredAccessories', JSON.stringify(discovered));

        // --- 2. NEW: Temporary "just found" flag (sessionStorage) ---
        // This list is read by gallery.js to show "!" notifications
        let justDiscovered = JSON.parse(sessionStorage.getItem('justDiscoveredItems')) || [];
        if (!justDiscovered.includes(key)) {
            justDiscovered.push(key);
            sessionStorage.setItem('justDiscoveredItems', JSON.stringify(justDiscovered));
        }
        // --- END NEW ---
    }
}
// --- END TRACKING ---


// --- GAME LOOP AND DUCK CREATION ---
function createMarchingDuck() {
    // --- NEW: Increment the duck counter ---
    duckSpawnCount++;

    const duck = document.createElement('div');
    duck.className = 'marching-duck';
    duck.style.left = '-250px';
    // IMPORTANT: Set a high z-index for marching ducks so they are clickable
    duck.style.zIndex = 100;

    // --- MODIFIED: Made a much larger jump to raise the ducks higher on mobile ---
    duck.style.top = isMobileView() ? 'calc(55vh - 300px)' : 'calc(55vh - 280px)';

    // --- MODIFIED: Use new 1/2 chance from duck-data.js ---
    let shouldHaveAccessory = devModeGuaranteedAccessories || Math.random() < BASE_ACCESSORY_CHANCE; // Base 50% chance, upgradeable
    let forceHat = false;

    // If it's the 2nd duck AND dev mode isn't already guaranteeing one
    if (duckSpawnCount === 2 && !devModeGuaranteedAccessories) {
        shouldHaveAccessory = true;
        forceHat = true;
    }
    // --- END NEW LOGIC ---

    let selectedAccessory = null;
    let marchingLook = {}; // Store the marching duck's look

    if (shouldHaveAccessory) {
        // --- NEW: Force a hat if it's the 2nd duck ---
        if (forceHat) {
            const hatAccessories = ACCESSORIES.filter(acc => acc.type === 'hat');
            const randomIndex = Math.floor(Math.random() * hatAccessories.length);
            selectedAccessory = hatAccessories[randomIndex];
        }
        // --- END NEW LOGIC ---
        else if (devModeGuaranteedAccessories) {
            // --- FIX: When Guaranteed is ON, use equal weight (simple random selection) ---
            // Exclude mythical items (like Double Duck) and flip effect from guaranteed spawns
            const availableAccessories = ACCESSORIES.filter(acc => acc.rarityName !== 'mythical' && acc.effect !== 'flip');
            const randomIndex = Math.floor(Math.random() * availableAccessories.length);
            selectedAccessory = availableAccessories[randomIndex];
            // ---------------------------------------------------------------------------------
        } else {
            // Normal weighted selection
            const inverseWeights = ACCESSORIES.map(acc => ({ ...acc, weight: 1 / acc.rarity }));
            const totalInverseWeight = inverseWeights.reduce((sum, acc) => sum + acc.weight, 0);
            let randomWeight = Math.random() * totalInverseWeight;

            for (const accessory of inverseWeights) {
                randomWeight -= accessory.weight;
                if (randomWeight < 0) {
                    selectedAccessory = accessory;
                    break;
                }
            }
        }

        if (selectedAccessory) {
            // Add to the marching duck's look
            marchingLook[selectedAccessory.type] = selectedAccessory.src; // src can be null
            duck.setAttribute('data-accessory', JSON.stringify(selectedAccessory));
        }
    }

    // --- MODIFIED: Create the full duck (base + accessories) in correct order ---

    // 1. Get all images to render
    let imagesToRender = {};
    BASE_DUCK_PARTS.forEach(part => {
        imagesToRender[part.type] = part.src;
    });
    for (const type in marchingLook) {
        imagesToRender[type] = marchingLook[type]; // Overwrite with accessory (even if null)
    }

    // 2. Create a list of objects to sort
    let renderList = [];
    for (const type in imagesToRender) {
        renderList.push({
            src: imagesToRender[type],
            zIndex: LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type]
        });
    }

    // 3. Sort the list by z-index (lowest to highest)
    renderList.sort((a, b) => a.zIndex - b.zIndex);

    // 4. Append images in sorted order (no z-index needed, HTML order works)
    renderList.forEach(item => {
        // --- Skip rendering if src is null OR if it's the flip effect image ---
        if (item.src === null || item.src === 'images/flip-effect.png') {
            return;
        }
        // --- END ---

        const img = document.createElement('img');
        img.src = item.src;
        img.style.width = '100%';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        duck.appendChild(img);
    });
    // -----------------------------------------------------------------

    // Handle flip effect
    if (selectedAccessory && selectedAccessory.effect === 'flip') {
        duck.style.transform = 'scaleX(-1)';
    }


    duck.addEventListener('click', function () {
        if (!duck.hasAttribute('data-accessory')) return;
        const accessoryData = JSON.parse(duck.getAttribute('data-accessory'));

        trackDiscoveredAccessory(accessoryData.src); // Track null if src is null

        if (accessoryData.effect && accessoryData.effect === 'flip') {
            duckImageContainer.classList.add('is-flipped');
            // Add placeholder for flip effect
            const type = accessoryData.type;
            const src = accessoryData.src;
            // Remove existing placeholder of the exact same type
            duckImageContainer.querySelectorAll('.accessory-image').forEach(acc => {
                if (acc.getAttribute('data-type') === type) {
                    acc.remove();
                }
            });
            const newAccessoryEl = document.createElement('div');
            newAccessoryEl.setAttribute('data-type', type);
            newAccessoryEl.setAttribute('data-src', src);
            newAccessoryEl.className = 'accessory-image';
            newAccessoryEl.style.display = 'none';
            duckImageContainer.appendChild(newAccessoryEl);

        } else {
            const collectedAccessoryType = accessoryData.type;
            const collectedAccessorySrc = accessoryData.src; // Can be null

            // Remove existing placeholder of the exact same type
            duckImageContainer.querySelectorAll('.accessory-image').forEach(acc => {
                if (acc.getAttribute('data-type') === collectedAccessoryType) {
                    acc.remove(); // Remove the old one, whether it was visual or null
                }
            });

            // Add a new placeholder element (use div for simplicity)
            const newAccessoryEl = document.createElement('div'); // Using div
            newAccessoryEl.setAttribute('data-type', collectedAccessoryType);
            // Store 'null' as a string if src is null, otherwise store src
            newAccessoryEl.setAttribute('data-src', collectedAccessorySrc === null ? 'null' : collectedAccessorySrc);
            newAccessoryEl.className = 'accessory-image'; // Marks it for pickup
            newAccessoryEl.style.display = 'none'; // Hide the placeholder

            duckImageContainer.appendChild(newAccessoryEl);
        }

        renderMainDuck(); // Re-render the main duck to apply changes
        saveCurrentDuck(); // --- NEW: Save duck after getting item ---

        // --- MODIFIED: Redraw marching duck completely as base ---
        if (accessoryData.effect && accessoryData.effect === 'flip') {
            duck.removeAttribute('data-accessory');
            duck.style.transform = 'scaleX(1)';
            // No visual change needed on marching duck for flip removal
        } else {
            // Clear the marching duck's images
            duck.innerHTML = '';
            // Re-add ONLY the base parts in correct order
            let baseRenderList = [];
            BASE_DUCK_PARTS.forEach(part => {
                baseRenderList.push({
                    src: part.src,
                    zIndex: LAYER_ORDER[part.type] === undefined ? 0 : LAYER_ORDER[part.type]
                });
            });
            baseRenderList.sort((a, b) => a.zIndex - b.zIndex);
            baseRenderList.forEach(item => {
                const img = document.createElement('img');
                img.src = item.src;
                img.style.width = '100%';
                img.style.position = 'absolute';
                img.style.top = '0';
                img.style.left = '0';
                duck.appendChild(img);
            });

            duck.removeAttribute('data-accessory');
        }
        // --- END MODIFICATION ---
    });
    document.body.appendChild(duck);
}
function gameLoop(currentTime) {
    if (lastFrameTime === 0) { lastFrameTime = currentTime; }
    let deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    if (deltaTime > 1000) { deltaTime = 16; }

    // --- FIX: Only apply defaults if not in dev mode, allowing inputs to control values ---
    if (!devModeUnlocked) {
        // (We no longer set them here, we just use the global vars)
    }
    // ---------------------------------------------------------------------------------------

    document.querySelectorAll('.marching-duck').forEach(duck => {
        let currentPos = parseFloat(duck.style.left);
        duck.style.left = (currentPos + DUCK_SPEED_PX_PER_FRAME) + 'px';
        if (currentPos > window.innerWidth) duck.remove();
    });

    timeSinceLastSpawn += deltaTime;
    if (timeSinceLastSpawn > DUCK_SPAWN_RATE_MS) {
        createMarchingDuck();
        timeSinceLastSpawn = 0;
    }
    requestAnimationFrame(gameLoop);
}
// --- END GAME LOOP ---


// --- DUCK CONTROLS (MAIN PAGE) ---

// --- NEW FUNCTION: Saves the current duck to localStorage ---
function saveCurrentDuck() {
    let currentLook = {};
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => {
        const type = el.getAttribute('data-type');
        let src = el.getAttribute('data-src');
        if (src === 'null') src = null;
        if (type && src !== undefined) {
            currentLook[type] = src;
        }
    });

    const currentName = duckNameDisplay.textContent;
    const isFlipped = duckImageContainer.classList.contains('is-flipped');

    const duckToSave = {
        name: currentName,
        look: currentLook,
        flipped: isFlipped
    };

    localStorage.setItem('currentDuckSave', JSON.stringify(duckToSave));
}
// --- END NEW FUNCTION ---

// --- NEW FUNCTION: Loads the current duck from localStorage ---
function loadCurrentDuck() {
    const savedDuckJSON = localStorage.getItem('currentDuckSave');
    if (!savedDuckJSON) {
        renderMainDuck(); // Just render the base duck if no save
        return;
    }

    const savedDuck = JSON.parse(savedDuckJSON);

    // Set name
    duckNameDisplay.textContent = savedDuck.name || "Your Duck";

    // Clear any existing placeholders (from base render)
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => el.remove());

    // Add placeholders from save
    for (const type in savedDuck.look) {
        const src = savedDuck.look[type];
        const newAccessoryEl = document.createElement('div');
        newAccessoryEl.setAttribute('data-type', type);
        newAccessoryEl.setAttribute('data-src', src === null ? 'null' : src);
        newAccessoryEl.className = 'accessory-image';
        newAccessoryEl.style.display = 'none';
        duckImageContainer.appendChild(newAccessoryEl);
    }

    // Set flip status
    if (savedDuck.flipped) {
        duckImageContainer.classList.add('is-flipped');
    } else {
        duckImageContainer.classList.remove('is-flipped');
    }

    // Now, render the loaded duck
    renderMainDuck();
}
// --- END NEW FUNCTION ---

// --- MODIFIED FUNCTION ---
function resetDuck() {
    // Remove all accessories (placeholders)
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => el.remove());
    duckImageContainer.classList.remove('is-flipped');

    // --- NEW: Reset name display ---
    if (duckNameDisplay) duckNameDisplay.textContent = "Your Duck";

    // Re-render the duck (which will now be just the base parts)
    renderMainDuck();

    // --- NEW: Save the now-empty duck ---
    saveCurrentDuck();
}
// --- END MODIFIED FUNCTION ---

// This function gets the *current* duck's look from the DOM
// and passes it to the master calculation function.
function calculateCurrentDuckStatsFromDOM() {
    let currentLook = {};
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => {
        const type = el.getAttribute('data-type');
        let src = el.getAttribute('data-src');
        if (src === 'null') src = null;
        if (type && src !== undefined) {
            currentLook[type] = src;
        }
    });

    // Pass the look to the master calculator
    // We wrap it in a 'look' property to match the pond duck structure
    return calculateDuckStats({ look: currentLook });
}


function saveDuckToPond() {
    // --- ANIMATION FIX ---
    if (duckImageContainer.classList.contains('is-leaving')) return;

    // Get the current look BEFORE resetting
    let currentLook = {};
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => { // Changed variable name
        const type = el.getAttribute('data-type');
        let src = el.getAttribute('data-src'); // Read from data-src
        // Convert 'null' string back to null
        if (src === 'null') src = null;
        if (type && src !== undefined) { // Check src is not undefined
            currentLook[type] = src;
        }
    });

    // --- MODIFIED: Get the current name and check default ---
    let currentName = duckNameDisplay.textContent;
    if (currentName === "Your Duck") {
        currentName = "Unnamed Duck";
    }
    const duckToSave = { name: currentName, look: currentLook, flipped: duckImageContainer.classList.contains('is-flipped'), savedDate: Date.now() };
    // --- END MODIFICATION ---

    let savedLooks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    const isDuplicate = savedLooks.some(saved => JSON.stringify(saved.look) === JSON.stringify(duckToSave.look) && saved.flipped === duckToSave.flipped);
    if (!isDuplicate && savedLooks.length < POND_CAPACITY) {
        savedLooks.push(duckToSave);
        localStorage.setItem('savedDucks', JSON.stringify(savedLooks));
    } else if (savedLooks.length >= POND_CAPACITY) {
        // --- MODIFIED: Use new notice popup ---
        showNotice("The Pond is full!");
        return;
    }

    // --- ANIMATION FIX ---
    duckImageContainer.classList.add('is-leaving'); // Use the "pan right" animation
    setTimeout(() => {
        resetDuck(); // This now clears accessories, name, renders, AND saves the empty duck
        duckImageContainer.classList.remove('is-leaving'); // Clean up the "pan right" class
        duckImageContainer.classList.add('is-entering');
        setTimeout(() => { duckImageContainer.classList.remove('is-entering'); }, 600);
    }, 600);
}

function sellCurrentDuck() {
    // 1. Check if we have charges
    let charges = parseInt(localStorage.getItem('sellCharges') || '0');
    if (charges <= 0) {
        // --- MODIFIED: Silenced alert ---
        return;
    }

    // --- ANIMATION FIX ---
    if (duckImageContainer.classList.contains('is-leaving')) return;

    // 2. Calculate stats and rating
    const duckStats = calculateCurrentDuckStatsFromDOM();
    const rating = duckStats.rating;

    // 3. Calculate coins (1/3rd of rating, rounded up)
    // --- MODIFIED: Use the sell price multiplier AND 1/3 RATING ---
    const coinsToAdd = Math.ceil((rating / 3) * SELL_PRICE_MULTIPLIER);
    // --- END MODIFICATION ---

    // 4. --- MOVED ---

    // 5. Use one sell charge
    charges--;
    localStorage.setItem('sellCharges', charges);

    // 6. Start recharge timer if it's not already running
    const nextChargeTime = parseInt(localStorage.getItem('nextSellChargeTime') || '0');
    if (charges === (MAX_SELL_CHARGES - 1) && nextChargeTime === 0) { // Check if we just used the 5th charge
        // This was the 5th sell (or first time), so start the timer
        localStorage.setItem('nextSellChargeTime', Date.now() + SELL_CHARGE_REGEN_MS);
    }

    // 7. Start the 1-second checker interval
    checkSellCharges(); // Run immediately to update UI
    if (!sellTimerInterval) { // Start timer if it's not running
        sellTimerInterval = setInterval(checkSellCharges, 1000);
    }

    // 8. Play the "leaving" animation and reset the duck
    // --- ANIMATION FIX ---
    duckImageContainer.classList.add('is-leaving'); // Use the "pan right" animation
    setTimeout(() => {
        resetDuck(); // This now clears accessories, name, renders, AND saves the empty duck
        duckImageContainer.classList.remove('is-leaving'); // Clean up the "pan right" class
        duckImageContainer.classList.add('is-entering');
        setTimeout(() => { duckImageContainer.classList.remove('is-entering'); }, 600);
    }, 600);

    // --- NEW: Add coins and update display after 1.5 seconds ---
    setTimeout(() => {
        addCoins(coinsToAdd);
        displayCoinCount();
    }, 1500); // 1500ms = 1.5 seconds
}

// --- MODIFIED FUNCTION ---
function loadDuckFromPond() {
    const duckJSON = sessionStorage.getItem('duckToLoad');
    if (!duckJSON) return;
    const duckToLoad = JSON.parse(duckJSON);

    resetDuck(); // Clear the current duck (accessories and base) and save the empty state

    // --- NEW: Set the duck's name ---
    if (duckNameDisplay) {
        duckNameDisplay.textContent = duckToLoad.name || "Your Duck";
    }
    // --- END NEW ---

    if (duckToLoad.flipped) duckImageContainer.classList.add('is-flipped');

    // Add all accessories from the loaded duck
    for (const type in duckToLoad.look) {
        const src = duckToLoad.look[type]; // src can be null here
        const newAccessoryEl = document.createElement('div'); // Use div
        newAccessoryEl.setAttribute('data-type', type);
        // Store 'null' string if src is null
        newAccessoryEl.setAttribute('data-src', src === null ? 'null' : src);
        newAccessoryEl.className = 'accessory-image';
        newAccessoryEl.style.display = 'none'; // Hide the placeholder
        duckImageContainer.appendChild(newAccessoryEl);
    }

    // Now, re-render the duck to apply replacements
    renderMainDuck();

    // --- NEW: Save this newly loaded duck as the current duck ---
    saveCurrentDuck();

    sessionStorage.removeItem('duckToLoad');
}
// --- END MODIFIED FUNCTION ---

// --- DUCK NAMING FUNCTIONS ---
function showEditDuckName() {
    if (!duckNameDisplay || !duckNameInputMain) return;

    // Hide title, show input
    duckNameDisplay.classList.add('hidden');
    duckNameInputMain.classList.remove('hidden');

    // Set input value and focus
    let currentName = duckNameDisplay.textContent;
    if (currentName === "Your Duck") {
        duckNameInputMain.value = ""; // Start blank if it's the default
    } else {
        duckNameInputMain.value = currentName;
    }
    duckNameInputMain.focus();
}

// --- MODIFIED FUNCTION ---
function saveDuckNameMain() {
    if (!duckNameDisplay || !duckNameInputMain) return;

    let newName = duckNameInputMain.value.trim();
    if (newName === "") {
        duckNameDisplay.textContent = "Your Duck";
    } else {
        duckNameDisplay.textContent = newName;
    }

    // Hide input, show title
    duckNameInputMain.classList.add('hidden');
    duckNameDisplay.classList.remove('hidden');

    // --- NEW: Save the duck after renaming ---
    saveCurrentDuck();
}
// --- END MODIFIED FUNCTION ---

// --- === THIS ENTIRE FUNCTION IS REWRITTEN === ---
// --- === THIS ENTIRE FUNCTION IS REWRITTEN === ---
function checkSellCharges() {
    if (!sellDuckBtn || !sellChargeDisplay) return; // Make sure both elements exist
    const now = Date.now();

    // --- NEW: Calculate current duck value (USING 1/3) ---
    const duckStats = calculateCurrentDuckStatsFromDOM();
    const sellValue = Math.ceil(duckStats.rating / 3);
    // --- END NEW ---

    // Get current charges
    let charges = parseInt(localStorage.getItem('sellCharges') || '0');
    let nextChargeTime = parseInt(localStorage.getItem('nextSellChargeTime') || '0');

    // --- 1. Handle Charge Regeneration ---
    if (charges < MAX_SELL_CHARGES) {
        if (now > nextChargeTime && nextChargeTime !== 0) {
            // Time to add a charge
            charges++;
            localStorage.setItem('sellCharges', charges);

            if (charges < MAX_SELL_CHARGES) {
                // Not full yet, set timer for the *next* charge
                localStorage.setItem('nextSellChargeTime', now + SELL_CHARGE_REGEN_MS);
            } else {
                // Just hit max, clear timer
                localStorage.removeItem('nextSellChargeTime');
            }
        } else if (nextChargeTime === 0) {
            // We are not full, but timer isn't running. Start it.
            localStorage.setItem('nextSellChargeTime', now + SELL_CHARGE_REGEN_MS);
        }
    }

    // --- 2. Update UI Based on Charges ---

    // --- MODIFIED: ALWAYS set button text to value ---
    sellDuckBtn.innerHTML = `Sell<img src="images/coin.png" id="sell-value-coin-icon">${sellValue}`;

    if (charges > 0) {
        // We HAVE charges
        sellDuckBtn.classList.remove('is-disabled');
        // --- MODIFIED: Show charges in span ---
        sellChargeDisplay.textContent = `(${charges}/${MAX_SELL_CHARGES})`;

        // If we are full, stop the timer
        if (charges === MAX_SELL_CHARGES && sellTimerInterval) {
            clearInterval(sellTimerInterval);
            sellTimerInterval = null;
            localStorage.removeItem('nextSellChargeTime'); // Clean up
        }
    } else {
        // We have NO charges
        sellDuckBtn.classList.add('is-disabled');
        const msRemaining = parseInt(localStorage.getItem('nextSellChargeTime') || '0') - now;

        if (msRemaining > 0) {
            const minutes = Math.floor(msRemaining / 60000);
            const seconds = Math.floor((msRemaining % 60000) / 1000);
            // --- MODIFIED: Show timer in span ---
            sellChargeDisplay.textContent = `(${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')})`;
        } else {
            // Cooldown is done, but the tick hasn't run.
            // --- MODIFIED: Show timer in span ---
            sellChargeDisplay.textContent = "Recharging...";
        }
    }
}
// --- === END REWRITE === ---
// --- === END REWRITE === ---


// --- PACK SHOP FUNCTIONS ---

function openPackMenu() {
    if (packOverlay) packOverlay.classList.remove('hidden');
}

function closePackMenu() {
    if (packOverlay) packOverlay.classList.add('hidden');
}

function closeResultPopup() {
    if (packResultOverlay) packResultOverlay.classList.add('hidden');
    lastWonItem = null; // --- NEW: Clear the last won item ---
}

function buyPack(cost, rarityPool, packName) {
    // 1. Check coins
    if (getCoins() < cost) {
        // --- MODIFIED: Use new notice popup ---
        showNotice("Not enough coins for a " + packName + "!");
        return;
    }

    // 2. Create the item pool
    const itemPool = ACCESSORIES.filter(acc => rarityPool.includes(acc.rarityName));
    if (itemPool.length === 0) {
        // --- MODIFIED: Use new notice popup ---
        showNotice("Sorry, " + packName + "s are sold out!");
        return;
    }

    // 3. Subtract coins and update display
    addCoins(-cost);
    displayCoinCount();

    // 4. Pick a random item
    const item = itemPool[Math.floor(Math.random() * itemPool.length)];

    // 5. Give item to player (add to gallery)
    trackDiscoveredAccessory(item.src);

    // 6. Show the cool result popup!
    showPackResult(item);
}

function showPackResult(item) {
    // --- NEW: Store the item so buttons can use it ---
    lastWonItem = item;

    // 1. Clear previous result
    resultImageContainer.innerHTML = '';

    // 2. Set item name
    resultItemName.textContent = `A ${item.displayName}!`;

    // 3. Set border color based on rarity
    const wrapper = document.getElementById('result-image-wrapper');
    wrapper.className = `rarity-${item.rarityName || 'common'}`; // Use .className to replace all

    // 4. Build the preview (base duck + new item)
    let imagesToRender = {};
    BASE_DUCK_PARTS.forEach(part => {
        imagesToRender[part.type] = part.src;
    });

    // Add the new item
    imagesToRender[item.type] = item.src;

    // Handle flip effect
    if (item.effect === 'flip') {
        resultImageContainer.style.transform = 'scaleX(-1)';
    } else {
        resultImageContainer.style.transform = 'scaleX(1)';
    }

    // 5. Create a list to sort by z-index
    let renderList = [];
    for (const type in imagesToRender) {
        renderList.push({
            src: imagesToRender[type],
            zIndex: LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type]
        });
    }
    renderList.sort((a, b) => a.zIndex - b.zIndex);

    // 6. Add images to the container
    renderList.forEach(imgData => {
        if (imgData.src === null || imgData.src === 'images/flip-effect.png') {
            return;
        }
        const img = document.createElement('img');
        img.src = imgData.src;
        resultImageContainer.appendChild(img);
    });

    // 7. Show the popup
    closePackMenu(); // Close the shop
    // --- NEW: Close shop menu if it's open ---
    closeShopMenu();
    // --- END NEW ---
    packResultOverlay.classList.remove('hidden'); // Show the result
}

// --- NEW: Function to equip the won item ---
function equipWonItem() {
    if (!lastWonItem) return;

    if (lastWonItem.effect && lastWonItem.effect === 'flip') {
        duckImageContainer.classList.add('is-flipped');
        // Add placeholder for flip effect
        const type = lastWonItem.type;
        const src = lastWonItem.src;
        // Remove existing placeholder of the exact same type
        duckImageContainer.querySelectorAll('.accessory-image').forEach(acc => {
            if (acc.getAttribute('data-type') === type) {
                acc.remove();
            }
        });
        const newAccessoryEl = document.createElement('div');
        newAccessoryEl.setAttribute('data-type', type);
        newAccessoryEl.setAttribute('data-src', src);
        newAccessoryEl.className = 'accessory-image';
        newAccessoryEl.style.display = 'none';
        duckImageContainer.appendChild(newAccessoryEl);

    } else {
        const collectedAccessoryType = lastWonItem.type;
        const collectedAccessorySrc = lastWonItem.src; // Can be null

        // Remove existing placeholder of the exact same type
        duckImageContainer.querySelectorAll('.accessory-image').forEach(acc => {
            if (acc.getAttribute('data-type') === collectedAccessoryType) {
                acc.remove(); // Remove the old one
            }
        });

        // Add a new placeholder element
        const newAccessoryEl = document.createElement('div');
        newAccessoryEl.setAttribute('data-type', collectedAccessoryType);
        newAccessoryEl.setAttribute('data-src', collectedAccessorySrc === null ? 'null' : collectedAccessorySrc);
        newAccessoryEl.className = 'accessory-image';
        newAccessoryEl.style.display = 'none';
        duckImageContainer.appendChild(newAccessoryEl);
    }

    renderMainDuck(); // Re-render the main duck

    // --- NEW: Save the duck after equipping ---
    saveCurrentDuck();

    closeResultPopup(); // Close the popup
}

// --- NEW: Function to send the won item to the pond ---
function sendWonItemToPond() {
    if (!lastWonItem) return;

    let savedLooks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    if (savedLooks.length >= POND_CAPACITY) {
        showNotice("The Pond is full!");
        return;
    }

    // Create a new duck with only this item
    const newDuck = {
        name: "Unnamed Duck",
        look: { [lastWonItem.type]: lastWonItem.src },
        flipped: (lastWonItem.effect === 'flip'), // Also save the flip status!
        savedDate: Date.now()
    };

    savedLooks.push(newDuck);
    localStorage.setItem('savedDucks', JSON.stringify(savedLooks));

    showNotice(`${lastWonItem.displayName} was sent to the Pond!`, "Success");
    closeResultPopup();
}

// --- END PACK SHOP FUNCTIONS ---

// --- SHOP & UPGRADE FUNCTIONS ---

function openShopMenu() {
    // 1. Check if shop needs refresh
    refreshShopIfNeeded();
    // 2. Draw the items
    displayShopItems();
    // 3. Update the upgrade button text (This will run when settings is opened now)
    // updateUpgradeUI(); 
    // 4. Update the timer text
    updateShopTimer();
    // 5. Start the timer interval
    if (shopTimerInterval) clearInterval(shopTimerInterval); // Clear old one
    shopTimerInterval = setInterval(updateShopTimer, 1000);
    // 6. Show the popup
    if (shopOverlay) shopOverlay.classList.remove('hidden');
    // 7. --- Tab logic REMOVED ---
}

function closeShopMenu() {
    // 1. Stop the timer
    if (shopTimerInterval) clearInterval(shopTimerInterval);
    // 2. Hide the popup
    if (shopOverlay) shopOverlay.classList.add('hidden');
    // 3. Reset upgrades to collapsed state (REMOVED)
}

// --- Tab function REMOVED ---

function refreshShopIfNeeded() {
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    let shopData = JSON.parse(localStorage.getItem('dailyShop'));
    const now = Date.now();

    if (!shopData || (now - shopData.timestamp > TWENTY_FOUR_HOURS_MS)) {
        // Time to refresh!
        let newShopItems = [];
        // Get 3 random, non-mythical, non-flip items
        const availableItems = ACCESSORIES.filter(a => a.rarityName !== 'mythical' && a.effect !== 'flip');

        for (let i = 0; i < 3; i++) {
            if (availableItems.length === 0) break; // Stop if we run out

            // Pick and remove an item to prevent duplicates
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            const item = availableItems.splice(randomIndex, 1)[0];

            // --- MODIFIED: Price much cheaper ---
            const price = Math.floor(item.rarity * 20); // e.g., rarity 5 = 100 coins

            newShopItems.push({
                name: item.displayName,
                rarity: item.rarityName,
                price: price,
                src: item.src,
                type: item.type // This is needed for the buy button
            });
        }

        // Save new shop data
        localStorage.setItem('dailyShop', JSON.stringify({
            timestamp: now,
            items: newShopItems
        }));

        // Clear the "purchased" list for the new day
        localStorage.setItem('shopPurchased', '[]');
    }
}

// --- MODIFIED: This function now builds cards ---
function displayShopItems() {
    let shopData = JSON.parse(localStorage.getItem('dailyShop'));
    let purchasedItems = JSON.parse(localStorage.getItem('shopPurchased')) || [];

    shopItemsContainer.innerHTML = ''; // Clear old items

    if (!shopData || shopData.items.length === 0) {
        shopItemsContainer.innerHTML = "<p>Shop is empty. Check back tomorrow!</p>";
        return;
    }

    shopData.items.forEach(item => {
        const isSoldOut = purchasedItems.includes(item.name);

        // Build the preview (base duck + item)
        let previewImages = {};
        BASE_DUCK_PARTS.forEach(part => previewImages[part.type] = part.src);
        previewImages[item.type] = item.src;

        let previewRenderList = [];
        for (const type in previewImages) {
            previewRenderList.push({
                src: previewImages[type],
                zIndex: LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type]
            });
        }
        previewRenderList.sort((a, b) => a.zIndex - b.zIndex);

        let previewHTML = '';
        previewRenderList.forEach(imgData => {
            if (imgData.src !== null && imgData.src !== 'images/flip-effect.png') {
                previewHTML += `<img src="${imgData.src}">`;
            }
        });

        // Create the full shop card HTML
        const itemDiv = document.createElement('div');
        // Add rarity class to the card itself for the border
        itemDiv.className = `shop-card rarity-${item.rarity || 'common'}`;

        itemDiv.innerHTML = `
            <div class="shop-card-preview">
                ${previewHTML}
            </div>
            <div class="shop-card-info">
                <span>${item.name}</span>
                <small class="rarity-${item.rarity || 'common'}">${item.rarity}</small>
            </div>
            <div class="shop-card-buy">
                <span class="shop-item-price">${item.price} Coins</span>
                ${isSoldOut ?
                '<button class="shop-sold-out is-disabled">Sold Out</button>' :
                // --- MODIFIED: Added data-type ---
                `<button class="shop-buy-btn" data-name="${item.name}" data-price="${item.price}" data-src="${item.src}" data-type="${item.type}">Buy</button>`
            }
            </div>
        `;

        shopItemsContainer.appendChild(itemDiv);
    });

    // Add event listeners to the new "Buy" buttons
    shopItemsContainer.querySelectorAll('.shop-buy-btn').forEach(btn => {
        btn.addEventListener('click', buyShopItem);
    });
}
// --- END MODIFICATION ---

// --- THIS FUNCTION IS REWRITTEN ---
function buyShopItem(e) {
    const btn = e.currentTarget;
    const itemName = btn.dataset.name;
    const itemPrice = parseInt(btn.dataset.price);

    if (getCoins() < itemPrice) {
        showNotice("Not enough coins!");
        return; // Stop here
    }

    // 1. Pay
    addCoins(-itemPrice);
    displayCoinCount();

    // 2. Mark as purchased IMMEDIATELY
    let purchasedItems = JSON.parse(localStorage.getItem('shopPurchased')) || [];
    purchasedItems.push(itemName);
    localStorage.setItem('shopPurchased', JSON.stringify(purchasedItems));

    // 3. Find the full item object from the master list
    // We need the full object for showPackResult to work
    const item = ACCESSORIES.find(acc => acc.displayName === itemName);

    if (!item) {
        // This should never happen if data is correct
        console.error("Could not find purchased item in ACCESSORIES list:", itemName);
        return;
    }

    // 4. Get item (track discovery)
    trackDiscoveredAccessory(item.src);

    // 5. Redraw the shop in the background to show "Sold Out"
    displayShopItems();

    // 6. Show the result popup (re-using the pack result screen)
    showPackResult(item);
}
// --- END REWRITE ---

function updateShopTimer() {
    let shopData = JSON.parse(localStorage.getItem('dailyShop'));
    if (!shopData) {
        shopTimer.textContent = "Shop refreshing...";
        return;
    }

    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const nextRefreshTime = shopData.timestamp + TWENTY_FOUR_HOURS_MS;
    const msRemaining = nextRefreshTime - Date.now();

    if (msRemaining <= 0) {
        shopTimer.textContent = "Refreshing now...";
        refreshShopIfNeeded();
        displayShopItems();
        return;
    }

    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);

    shopTimer.textContent = `Refreshes in ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// --- === THIS IS THE MODIFIED FUNCTION === ---
// Reads levels from localStorage and updates the text in the new cards
function updateUpgradeUI() {
    // --- MODIFIED: Renamed item rate elements ---
    if (!upgradeSpawnInfo || !upgradeItemRateInfo || !upgradeSellInfo) return;

    // Get current levels
    let spawnLvl = parseInt(localStorage.getItem('spawnLevel') || '0');
    let itemRateLvl = parseInt(localStorage.getItem('accessoryLevel') || '0'); // Still uses accessoryLevel in storage
    let sellLvl = parseInt(localStorage.getItem('sellLevel') || '0');

    // Calculate costs (using floor to get whole numbers)
    let spawnCost = Math.floor(SPAWN_UPGRADE_BASE_COST * Math.pow(SPAWN_UPGRADE_COST_SCALING, spawnLvl));
    let itemRateCost = Math.floor(ACCESSORY_UPGRADE_BASE_COST * Math.pow(ACCESSORY_UPGRADE_COST_SCALING, itemRateLvl));
    let sellCost = Math.floor(SELL_UPGRADE_BASE_COST * Math.pow(SELL_UPGRADE_COST_SCALING, sellLvl));

    // --- NEW LOGIC: Update spans and buttons separately ---

    // Update Level Spans
    upgradeSpawnInfo.textContent = `Level ${spawnLvl}`;
    upgradeItemRateInfo.textContent = `Level ${itemRateLvl}`;
    upgradeSellInfo.textContent = `Level ${sellLvl}`;

    // Update Button Text (we can find them by ID)
    if (upgradeSpawnBtn) upgradeSpawnBtn.textContent = `Cost: ${spawnCost}`;
    if (upgradeItemRateBtn) upgradeItemRateBtn.textContent = `Cost: ${itemRateCost}`;
    if (upgradeSellBtn) upgradeSellBtn.textContent = `Cost: ${sellCost}`;
}
// --- === END MODIFIED FUNCTION === ---


// Speed Upgrade function REMOVED

// Handles the purchase logic for Spawn Rate
function buySpawnUpgrade() {
    let spawnLvl = parseInt(localStorage.getItem('spawnLevel') || '0');
    let cost = Math.floor(SPAWN_UPGRADE_BASE_COST * Math.pow(SPAWN_UPGRADE_COST_SCALING, spawnLvl));

    if (getCoins() >= cost) {
        addCoins(-cost);
        displayCoinCount();
        spawnLvl++;
        localStorage.setItem('spawnLevel', spawnLvl);

        // Update the global game variable
        DUCK_SPAWN_RATE_MS = Math.max(SPAWN_MIN_RATE_MS, (isMobileView() ? 5000 : 2000) - (spawnLvl * SPAWN_UPGRADE_BONUS_MS));

        updateUpgradeUI(); // Refresh the text
    } else {
        // --- MODIFIED: Use new notice popup ---
        showNotice("Not enough coins for this upgrade!");
    }
}

// --- MODIFIED: Renamed function ---
function buyItemRateUpgrade() {
    let itemRateLvl = parseInt(localStorage.getItem('accessoryLevel') || '0'); // Still uses accessoryLevel in storage
    let cost = Math.floor(ACCESSORY_UPGRADE_BASE_COST * Math.pow(ACCESSORY_UPGRADE_COST_SCALING, itemRateLvl));

    if (getCoins() >= cost) {
        addCoins(-cost);
        displayCoinCount();
        itemRateLvl++;
        localStorage.setItem('accessoryLevel', itemRateLvl); // Still uses accessoryLevel in storage

        // Update the global game variable
        BASE_ACCESSORY_CHANCE = Math.min(ACCESSORY_CHANCE_CAP, 0.50 + (itemRateLvl * ACCESSORY_UPGRADE_BONUS));

        updateUpgradeUI(); // Refresh the text
    } else {
        // --- MODIFIED: Use new notice popup ---
        showNotice("Not enough coins for this upgrade!");
    }
}

// --- NEW: Handles the purchase logic for Sell Price ---
function buySellUpgrade() {
    let sellLvl = parseInt(localStorage.getItem('sellLevel') || '0');
    let cost = Math.floor(SELL_UPGRADE_BASE_COST * Math.pow(SELL_UPGRADE_COST_SCALING, sellLvl));

    if (getCoins() >= cost) {
        addCoins(-cost);
        displayCoinCount();
        sellLvl++;
        localStorage.setItem('sellLevel', sellLvl);

        // Update the global game variable
        SELL_PRICE_MULTIPLIER = 1 + (sellLvl * SELL_UPGRADE_BONUS);

        updateUpgradeUI(); // Refresh the text
    } else {
        // --- MODIFIED: Use new notice popup ---
        showNotice("Not enough coins for this upgrade!");
    }
}

// --- END SHOP & UPGRADE FUNCTIONS ---


// --- MAIN PAGE EVENT LISTENERS ---
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        // --- NEW: Update UI when settings is opened ---
        if (settingsOverlay.classList.contains('hidden')) {
            updateUpgradeUI();
            openSettings();
        } else {
            closeSettings();
        }
    });
}
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettings);
}
if (showHowToPlayBtn) {
    showHowToPlayBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        howToPlaySection.classList.remove('hidden');
    });
}
// --- NEW: Listener for Upgrades Button ---
if (showUpgradesBtn) {
    showUpgradesBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        upgradesSection.classList.remove('hidden');
    });
}
if (showContactBtn) {
    showContactBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        contactSection.classList.remove('hidden');
    });
}
if (showAboutBtn) {
    showAboutBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        aboutSection.classList.remove('hidden');
    });
}
if (showResetBtn) {
    showResetBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        resetSection.classList.remove('hidden');
    });
}

// --- UPGRADE LISTENERS (now inside settings) ---
if (upgradeSpawnBtn) {
    upgradeSpawnBtn.addEventListener('click', buySpawnUpgrade);
}
// --- MODIFIED: Renamed listener ---
if (upgradeItemRateBtn) {
    upgradeItemRateBtn.addEventListener('click', buyItemRateUpgrade);
}
if (upgradeSellBtn) {
    upgradeSellBtn.addEventListener('click', buySellUpgrade);
}
// --- END ---

if (settingsBackBtns) {
    settingsBackBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.add('hidden');
            // Check if we are in the main settings
            if (btn.closest('#settings-menu')) {
                settingsMainView.classList.remove('hidden');
            }
        });
    });
}
if (resetGameBtn) {
    resetGameBtn.addEventListener('click', resetGame);
}
if (saveToPondBtn) {
    saveToPondBtn.addEventListener('click', saveDuckToPond);
}
if (sellDuckBtn) {
    sellDuckBtn.addEventListener('click', sellCurrentDuck);
}
if (devModeTrigger) {
    devModeTrigger.addEventListener('click', onDevTriggerClick);
}
if (devPasswordSubmit) {
    devPasswordSubmit.addEventListener('click', checkDevPassword);
}
if (devGuaranteedBtn) {
    devGuaranteedBtn.addEventListener('click', toggleGuaranteedAccessories);
}
if (devMobileViewBtn) {
    devMobileViewBtn.addEventListener('click', toggleMobileView);
}
if (devSpawnSpeedInput) {
    devSpawnSpeedInput.addEventListener('input', (e) => DUCK_SPAWN_RATE_MS = Number(e.target.value));
}
if (devDuckSpeedInput) {
    devDuckSpeedInput.addEventListener('input', (e) => DUCK_SPEED_PX_PER_FRAME = Number(e.target.value));
}
if (devUnlockAllBtn) {
    devUnlockAllBtn.addEventListener('click', unlockAllAccessories);
}

// --- PACK SHOP LISTENERS ---
if (showPacksBtn) {
    showPacksBtn.addEventListener('click', openPackMenu);
}
if (closePackBtn) {
    closePackBtn.addEventListener('click', closePackMenu);
}
if (closeResultBtn) {
    closeResultBtn.addEventListener('click', closeResultPopup);
}
if (buyBronzePackBtn) {
    buyBronzePackBtn.addEventListener('click', () => {
        buyPack(BRONZE_PACK_COST, ['common'], 'Bronze Pack');
    });
}
if (buySilverPackBtn) {
    buySilverPackBtn.addEventListener('click', () => {
        buyPack(SILVER_PACK_COST, ['uncommon', 'rare'], 'Silver Pack');
    });
}
if (buyGoldPackBtn) {
    buyGoldPackBtn.addEventListener('click', () => {
        buyPack(GOLD_PACK_COST, ['very-rare', 'legendary', 'mythical'], 'Gold Pack');
    });
}
// --- NEW: Result Action Listeners ---
if (equipResultBtn) {
    equipResultBtn.addEventListener('click', equipWonItem);
}
if (sendResultToPondBtn) {
    sendResultToPondBtn.addEventListener('click', sendWonItemToPond);
}
// --- END PACK LISTENERS ---

// --- SHOP LISTENERS (Simplified) ---
if (showShopBtn) {
    showShopBtn.addEventListener('click', openShopMenu);
}
if (closeShopBtn) {
    closeShopBtn.addEventListener('click', closeShopMenu);
}
// --- Tab listeners REMOVED ---

// --- NEW: DUCK NAMING LISTENERS ---
if (duckNameDisplay) {
    duckNameDisplay.addEventListener('click', showEditDuckName);
}
if (duckImageContainer) {
    duckImageContainer.addEventListener('click', showEditDuckName);
}
if (duckNameInputMain) {
    // Save on "Enter"
    duckNameInputMain.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveDuckNameMain();
            e.target.blur(); // Remove focus
        }
    });
    // Save on "click away"
    duckNameInputMain.addEventListener('blur', saveDuckNameMain);
}
// --- END NEW ---


// This logic is for the main page (index.html) only
if (duckImageContainer) {
    // This listener runs *after* the master one in shared-logic.js
    document.addEventListener('DOMContentLoaded', () => {
        // --- MODIFIED: Load current duck FIRST ---
        loadCurrentDuck();
        // renderMainDuck(); // This is now called *inside* loadCurrentDuck()
        loadDuckFromPond(); // This will load accessories AND re-render the duck
        // --- END MODIFIED ---

        // --- NEW: Start the sell charge timer on page load ---
        checkSellCharges(); // Run once immediately
        let charges = parseInt(localStorage.getItem('sellCharges') || '0');
        // Start timer only if not full
        if (charges < MAX_SELL_CHARGES && !sellTimerInterval) {
            sellTimerInterval = setInterval(checkSellCharges, 1000);
        }
        // --- END NEW ---
    });

    // Start the game loop
    requestAnimationFrame(gameLoop);
}