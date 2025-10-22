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

// --- FIX: Define a strict accessory layering order (z-index) ---
// Base Duck will implicitly be z-index 0
const LAYER_ORDER = {
    'ride': 5,        // NEW LOWEST LAYER
    'feathers': 10,
    'beak': 20,
    'eyecolor': 30,
    'hat': 40,
    'pants': 50,
    'wings': 60,
    'back': 70,
    'other': 80
};
// -------------------------------------------------------------

const ACCESSORIES = [
    { src: 'images/hat.png', rarity: 5, rarityName: 'common', type: 'hat', displayName: 'Top Hat' },
    { src: 'images/fez.png', rarity: 20, rarityName: 'uncommon', type: 'hat', displayName: 'Fez' },
    { src: 'images/saddle.png', rarity: 40, rarityName: 'rare', type: 'back', displayName: 'Saddle' },
    { src: 'images/redeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Red Eyes' },
    { src: 'images/angryeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Angry Eyes' },
    { src: 'images/happyeye.png', rarity: 6, rarityName: 'common', type: 'eyecolor', displayName: 'Happy Eyes' },
    { src: 'images/noeye.png', rarity: 24, rarityName: 'uncommon', type: 'eyecolor', displayName: 'No Eyes' },
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
    { src: 'images/nowing.png', rarity: 5, rarityName: 'common', type: 'wings', displayName: 'No Wings' },
    { src: 'images/mallardfeathers.png', rarity: 5, rarityName: 'common', type: 'feathers', displayName: 'Mallard Feathers' },
    { src: 'images/checkerfeathers.png', rarity: 30, rarityName: 'uncommon', type: 'feathers', displayName: 'Checker Feathers' },
    { src: 'images/femalefeathers.png', rarity: 10, rarityName: 'common', type: 'feathers', displayName: 'Female Feathers' },
    { src: 'images/darkpants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Dark Pants' },
    { src: 'images/jeanspants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Jeans' },
    { src: 'images/kahikipants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Khaki Pants' },
    { src: 'images/rainbowpants.png', rarity: 100, rarityName: 'very-rare', type: 'pants', displayName: 'Rainbow Pants' },
    { src: 'images/freakduck.png', rarity: 500, rarityName: 'mythical', type: 'other', displayName: 'Double Duck' },
    { src: 'images/flip-effect.png', rarity: 200, rarityName: 'legendary', type: 'other', effect: 'flip', displayName: 'Flip' },
    // --- BEAK ACCESSORIES ---
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
    // --- NEW RIDE ACCESSORIES ---
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
let myBaseDuck = null;

function createBaseDuck() {
    if (myBaseDuck) myBaseDuck.remove();
    myBaseDuck = document.createElement('img');
    myBaseDuck.src = 'images/duck.png';
    myBaseDuck.className = 'base-duck-image';
    myBaseDuck.style.zIndex = 0; // Explicitly set base duck z-index
    duckImageContainer.appendChild(myBaseDuck);
}

// NEW: Welcome Popup Functions
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
    localStorage.setItem('discoveredAccessories', JSON.stringify(allAccessorySrcs));
    alert('All accessories unlocked! Go to the Gallery to see them.');
}
function toggleMobileView() {
    document.body.classList.toggle('mobile-view');
    createBaseDuck();
    resetDuck();
}
function trackDiscoveredAccessory(accessorySrc) {
    let discovered = JSON.parse(localStorage.getItem('discoveredAccessories')) || [];
    if (!discovered.includes(accessorySrc)) {
        discovered.push(accessorySrc);
        localStorage.setItem('discoveredAccessories', JSON.stringify(discovered));
    }
}
function createMarchingDuck() {
    const duck = document.createElement('div');
    duck.className = 'marching-duck';
    duck.style.left = '-250px';
    // IMPORTANT: Set a high z-index for marching ducks so they are clickable
    duck.style.zIndex = 100;

    // --- MODIFIED: Made a much larger jump to raise the ducks higher on mobile ---
    duck.style.top = isMobileView() ? 'calc(55vh - 300px)' : 'calc(55vh - 280px)';

    const duckImage = document.createElement('img');
    duckImage.src = 'images/duck.png';
    duckImage.style.width = '100%';
    duck.appendChild(duckImage);
    const shouldHaveAccessory = devModeGuaranteedAccessories || Math.floor(Math.random() * 7) < 3;

    if (shouldHaveAccessory) {
        let selectedAccessory = null;

        if (devModeGuaranteedAccessories) {
            // --- FIX: When Guaranteed is ON, use equal weight (simple random selection) ---
            const availableAccessories = ACCESSORIES.filter(acc => acc.rarityName !== 'mythical'); // Optionally exclude mythical/flip
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
            if (selectedAccessory.effect === 'flip') {
                duck.style.transform = 'scaleX(-1)';
            } else {
                const accessoryImage = document.createElement('img');
                accessoryImage.src = selectedAccessory.src;
                accessoryImage.style.position = 'absolute';
                accessoryImage.style.width = '100%';
                accessoryImage.style.top = '0px';
                accessoryImage.style.left = '0px';
                // --- FIX: Apply controlled Z-Index based on accessory type ---
                accessoryImage.style.zIndex = LAYER_ORDER[selectedAccessory.type] || 5;
                // -------------------------------------------------------------
                duck.appendChild(accessoryImage);
            }
            duck.setAttribute('data-accessory', JSON.stringify(selectedAccessory));
        }
    }
    duck.addEventListener('click', function () {
        if (!duck.hasAttribute('data-accessory')) return;
        const accessoryData = JSON.parse(duck.getAttribute('data-accessory'));
        trackDiscoveredAccessory(accessoryData.src);
        if (accessoryData.effect) {
            if (accessoryData.effect === 'flip') {
                duckImageContainer.classList.add('is-flipped');
            }
            duck.removeAttribute('data-accessory');
            duck.style.transform = 'scaleX(1)';
        } else {
            const collectedAccessorySrc = accessoryData.src, collectedAccessoryType = accessoryData.type;

            // Remove any existing accessory of the same type
            duckImageContainer.querySelectorAll('img.accessory-image').forEach(acc => {
                if (acc.getAttribute('data-type') === collectedAccessoryType) acc.remove();
            });

            // Add the new accessory
            const newAccessory = document.createElement('img');
            newAccessory.src = collectedAccessorySrc;
            newAccessory.setAttribute('data-type', collectedAccessoryType);
            newAccessory.className = 'accessory-image';
            // --- FIX: Apply controlled Z-Index based on accessory type ---
            newAccessory.style.zIndex = LAYER_ORDER[collectedAccessoryType] || 5;
            // -------------------------------------------------------------
            duckImageContainer.appendChild(newAccessory);

            // Remove the accessory from the marching duck visually (leaving the base duck)
            duck.querySelector(`img[src="${collectedAccessorySrc}"]`)?.remove();
            duck.removeAttribute('data-accessory');
        }
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
    duckImageContainer.querySelectorAll('.accessory-image').forEach(el => el.remove());
    duckImageContainer.classList.remove('is-flipped');
}
function saveDuckToPond() {
    if (duckImageContainer.classList.contains('is-leaving')) return;
    let currentLook = {};
    duckImageContainer.querySelectorAll('.accessory-image').forEach(img => {
        const type = img.getAttribute('data-type'), src = img.getAttribute('src');
        if (type && src) currentLook[type] = src;
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
        resetDuck();
        duckImageContainer.classList.remove('is-leaving');
        duckImageContainer.classList.add('is-entering');
        setTimeout(() => { duckImageContainer.classList.remove('is-entering'); }, 600);
    }, 600);
}
function loadDuckFromPond() {
    const duckJSON = sessionStorage.getItem('duckToLoad');
    if (!duckJSON) return;
    const duckToLoad = JSON.parse(duckJSON);
    resetDuck();
    if (duckToLoad.flipped) duckImageContainer.classList.add('is-flipped');
    for (const type in duckToLoad.look) {
        const src = duckToLoad.look[type];
        const newAccessory = document.createElement('img');
        newAccessory.src = src;
        newAccessory.setAttribute('data-type', type);
        newAccessory.className = 'accessory-image';
        // --- FIX: Apply controlled Z-Index based on accessory type on load ---
        newAccessory.style.zIndex = LAYER_ORDER[type] || 5;
        // ---------------------------------------------------------------------
        duckImageContainer.appendChild(newAccessory);
    }
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
        createBaseDuck();
        loadDuckFromPond();

        // NEW: Check for first visit
        if (!localStorage.getItem('hasVisited')) {
            showWelcomePopup();
        }
    });
    requestAnimationFrame(gameLoop);
}