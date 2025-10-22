// A dynamic function to check for mobile view at any time
function isMobileView() {
    return document.body.classList.contains('mobile-view') || window.innerWidth <= 600;
}

// --- FIX: Initialize control variables to their default mobile/desktop values ---
// These are now controlled by the game loop initially, but can be overwritten by dev mode inputs
let DUCK_SPAWN_RATE_MS = isMobileView() ? 5000 : 2000;
let DUCK_SPEED_PX_PER_FRAME = isMobileView() ? 1.5 : 2;
const POND_CAPACITY = 1000;
// -------------------------------------------------------------------------------

// --- MODIFIED: This is now the SINGLE SOURCE OF TRUTH for all layering ---
// Accessories (e.g., 'ride') and base parts (e.g., 'legs') all
// get their z-index from this one object.
const LAYER_ORDER = {
    // Base Duck Slots (Replaced by accessories of the same type)
    'ride': 0,       // Replaced by 'ride' accessories
    'feathers': 1,   // Replaced by 'feathers' accessories
    'eyecolor': 2,   // Replaced by 'eyecolor' accessories
    'beak': 3,       // Replaced by 'beak' accessories
    'legs': 4,       // Replaced by 'legs' accessories (NEW)

    // Additive Layers (Stack on top)
    'pants': 5,      // Stacks on top of 'feathers' (z:1)
    'wings': 6,      // Replaced by 'wings' accessories
    'back': 7,       // Stacks on top
    'hat': 8,        // Stacks on top
    'other': 9       // Stacks on top (Includes flip effect marker)
};
// -------------------------------------------------------------

// --- MODIFIED: This list now just maps a TYPE to its DEFAULT image ---
// The z-index is now controlled by LAYER_ORDER.
const BASE_DUCK_PARTS = [
    { type: 'ride', src: 'images/baseduck/BOARD.png' },
    { type: 'feathers', src: 'images/baseduck/BODY.png' },
    { type: 'eyecolor', src: 'images/baseduck/EYE.png' },
    { type: 'beak', src: 'images/baseduck/BEAK.png' },
    { type: 'legs', src: 'images/baseduck/LEGS.png' },
    { type: 'wings', src: 'images/baseduck/WING.png' }
];
// -------------------------------------------------------------


