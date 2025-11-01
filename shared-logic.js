// --- COIN FUNCTIONS ---
function getCoins() {
    return parseInt(localStorage.getItem('userCoins') || '0', 10);
}

function saveCoins(amount) {
    localStorage.setItem('userCoins', amount.toString());
}

function addCoins(amount) {
    const currentCoins = getCoins();
    saveCoins(currentCoins + amount);
}

function displayCoinCount() {
    // Select all coin display elements on the page
    const coinDisplayAmount = document.querySelectorAll('#coin-display-amount');
    const coins = getCoins();
    // Update all coin displays on the page
    coinDisplayAmount.forEach(display => {
        if (display) {
            display.textContent = coins;
        }
    });
}
// --- END COIN FUNCTIONS ---

// --- WELCOME POPUP FUNCTIONS ---
function showWelcomePopup() {
    const welcomeOverlay = document.getElementById('welcome-overlay');
    if (welcomeOverlay) welcomeOverlay.classList.remove('hidden');
}
function closeWelcomePopup() {
    const welcomeOverlay = document.getElementById('welcome-overlay');
    if (welcomeOverlay) welcomeOverlay.classList.add('hidden');
    localStorage.setItem('hasVisited', 'true'); // Set flag so it doesn't show again

    // --- NEW: Grant initial sell charges ---
    if (localStorage.getItem('sellCharges') === null) {
        localStorage.setItem('sellCharges', MAX_SELL_CHARGES);
    }
    // --- END NEW ---
}
function showPondWelcomePopup() {
    const pondWelcomeOverlay = document.getElementById('pond-welcome-overlay');
    if (pondWelcomeOverlay) pondWelcomeOverlay.classList.remove('hidden');
}
function closePondWelcomePopup() {
    const pondWelcomeOverlay = document.getElementById('pond-welcome-overlay');
    if (pondWelcomeOverlay) pondWelcomeOverlay.classList.add('hidden');
    localStorage.setItem('hasVisitedPond', 'true'); // Set flag
}
function showGalleryWelcomePopup() {
    const galleryWelcomeOverlay = document.getElementById('gallery-welcome-overlay');
    if (galleryWelcomeOverlay) galleryWelcomeOverlay.classList.remove('hidden');
}
function closeGalleryWelcomePopup() {
    const galleryWelcomeOverlay = document.getElementById('gallery-welcome-overlay');
    if (galleryWelcomeOverlay) galleryWelcomeOverlay.classList.add('hidden');
    localStorage.setItem('hasVisitedGallery', 'true'); // Set flag
}
// --- END WELCOME POPUPS ---

// --- NEW: NOTICE POPUP FUNCTIONS ---
/**
 * Displays a custom modal popup instead of an alert.
 * @param {string} message - The text to display in the popup.
 * @param {string} [title="Notice"] - The title for the popup (optional).
 */
function showNotice(message, title = "Notice") {
    const noticeOverlay = document.getElementById('notice-overlay');
    const noticeTitle = document.getElementById('notice-title');
    const noticeText = document.getElementById('notice-text');

    if (!noticeOverlay || !noticeTitle || !noticeText) {
        // Fallback just in case (e.g., gallery page)
        alert(message);
        return;
    }

    noticeTitle.textContent = title;
    noticeText.textContent = message;
    noticeOverlay.classList.remove('hidden');
}

function closeNotice() {
    const noticeOverlay = document.getElementById('notice-overlay');
    if (noticeOverlay) {
        noticeOverlay.classList.add('hidden');
    }
}
// --- END NOTICE POPUP FUNCTIONS ---

