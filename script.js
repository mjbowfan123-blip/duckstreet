// A dynamic function to check for mobile view at any time
function isMobileView() {
    return document.body.classList.contains('mobile-view') || window.innerWidth <= 600;
}

// These are now set dynamically in the game loop
let DUCK_SPAWN_RATE_MS;
let DUCK_SPEED_PX_PER_FRAME;
const POND_CAPACITY = 50;

const ACCESSORIES = [
    { src: 'images/hat.png', rarity: 5, rarityName: 'common', type: 'hat' },
    { src: 'images/fez.png', rarity: 20, rarityName: 'uncommon', type: 'hat' },
    { src: 'images/saddle.png', rarity: 40, rarityName: 'rare', type: 'back' },
    { src: 'images/redeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/angryeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/happyeye.png', rarity: 6, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/noeye.png', rarity: 24, rarityName: 'uncommon', type: 'eyecolor' },
    { src: 'images/tealeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/yelloweye.png', rarity: 5, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/blueeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/lasereye.png', rarity: 200, rarityName: 'legendary', type: 'eyecolor' },
    { src: 'images/ghosteye.png', rarity: 60, rarityName: 'rare', type: 'eyecolor' },
    { src: 'images/eye2.png', rarity: 5, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/sunglasses.png', rarity: 20, rarityName: 'uncommon', type: 'eyecolor' },
    { src: 'images/forwardeye.png', rarity: 80, rarityName: 'very-rare', type: 'eyecolor' },
    { src: 'images/squareeye.png', rarity: 8, rarityName: 'common', type: 'eyecolor' },
    { src: 'images/bluehat.png', rarity: 7, rarityName: 'common', type: 'hat' },
    { src: 'images/pinkhat.png', rarity: 7, rarityName: 'common', type: 'hat' },
    { src: 'images/yellowhat.png', rarity: 7, rarityName: 'common', type: 'hat' },
    { src: 'images/redhat.png', rarity: 7, rarityName: 'common', type: 'hat' },
    { src: 'images/blackbandanahat.png', rarity: 30, rarityName: 'uncommon', type: 'hat' },
    { src: 'images/halohat.png', rarity: 150, rarityName: 'legendary', type: 'hat' },
    { src: 'images/partyhat.png', rarity: 25, rarityName: 'uncommon', type: 'hat' },
    { src: 'images/nailhat.png', rarity: 80, rarityName: 'very-rare', type: 'hat' },
    { src: 'images/nailback.png', rarity: 75, rarityName: 'very-rare', type: 'back' },
    { src: 'images/mutantback.png', rarity: 120, rarityName: 'legendary', type: 'back' },
    { src: 'images/umbrellaback.png', rarity: 35, rarityName: 'uncommon', type: 'back' },
    { src: 'images/bluebandwing.png', rarity: 15, rarityName: 'uncommon', type: 'wings' },
    { src: 'images/blackbandwing.png', rarity: 15, rarityName: 'uncommon', type: 'wings' },
    { src: 'images/goldbraceletwing.png', rarity: 50, rarityName: 'rare', type: 'wings' },
    { src: 'images/nowing.png', rarity: 5, rarityName: 'common', type: 'wings' },
    { src: 'images/mallardfeathers.png', rarity: 5, rarityName: 'common', type: 'feathers' },
    { src: 'images/checkerfeathers.png', rarity: 30, rarityName: 'uncommon', type: 'feathers' },
    { src: 'images/femalefeathers.png', rarity: 10, rarityName: 'common', type: 'feathers' },
    { src: 'images/darkpants.png', rarity: 20, rarityName: 'uncommon', type: 'pants' },
    { src: 'images/jeanspants.png', rarity: 20, rarityName: 'uncommon', type: 'pants' },
    { src: 'images/kahikipants.png', rarity: 20, rarityName: 'uncommon', type: 'pants' },
    { src: 'images/rainbowpants.png', rarity: 100, rarityName: 'very-rare', type: 'pants' },
    { src: 'images/freakduck.png', rarity: 500, rarityName: 'mythical', type: 'other' },
    { src: 'images/flip-effect.png', rarity: 200, rarityName: 'legendary', type: 'other', effect: 'flip' }
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
    duckImageContainer.appendChild(myBaseDuck);
}

function openSettings() {
    settingsOverlay.classList.remove('hidden');
    settingsBtn.classList.add('is-rotated');
    settingsMainView.classList.remove('hidden');
    howToPlaySection.classList.add('hidden');
    resetSection.classList.add('hidden');
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
        devSpawnSpeedInput.value = isMobileView() ? 5000 : 2000;
        devDuckSpeedInput.value = isMobileView() ? 1.5 : 2;
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

    // --- MODIFIED: Ducks are slightly lower than before (subtracted a smaller number) ---
    duck.style.top = isMobileView() ? 'calc(55vh - 250px)' : 'calc(55vh - 280px)';

    const duckImage = document.createElement('img');
    duckImage.src = 'images/duck.png';
    duckImage.style.width = '100%';
    duck.appendChild(duckImage);
    const shouldHaveAccessory = devModeGuaranteedAccessories || Math.floor(Math.random() * 7) < 3;
    if (shouldHaveAccessory) {
        const inverseWeights = ACCESSORIES.map(acc => ({ ...acc, weight: 1 / acc.rarity }));
        const totalInverseWeight = inverseWeights.reduce((sum, acc) => sum + acc.weight, 0);
        let randomWeight = Math.random() * totalInverseWeight;
        let selectedAccessory = null;
        for (const accessory of inverseWeights) {
            randomWeight -= accessory.weight;
            if (randomWeight < 0) {
                selectedAccessory = accessory;
                break;
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
                accessoryImage.style.zIndex = '1';
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
            duckImageContainer.querySelectorAll('img.accessory-image').forEach(acc => {
                if (acc.getAttribute('data-type') === collectedAccessoryType) acc.remove();
            });
            const newAccessory = document.createElement('img');
            newAccessory.src = collectedAccessorySrc;
            newAccessory.setAttribute('data-type', collectedAccessoryType);
            newAccessory.className = 'accessory-image';
            newAccessory.style.zIndex = '1';
            duckImageContainer.appendChild(newAccessory);
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

    DUCK_SPEED_PX_PER_FRAME = isMobileView() ? 1.5 : 2;
    DUCK_SPAWN_RATE_MS = isMobileView() ? 5000 : 2000;

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
    const duckToSave = { name: "Unnamed Duck", look: currentLook, flipped: duckImageContainer.classList.contains('is-flipped') };
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
        newAccessory.style.zIndex = '1';
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
if (devSpawnSpeedInput) {
    devSpawnSpeedInput.addEventListener('input', (e) => DUCK_SPAWN_RATE_MS = Number(e.target.value));
}
if (devDuckSpeedInput) {
    devDuckSpeedInput.addEventListener('input', (e) => DUCK_SPEED_PX_PER_FRAME = Number(e.target.value));
}
if (devUnlockAllBtn) {
    devUnlockAllBtn.addEventListener('click', unlockAllAccessories);
}

// This logic is for the main page (index.html) only
if (duckImageContainer) {
    document.addEventListener('DOMContentLoaded', () => {
        createBaseDuck();
        loadDuckFromPond();
    });
    requestAnimationFrame(gameLoop);
}