const ACCESSORIES = [
    // ... (All your accessories remain the same) ...
    { src: 'images/hat.png', rarity: 5, rarityName: 'common', type: 'hat', displayName: 'Top Hat' },
    { src: 'images/fez.png', rarity: 20, rarityName: 'uncommon', type: 'hat', displayName: 'Fez' },
    { src: 'images/saddle.png', rarity: 40, rarityName: 'rare', type: 'back', displayName: 'Saddle' },
    { src: 'images/redeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Red Eyes' },
    { src: 'images/angryeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Angry Eyes' },
    { src: 'images/happyeye.png', rarity: 6, rarityName: 'common', type: 'eyecolor', displayName: 'Happy Eyes' },
    { src: 'images/tealeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Teal Eyes' },
    { src: 'images/yelloweye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Yellow Eyes' },
    { src: 'images/blueeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Blue Eyes' },
    { src: 'images/lasereye.png', rarity: 200, rarityName: 'legendary', type: 'eyecolor', displayName: 'Laser Eyes' },
    { src: 'images/ghosteye.png', rarity: 60, rarityName: 'rare', type: 'eyecolor', displayName: 'Ghost Eyes' },
    { src: 'images/eye2.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Simple Eyes' },
    { src: 'images/sunglasses.png', rarity: 20, rarityName: 'uncommon', type: 'eyecolor', displayName: 'Sunglasses' },
    { src: 'images/forwardeye.png', rarity: 80, rarityName: 'very-rare', type: 'eyecolor', displayName: 'Forward Eyes' },
    { src: 'images/squareeye.png', rarity: 8, rarityName: 'common', type: 'eyecolor', displayName: 'Square Eyes' },
    { src: 'images/bluehat.png', rarity: 7, rarityName: 'common', type: 'hat', displayName: 'Blue Cap' },
    { src: 'images/pinkhat.png', rarity: 7, rarityName: 'common', type: 'hat', displayName: 'Pink Cap' },
    { src: 'images/yellowhat.png', rarity: 7, rarityName: 'common', type: 'hat', displayName: 'Yellow Cap' },
    { src: 'images/redhat.png', rarity: 7, rarityName: 'common', type: 'hat', displayName: 'Red Cap' },
    { src: 'images/blackbandanahat.png', rarity: 30, rarityName: 'uncommon', type: 'hat', displayName: 'Black Bandana' },
    { src: 'images/halohat.png', rarity: 150, rarityName: 'legendary', type: 'hat', displayName: 'Halo' },
    { src: 'images/partyhat.png', rarity: 25, rarityName: 'uncommon', type: 'hat', displayName: 'Party Hat' },
    { src: 'images/nailhat.png', rarity: 80, rarityName: 'very-rare', type: 'hat', displayName: 'Nail Cap' },
    { src: 'images/nailback.png', rarity: 75, rarityName: 'very-rare', type: 'back', displayName: 'Nail Back' },
    { src: 'images/mutantback.png', rarity: 120, rarityName: 'legendary', type: 'back', displayName: 'Mutant Back' },
    { src: 'images/umbrellaback.png', rarity: 35, rarityName: 'uncommon', type: 'back', displayName: 'Umbrella' },
    { src: 'images/bluebandwing.png', rarity: 15, rarityName: 'uncommon', type: 'wings', displayName: 'Blue Bands' },
    { src: 'images/blackbandwing.png', rarity: 15, rarityName: 'uncommon', type: 'wings', displayName: 'Black Bands' },
    { src: 'images/goldbraceletwing.png', rarity: 50, rarityName: 'rare', type: 'wings', displayName: 'Gold Bracelets' },
    { src: 'images/mallardfeathers.png', rarity: 5, rarityName: 'common', type: 'feathers', displayName: 'Mallard Feathers' },
    { src: 'images/checkerfeathers.png', rarity: 30, rarityName: 'uncommon', type: 'feathers', displayName: 'Checker Feathers' },
    { src: 'images/femalefeathers.png', rarity: 10, rarityName: 'common', type: 'feathers', displayName: 'Female Feathers' },
    { src: 'images/darkpants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Dark Pants' },
    { src: 'images/jeanspants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Jeans' },
    { src: 'images/kahikipants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Khaki Pants' },
    { src: 'images/rainbowpants.png', rarity: 100, rarityName: 'very-rare', type: 'pants', displayName: 'Rainbow Pants' },
    { src: 'images/freakduck.png', rarity: 500, rarityName: 'mythical', type: 'other', displayName: 'Double Duck' },
    { src: 'images/flip-effect.png', rarity: 200, rarityName: 'legendary', type: 'other', effect: 'flip', displayName: 'Flip' },
    { src: 'images/babyhair.png', rarity: 15, rarityName: 'uncommon', type: 'hat', displayName: 'Baby Hair' },
    { src: 'images/bluefeathers.png', rarity: 10, rarityName: 'common', type: 'feathers', displayName: 'Blue Feathers' },
    { src: 'images/evileye.png', rarity: 50, rarityName: 'rare', type: 'eyecolor', displayName: 'Evil Eye' },
    { src: 'images/longbeak.png', rarity: 25, rarityName: 'uncommon', type: 'beak', displayName: 'Long Beak' },
    { src: 'images/longwing.png', rarity: 30, rarityName: 'uncommon', type: 'wings', displayName: 'Long Wings' },
    { src: 'images/openbeak.png', rarity: 15, rarityName: 'uncommon', type: 'beak', displayName: 'Open Beak' },
    { src: 'images/overbitebeak.png', rarity: 45, rarityName: 'rare', type: 'beak', displayName: 'Overbite Beak' },
    { src: 'images/pelicanbeak.png', rarity: 75, rarityName: 'very-rare', type: 'beak', displayName: 'Pelican Beak' },
    { src: 'images/rainbowbeak.png', rarity: 150, rarityName: 'legendary', type: 'beak', displayName: 'Rainbow Beak' },
    { src: 'images/redfeathers.png', rarity: 10, rarityName: 'common', type: 'feathers', displayName: 'Red Feathers' },
    { src: 'images/slightlyopenbeak.png', rarity: 10, rarityName: 'common', type: 'beak', displayName: 'Slightly Open Beak' },
    { src: 'images/sodafeathers.png', rarity: 50, rarityName: 'rare', type: 'feathers', displayName: 'Soda Feathers' },
    { src: 'images/sodahat.png', rarity: 50, rarityName: 'rare', type: 'hat', displayName: 'Soda Hat' },
    { src: 'images/squigglybeak.png', rarity: 60, rarityName: 'rare', type: 'beak', displayName: 'Squiggly Beak' },
    { src: 'images/yellowbeak.png', rarity: 5, rarityName: 'common', type: 'beak', displayName: 'Yellow Beak' },
    { src: 'images/yellowfeathers.png', rarity: 10, rarityName: 'common', type: 'feathers', displayName: 'Yellow Feathers' },
    { src: 'images/downbeak.png', rarity: 30, rarityName: 'uncommon', type: 'beak', displayName: 'Down Beak' },
    { src: 'images/nubbeak.png', rarity: 30, rarityName: 'uncommon', type: 'beak', displayName: 'Nub Beak' },
    { src: 'images/upbeak.png', rarity: 30, rarityName: 'uncommon', type: 'beak', displayName: 'Up Beak' },
    { src: 'images/yappybeak.png', rarity: 50, rarityName: 'rare', type: 'beak', displayName: 'Yappy Beak' },
    { src: 'images/bluescooter.png', rarity: 30, rarityName: 'uncommon', type: 'ride', displayName: 'Blue Scooter' },
    { src: 'images/blueskateboard.png', rarity: 5, rarityName: 'common', type: 'ride', displayName: 'Blue Skateboard' },
    { src: 'images/boat.png', rarity: 20, rarityName: 'uncommon', type: 'ride', displayName: 'Toy Boat' },
    { src: 'images/circuitboard.png', rarity: 20, rarityName: 'uncommon', type: 'ride', displayName: 'Circuit Board' },
    { src: 'images/discoscooter.png', rarity: 50, rarityName: 'rare', type: 'ride', displayName: 'Disco Scooter' },
    { src: 'images/duckboard.png', rarity: 500, rarityName: 'mythical', type: 'ride', displayName: 'Duckboard' },
    { src: 'images/fireworks.png', rarity: 150, rarityName: 'legendary', type: 'ride', displayName: 'Fireworks' },
    { src: 'images/keyboard.png', rarity: 200, rarityName: 'legendary', type: 'ride', displayName: 'Keyboard' },
    { src: 'images/orangeskateboard.png', rarity: 5, rarityName: 'common', type: 'ride', displayName: 'Orange Skateboard' },
    { src: 'images/rocketbooster.png', rarity: 5, rarityName: 'common', type: 'ride', displayName: 'Rocket Booster' },
    { src: 'images/scooper.png', rarity: 80, rarityName: 'very-rare', type: 'ride', displayName: 'Scooper' },
    { src: 'images/tank.png', rarity: 100, rarityName: 'very-rare', type: 'ride', displayName: 'Tank' },
    { src: 'images/bigfeet.png', rarity: 25, rarityName: 'uncommon', type: 'legs', displayName: 'Big Feet' },
    { src: 'images/oneleg.png', rarity: 60, rarityName: 'rare', type: 'legs', displayName: 'One Leg' },
    { src: 'images/pinlegs.png', rarity: 10, rarityName: 'common', type: 'legs', displayName: 'Pin Legs' },
    { src: 'images/skinnyfeet.png', rarity: 10, rarityName: 'common', type: 'legs', displayName: 'Skinny Feet' },
    { src: 'images/yellowlegs.png', rarity: 5, rarityName: 'common', type: 'legs', displayName: 'Yellow Legs' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'ride', displayName: 'No Ride' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'feathers', displayName: 'No Body' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'eyecolor', displayName: 'No Eye' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'beak', displayName: 'No Beak' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'wings', displayName: 'No Wing' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'legs', displayName: 'No Legs' },
];