// --- MASTER STATS CALCULATION FUNCTION ---
// This function calculates rating, set bonuses, AND detailed stats for display
// It works for both pond ducks (full objects) and the main page duck (look object)
function calculateDuckStats(duck) {
    let totalRating = 0;
    const accessoryStats = {};
    // Handle main page duck (which is {look: {...}}) or pond duck ({name: ..., look: {...}})
    const duckLook = duck.look || {};

    for (const type in duckLook) {
        const accessorySrc = duckLook[type]; // Can be null
        // Match type *and* src to correctly identify null accessories
        const accessoryDetails = ACCESSORIES.find(item => item.src === accessorySrc && item.type === type);

        if (accessoryDetails) {
            const rarity = accessoryDetails.rarity;
            totalRating += rarity;

            // Format display type (e.g., 'eyecolor' -> 'Eyes')
            let displayType = type.charAt(0).toUpperCase() + type.slice(1);
            if (type === 'eyecolor') displayType = 'Eyes';
            else if (type === 'beak') displayType = 'Beaks';
            else if (type === 'ride') displayType = 'Rides';
            else if (type === 'body') displayType = 'Body';
            else if (type === 'wings') displayType = 'Wings';
            else if (type === 'pants') displayType = 'Pants';
            else if (type === 'hat') displayType = 'Hats';
            else if (type === 'legs') displayType = 'Legs';
            else if (type === 'other') displayType = 'Other';

            accessoryStats[displayType] = {
                rarity: rarity,
                name: accessoryDetails.displayName
            };
        }
    }

    // --- CALCULATE SET BONUSES ---
    let setBonus = 0;
    const setsCompleted = [];
    const wornItemNames = Object.values(accessoryStats).map(stat => stat.name);

    FASHION_SETS.forEach(set => {
        const hasAllItems = set.items.every(setItemName => wornItemNames.includes(setItemName));
        if (hasAllItems) {
            setsCompleted.push(set.setName);
            setBonus += set.bonus;
        }
    });

    totalRating += setBonus; // Add set bonus to the final rating
    // --- END SET BONUSES ---

    // Ensure all categories defined in LAYER_ORDER are present for stats display
    Object.keys(LAYER_ORDER).forEach(type => {
        let displayType = type.charAt(0).toUpperCase() + type.slice(1);
        if (type === 'eyecolor') displayType = 'Eyes';
        else if (type === 'beak') displayType = 'Beaks';
        else if (type === 'ride') displayType = 'Rides';
        else if (type === 'body') displayType = 'Body';
        else if (type === 'wings') displayType = 'Wings';
        else if (type === 'pants') displayType = 'Pants';
        else if (type === 'hat') displayType = 'Hats';
        else if (type === 'legs') displayType = 'Legs';
        else if (type === 'other') displayType = 'Other';

        if (!accessoryStats[displayType]) {
            // Find default base part name if applicable
            const basePart = BASE_DUCK_PARTS.find(p => p.type === type);
            accessoryStats[displayType] = { rarity: 0, name: basePart ? 'Default' : 'None' };
        }
    });

    return {
        ...duck, // Pass along original duck info (name, savedDate, etc.)
        rating: totalRating,
        accessoryStats: accessoryStats,
        setsCompleted: setsCompleted,
        setBonus: setBonus
    };
}
// --- END MASTER FUNCTION ---

// --- MASTER PAGE INITIALIZATION FUNCTION ---
// Runs on every page to handle cookies and welcome popups
function initializePage() {
    // 1. Handle Cookie Consent (runs on all pages)
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const cookieAcceptBtn = document.getElementById('cookie-consent-accept-btn');
    if (cookieBanner && cookieAcceptBtn) {
        if (!localStorage.getItem('hasGivenCookieConsent')) {
            cookieBanner.classList.remove('hidden');
        }
        cookieAcceptBtn.addEventListener('click', () => {
            cookieBanner.classList.add('hidden');
            localStorage.setItem('hasGivenCookieConsent', 'true');
        });
    }

    // 2. Handle Welcome Popups (checks which page it's on)
    if (document.getElementById('welcome-overlay')) { // Main page
        if (!localStorage.getItem('hasVisited')) {
            showWelcomePopup();
        }
    } else if (document.getElementById('pond-welcome-overlay')) { // Pond page
        if (!localStorage.getItem('hasVisitedPond')) {
            showPondWelcomePopup();
        }
    } else if (document.getElementById('gallery-welcome-overlay')) { // Gallery page
        if (!localStorage.getItem('hasVisitedGallery')) {
            showGalleryWelcomePopup();
        }
    }
}
// --- END MASTER FUNCTION ---

// --- GLOBAL EVENT LISTENERS ---

// Master listener that runs on every page
document.addEventListener('DOMContentLoaded', () => {
    displayCoinCount(); // Update coins on every page
    initializePage();   // Run cookie and welcome logic for the current page
});

// Welcome popup button listeners
const closeWelcomeBtn = document.getElementById('close-welcome-btn');
if (closeWelcomeBtn) {
    closeWelcomeBtn.addEventListener('click', closeWelcomePopup);
}

const closePondWelcomeBtn = document.getElementById('close-pond-welcome-btn');
if (closePondWelcomeBtn) {
    closePondWelcomeBtn.addEventListener('click', closePondWelcomePopup);
}

const closeGalleryWelcomeBtn = document.getElementById('close-gallery-welcome-btn');
if (closeGalleryWelcomeBtn) {
    closeGalleryWelcomeBtn.addEventListener('click', closeGalleryWelcomePopup);
}

// --- NEW: Notice popup listener ---
const closeNoticeBtn = document.getElementById('close-notice-btn');
if (closeNoticeBtn) {
    closeNoticeBtn.addEventListener('click', closeNotice);
}