const gameArea = document.getElementById('game-area');
const myDuckDisplay = document.getElementById('my-duck-display');
const saveToPondBtn = document.getElementById('save-to-pond-btn');
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

// NEW: Contact Elements
const showContactBtn = document.getElementById('show-contact-btn');
const contactSection = document.getElementById('contact-section');

// NEW: Welcome Popup Elements
const welcomeOverlay = document.getElementById('welcome-overlay');
const closeWelcomeBtn = document.getElementById('close-welcome-btn');

let lastFrameTime = 0;
let timeSinceLastSpawn = 0;
let devModeGuaranteedAccessories = false;
let devModeUnlocked = false;
// let myBaseDuck = null; // REMOVED: No longer a single element

// --- NEW: This is our duck counter ---
let duckSpawnCount = 0;

// --- MODIFIED: Renamed to 'renderMainDuck' - this is now the master render function ---
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
}
// --------------------------------------------------------

// ... (Rest of functions until createMarchingDuck) ...

function showWelcomePopup() {
    welcomeOverlay.classList.remove('hidden');
}

function closeWelcomePopup() {
    welcomeOverlay.classList.add('hidden');
    localStorage.setItem('hasVisited', 'true'); // Set flag so it doesn't show again
}

function openSettings() {
    settingsOverlay.classList.remove('hidden');
    settingsBtn.classList.add('is-rotated');
    settingsMainView.classList.remove('hidden');
    howToPlaySection.classList.add('hidden');
    resetSection.classList.add('hidden');
    contactSection.classList.add('hidden'); // NEW: Hide contact section on open

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
    if (confirm("Are you sure? This will reset your Pond and Gallery.")) {
        localStorage.removeItem('savedDucks');
        localStorage.removeItem('discoveredAccessories');
        localStorage.removeItem('hasVisited'); // Reset welcome flag too
        alert('Progress reset.');
        location.reload();
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
        alert("Incorrect Code.");
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
    alert('All accessories unlocked! Go to the Gallery to see them.');
}
function toggleMobileView() {
    document.body.classList.toggle('mobile-view');
    renderMainDuck(); // Re-render the duck
}
function trackDiscoveredAccessory(accessorySrc) {
    if (accessorySrc === undefined) return;
    let discovered = JSON.parse(localStorage.getItem('discoveredAccessories')) || [];
    // Handle null specifically for storage/retrieval
    const key = accessorySrc === null ? 'null' : accessorySrc;
    if (!discovered.includes(key)) {
        discovered.push(key);
        localStorage.setItem('discoveredAccessories', JSON.stringify(discovered));
    }
}

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

    // --- NEW: Logic for 2nd duck hat ---
    let shouldHaveAccessory = devModeGuaranteedAccessories || Math.floor(Math.random() * 7) < 3; // Standard 3/7 chance
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
        DUCK_SPEED_PX_PER_FRAME = isMobileView() ? 1.5 : 2;
        DUCK_SPAWN_RATE_MS = isMobileView() ? 5000 : 2000;
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
function resetDuck() {
    // Remove all accessories (placeholders)
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => el.remove());
    duckImageContainer.classList.remove('is-flipped');
    // Re-render the duck (which will now be just the base parts)
    renderMainDuck();
}
function saveDuckToPond() {
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

    const duckToSave = { name: "Unnamed Duck", look: currentLook, flipped: duckImageContainer.classList.contains('is-flipped'), savedDate: Date.now() };
    let savedLooks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    const isDuplicate = savedLooks.some(saved => JSON.stringify(saved.look) === JSON.stringify(duckToSave.look) && saved.flipped === duckToSave.flipped);
    if (!isDuplicate && savedLooks.length < POND_CAPACITY) {
        savedLooks.push(duckToSave);
        localStorage.setItem('savedDucks', JSON.stringify(savedLooks));
    } else if (savedLooks.length >= POND_CAPACITY) { alert("The Pond is full!"); return; }

    duckImageContainer.classList.add('is-leaving');
    setTimeout(() => {
        resetDuck(); // This now clears accessories AND renders the full base duck
        duckImageContainer.classList.remove('is-leaving');
        duckImageContainer.classList.add('is-entering');
        setTimeout(() => { duckImageContainer.classList.remove('is-entering'); }, 600);
    }, 600);
}
function loadDuckFromPond() {
    const duckJSON = sessionStorage.getItem('duckToLoad');
    if (!duckJSON) return;
    const duckToLoad = JSON.parse(duckJSON);

    resetDuck(); // Clear the current duck (accessories and base)

    if (duckToLoad.flipped) duckImageContainer.classList.add('is-flipped');

    // Add all accessories from the loaded duck
    for (const type in duckToLoad.look) {
        const src = duckToLoad.look[type]; // src can be null here
        const newAccessoryEl = document.createElement('div'); // Use div
        newAccessoryEl.setAttribute('data-type', type);
        // Store 'null' string if src is null
        newAccessoryEl.setAttribute('data-src', src === null ? 'null' : src);
        newAccessoryEl.className = 'accessory-image';
        newAccessoryEl.style.display = 'none'; // Hide placeholder
        duckImageContainer.appendChild(newAccessoryEl);
    }

    // Now, re-render the duck to apply replacements
    renderMainDuck();

    sessionStorage.removeItem('duckToLoad');
}

// Check if the element exists before adding an event listener to avoid errors on other pages
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.contains('hidden') ? openSettings() : closeSettings();
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
// NEW: Event listener for the contact button
if (showContactBtn) {
    showContactBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        contactSection.classList.remove('hidden');
    });
}
if (showResetBtn) {
    showResetBtn.addEventListener('click', () => {
        settingsMainView.classList.add('hidden');
        resetSection.classList.remove('hidden');
    });
}
if (settingsBackBtns) {
    settingsBackBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.add('hidden');
            settingsMainView.classList.remove('hidden');
        });
    });
}
if (resetGameBtn) {
    resetGameBtn.addEventListener('click', resetGame);
}
if (saveToPondBtn) {
    saveToPondBtn.addEventListener('click', saveDuckToPond);
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

// --- FIX: Dev speed input listeners now correctly update the global variables ---
if (devSpawnSpeedInput) {
    devSpawnSpeedInput.addEventListener('input', (e) => DUCK_SPAWN_RATE_MS = Number(e.target.value));
}
if (devDuckSpeedInput) {
    devDuckSpeedInput.addEventListener('input', (e) => DUCK_SPEED_PX_PER_FRAME = Number(e.target.value));
}
// --------------------------------------------------------------------------------

if (devUnlockAllBtn) {
    devUnlockAllBtn.addEventListener('click', unlockAllAccessories);
}
if (closeWelcomeBtn) {
    closeWelcomeBtn.addEventListener('click', closeWelcomePopup); // NEW listener
}


// This logic is for the main page (index.html) only
if (duckImageContainer) {
    document.addEventListener('DOMContentLoaded', () => {
        renderMainDuck(); // This will now create the 6-part blank duck
        loadDuckFromPond(); // This will load accessories AND re-render the duck

        // NEW: Check for first visit
        if (!localStorage.getItem('hasVisited')) {
            showWelcomePopup();
        }
    });
    requestAnimationFrame(gameLoop);
}