// --- ELEMENTS ---
const pondContainer = document.getElementById('pond-container');
const popupOverlay = document.getElementById('duck-popup-overlay');
const closePopupBtn = document.getElementById('close-popup-btn');
const enlargedDuckDisplay = document.getElementById('enlarged-duck-display');
const loadDuckBtn = document.getElementById('load-duck-btn');
const deleteDuckBtn = document.getElementById('delete-duck-btn');
const duckNameInput = document.getElementById('duck-name-input');
const fashionRatingText = document.getElementById('fashion-rating-text');
const detailedStatsContainer = document.getElementById('detailed-stats-container');
const sortBySelect = document.getElementById('sort-by');
const sellDuckPopupBtn = document.getElementById('sell-duck-btn-popup');
// --- NEW: The text below the sell button ---
const sellChargeDisplayPopup = document.getElementById('sell-charge-display-popup');

let currentlySelectedDuckIndex = null;
let allDucksWithRatings = []; // Store ducks with pre-calculated ratings
let pondSellTimerInterval = null; // --- MODIFIED: For the sell CHARGE timer ---

// --- UTILITY ---
// calculateDuckStats() is in shared-logic.js
// Welcome functions are in shared-logic.js


// --- FILTER & SORT LOGIC ---

function getSortedDucks() {
    let ducks = [...allDucksWithRatings];
    const sortValue = sortBySelect.value;

    // 1. Sorting
    ducks.sort((a, b) => {
        if (sortValue === 'rating-desc') return b.rating - a.rating;
        if (sortValue === 'rating-asc') return a.rating - b.rating;

        // Dates are stored as numbers if set
        if (sortValue === 'date-desc') return (b.savedDate || 0) - (a.savedDate || 0);
        if (sortValue === 'date-asc') return (a.savedDate || 0) - (b.savedDate || 0);

        // Name sorting
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        if (sortValue === 'name-asc') {
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
        }
        return 0;
    });

    return ducks;
}

// --- CORE FUNCTIONS ---

function displayPondDucks() {
    pondContainer.innerHTML = '';
    let savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];


    // --- MODIFIED: Calls the global calculateDuckStats from script.js ---
    allDucksWithRatings = savedDucks.map(calculateDuckStats);

    const ducksToDisplay = getSortedDucks(); // Filter step removed

    if (ducksToDisplay.length === 0) {
        const message = document.createElement('h2');
        message.textContent = 'Aw Ducks! Your Pond is Empty!';
        message.style.textShadow = '2px 2px #000';
        pondContainer.appendChild(message);
        return;
    }

    ducksToDisplay.forEach((duck, index) => {
        const duckContainer = document.createElement('div');
        duckContainer.className = 'pond-duck-container';

        const nameTag = document.createElement('div');
        nameTag.className = 'duck-name-tag';
        nameTag.textContent = duck.name || "Unnamed Duck";

        const duckWrapper = document.createElement('div');
        duckWrapper.className = 'saved-duck-wrapper';
        if (duck.flipped) {
            duckWrapper.classList.add('is-flipped');
        }

        // --- MODIFIED: Build the full duck using the new render logic ---

        // 1. Start with accessories
        let imagesToRender = { ...duck.look };

        // 2. Fill in with default base parts
        BASE_DUCK_PARTS.forEach(part => {
            if (!(part.type in imagesToRender)) { // Check if type exists as key
                imagesToRender[part.type] = part.src;
            }
        });

        // 3. Render all images with correct z-index
        for (const type in imagesToRender) {
            const src = imagesToRender[type];

            // --- Skip rendering if src is null OR if it's the flip effect image ---
            if (src === null || src === 'images/flip-effect.png') {
                continue;
            }
            // --- END ---

            const img = document.createElement('img');
            img.src = src;
            img.style.zIndex = LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type];
            duckWrapper.appendChild(img);
        }
        // ---------------------------------------------

        // We no longer rely on a pre-calculated index from the loop, we use the duck's unique date
        duckWrapper.addEventListener('click', () => {
            openDuckPopup(duck.savedDate); // Pass the unique date as ID
        });

        duckContainer.appendChild(nameTag);
        duckContainer.appendChild(duckWrapper);
        pondContainer.appendChild(duckContainer);
    });
}

// --- NEW: Function to handle Tab navigation ---
function handlePopupKeydown(e) {
    if (e.key === 'Tab') {
        e.preventDefault(); // Stop the browser's default tabbing

        // 1. Get the currently sorted list of ducks
        const sortedDucks = getSortedDucks();
        if (sortedDucks.length <= 1) return; // Don't do anything if there's only one duck

        // 2. Get the currently open duck's savedDate
        const savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
        const currentDuck = savedDucks[currentlySelectedDuckIndex];
        if (!currentDuck) return; // Safety check
        const currentSavedDate = currentDuck.savedDate;

        // 3. Find the index of this duck *in the sorted list*
        const sortedIndex = sortedDucks.findIndex(d => d.savedDate === currentSavedDate);

        // 4. Calculate the next index (with wraparound)
        let nextSortedIndex = sortedIndex + 1;
        if (nextSortedIndex >= sortedDucks.length) {
            nextSortedIndex = 0; // Wrap around to the beginning
        }

        // 5. Get the next duck's data
        const nextDuck = sortedDucks[nextSortedIndex];

        // 6. Close the current popup and open the next one
        // We call them in a timeout to prevent any weird focus issues
        setTimeout(() => {
            closeDuckPopup();
            openDuckPopup(nextDuck.savedDate);
        }, 0);
    }
}
// --- END NEW FUNCTION ---

function openDuckPopup(savedDate) {
    const savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];

    // FIX: Retrieve the duck object using the unique ID (savedDate)
    const duckToDisplay = savedDucks.find(d => d.savedDate === savedDate);
    if (!duckToDisplay) return;

    // FIX: Find the actual index of the duck in the original array for mutation (naming/deleting)
    currentlySelectedDuckIndex = savedDucks.findIndex(d => d.savedDate === savedDate);

    // --- MODIFIED: Calls the global calculateDuckStats from script.js ---
    const duckStats = calculateDuckStats(duckToDisplay);

    enlargedDuckDisplay.innerHTML = '';
    detailedStatsContainer.innerHTML = ''; // Clear previous stats

    duckNameInput.value = duckStats.name || "Unnamed Duck";

    if (duckStats.flipped) { // Check the original duck object for flip status
        enlargedDuckDisplay.classList.add('is-flipped');
    } else {
        enlargedDuckDisplay.classList.remove('is-flipped');
    }

    // 1. Display Total Rating
    fashionRatingText.textContent = "Fashion Rating: " + duckStats.rating;

    // --- MODIFIED: Value is now set by checkPondSellCharges() ---
    // const sellValue = Math.ceil(duckStats.rating / 5);
    // sellDuckPopupBtn.innerHTML = `Sell ${sellValue}<img src="images/coin.png">`;
    // --- END MODIFICATION ---

    // --- FUNCTION MOVED HERE ---
    // Helper function to map display names back to internal types
    const mapType = (displayType) => {
        if (displayType === 'Eyes') return 'eyecolor';
        if (displayType === 'Beaks') return 'beak';
        if (displayType === 'Rides') return 'ride';
        if (displayType === 'Body') return 'body';
        if (displayType === 'Wings') return 'wings';
        if (displayType === 'Pants') return 'pants';
        if (displayType === 'Hats') return 'hat';
        if (displayType === 'Legs') return 'legs';
        if (displayType === 'Other') return 'other';
        return displayType.toLowerCase(); // Fallback
    };
    // --- END MOVED FUNCTION ---

    // 2. Display Detailed Stats (Rarity Breakdown)

    // Sort accessory stats by LAYER_ORDER
    const sortedTypes = Object.keys(duckStats.accessoryStats).sort((a, b) => {
        const keyA = mapType(a); // Now mapType is available
        const keyB = mapType(b); // Now mapType is available

        // Handle cases where a type might not be in LAYER_ORDER (though it should be)
        const zIndexA = LAYER_ORDER[keyA] === undefined ? 99 : LAYER_ORDER[keyA];
        const zIndexB = LAYER_ORDER[keyB] === undefined ? 99 : LAYER_ORDER[keyB];

        return zIndexA - zIndexB;
    });


    sortedTypes.forEach(displayType => {
        const stat = duckStats.accessoryStats[displayType];

        // Only show if it contributes a score OR if it's a 'Default'/'None' for a base part type
        const isBaseType = ['Rides', 'Body', 'Eyes', 'Beaks', 'Legs', 'Wings'].includes(displayType);
        // Don't show 'None' if it's not a base type AND not 'Other'
        if (stat.rarity === 0 && !isBaseType && displayType !== 'Other') return;
        // Don't show 'Other' if it has no score
        if (displayType === 'Other' && stat.rarity === 0) return;


        const statDiv = document.createElement('div');

        // Determine rarity name for color coding (match type as well for null src items)
        const accessoryDetails = ACCESSORIES.find(item => item.displayName === stat.name && item.type === mapType(displayType)); // Use mapType here too
        const rarityName = accessoryDetails ? accessoryDetails.rarityName : (stat.rarity > 0 ? 'unknown' : 'common');


        statDiv.innerHTML = `<strong>${displayType}:</strong> ${stat.name} <span class="rarity-${rarityName}">(${stat.rarity})</span>`;
        detailedStatsContainer.appendChild(statDiv);
    });


    // 3. Display Duck Image
    // --- MODIFIED: Build the full duck using the new render logic ---

    // 1. Start with accessories
    let imagesToRender = { ...duckToDisplay.look };

    // 2. Fill in with default base parts
    BASE_DUCK_PARTS.forEach(part => {
        if (!(part.type in imagesToRender)) { // Check if type exists as key
            imagesToRender[part.type] = part.src;
        }
    });

    // 3. Render all images with correct z-index
    for (const type in imagesToRender) {
        const src = imagesToRender[type];

        // --- Skip rendering if src is null OR if it's the flip effect image ---
        if (src === null || src === 'images/flip-effect.png') {
            continue;
        }
        // --- END ---

        const img = document.createElement('img');
        img.src = src;
        img.style.zIndex = LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type];
        enlargedDuckDisplay.appendChild(img);
    }
    // ---------------------------------------------

    // --- NEW: Add keydown listener for Tab navigation ---
    document.addEventListener('keydown', handlePopupKeydown);
    // --- END NEW ---

    // --- NEW: Display Set Bonuses ---
    if (duckStats.setsCompleted.length > 0) {
        // Find all set details from the master list
        const completedSetDetails = FASHION_SETS.filter(set => duckStats.setsCompleted.includes(set.setName));

        // Sort by bonus, highest to lowest
        completedSetDetails.sort((a, b) => b.bonus - a.bonus);

        // Create a header for the bonus section
        const bonusHeader = document.createElement('div');
        bonusHeader.className = 'set-bonus-header'; // New class for styling
        bonusHeader.textContent = "--- Set Bonuses ---";
        detailedStatsContainer.appendChild(bonusHeader);

        completedSetDetails.forEach(set => {
            const coinBonus = Math.ceil(set.bonus / 4);
            const bonusDiv = document.createElement('div');
            bonusDiv.className = 'set-bonus-line'; // New class for styling
            bonusDiv.innerHTML = `
                <strong>${set.setName}:</strong> 
                <span class="rarity-${set.bonus >= 5000 ? 'mythical' : 'legendary'}">
                    +${coinBonus}<img src="images/coin.png" class="set-bonus-coin-pond">
                </span>
            `;
            detailedStatsContainer.appendChild(bonusDiv);
        });
    }
    // --- END NEW ---

    popupOverlay.classList.remove('hidden'); // This line should execute now

    // --- MODIFIED: Start cooldown timer ---
    checkPondSellCharges(); // Run once to set initial state
    if (pondSellTimerInterval) clearInterval(pondSellTimerInterval); // Clear any old timer
    // Start timer only if not full
    let charges = parseInt(localStorage.getItem('sellCharges') || '0');
    if (charges < MAX_SELL_CHARGES) {
        pondSellTimerInterval = setInterval(checkPondSellCharges, 1000);
    }
    // --- END MODIFICATION ---
}

function closeDuckPopup() {
    popupOverlay.classList.add('hidden');
    currentlySelectedDuckIndex = null;

    // --- NEW: Remove keydown listener when popup closes ---
    document.removeEventListener('keydown', handlePopupKeydown);
    // --- END NEW ---

    // --- NEW: Stop cooldown timer ---
    if (pondSellTimerInterval) clearInterval(pondSellTimerInterval);
    pondSellTimerInterval = null;
    // --- END NEW ---
}

function saveDuckName() {
    if (currentlySelectedDuckIndex === null) return;
    let savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    const newName = duckNameInput.value;

    if (savedDucks[currentlySelectedDuckIndex]) {
        savedDucks[currentlySelectedDuckIndex].name = newName;
    }
    localStorage.setItem('savedDucks', JSON.stringify(savedDucks));
    displayPondDucks();
}

// --- === THIS ENTIRE FUNCTION IS MODIFIED === ---
function loadSelectedDuck() {
    if (currentlySelectedDuckIndex === null) return;

    // 1. Get all saved ducks
    let savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];

    // 2. Get the duck to load
    const duckToLoad = savedDucks[currentlySelectedDuckIndex];

    // 3. Store it in sessionStorage for the main page
    sessionStorage.setItem('duckToLoad', JSON.stringify(duckToLoad));

    // 4. --- NEW: Remove the duck from the array ---
    savedDucks.splice(currentlySelectedDuckIndex, 1);

    // 5. --- NEW: Save the updated (smaller) array ---
    localStorage.setItem('savedDucks', JSON.stringify(savedDucks));

    // 6. Go to the main page
    window.location.href = 'index.html';
}
// --- === END MODIFICATION === ---

function deleteSelectedDuck() {
    if (currentlySelectedDuckIndex === null) return;
    let savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    savedDucks.splice(currentlySelectedDuckIndex, 1);
    localStorage.setItem('savedDucks', JSON.stringify(savedDucks));
    closeDuckPopup();
    displayPondDucks();
}

// --- === THIS ENTIRE FUNCTION IS MODIFIED === ---
// --- === THIS ENTIRE FUNCTION IS MODIFIED === ---
function sellSelectedDuck() {
    // 1. Check if we have charges
    let charges = parseInt(localStorage.getItem('sellCharges') || '0');
    if (charges <= 0) {
        // --- MODIFIED: Silenced alert ---
        return;
    }

    if (currentlySelectedDuckIndex === null) return;

    // 2. Get the ducks
    let savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    const duckToSell = savedDucks[currentlySelectedDuckIndex];

    // 3. Calculate its stats and rating
    const duckStats = calculateDuckStats(duckToSell);
    const rating = duckStats.rating;

    // 4. Calculate coins (1/3rd of rating, rounded up)
    // --- MODIFIED: Use the sell price multiplier AND 1/3 RATING ---
    const coinsToAdd = Math.ceil((rating / 3) * SELL_PRICE_MULTIPLIER);
    // --- END MODIFICATION ---

    // 5. --- MOVED ---

    // 6. Use one sell charge
    charges--;
    localStorage.setItem('sellCharges', charges);

    // 7. Start recharge timer if it's not already running
    const nextChargeTime = parseInt(localStorage.getItem('nextSellChargeTime') || '0');
    if (charges === (MAX_SELL_CHARGES - 1) && nextChargeTime === 0) { // Check if we just used the 5th charge
        // This was the 5th sell (or first time), so start the timer
        localStorage.setItem('nextSellChargeTime', Date.now() + SELL_CHARGE_REGEN_MS);
    }

    // 8. Start the 1-second checker interval
    checkPondSellCharges(); // Run immediately to update UI
    if (!pondSellTimerInterval) { // Start timer if it's not running
        pondSellTimerInterval = setInterval(checkPondSellCharges, 1000);
    }

    // 9. Delete the duck
    savedDucks.splice(currentlySelectedDuckIndex, 1);
    localStorage.setItem('savedDucks', JSON.stringify(savedDucks));

    // 10. Close popup and refresh pond
    closeDuckPopup();
    displayPondDucks();

    // --- NEW: Add coins and update display after 1.5 seconds ---
    setTimeout(() => {
        addCoins(coinsToAdd);
        displayCoinCount();
    }, 1500); // 1500ms = 1.5 seconds
}

// --- === THIS ENTIRE FUNCTION IS REWRITTEN === ---
// --- === THIS ENTIRE FUNCTION IS REWRITTEN === ---
function checkPondSellCharges() {
    if (!sellDuckPopupBtn || !sellChargeDisplayPopup) return; // Make sure elements exist
    const now = Date.now();

    // --- NEW: Calculate current duck value (USING 1/3) ---
    let sellValue = 0;
    let savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    if (currentlySelectedDuckIndex !== null && savedDucks[currentlySelectedDuckIndex]) {
        const currentDuck = savedDucks[currentlySelectedDuckIndex];
        const duckStats = calculateDuckStats(currentDuck);
        sellValue = Math.ceil(duckStats.rating / 3);
    }
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
    sellDuckPopupBtn.innerHTML = `Sell ${sellValue}<img src="images/coin.png">`;

    if (charges > 0) {
        // We HAVE charges
        sellDuckPopupBtn.classList.remove('is-disabled');
        // --- MODIFIED: Show charges in span ---
        sellChargeDisplayPopup.textContent = `(${charges}/${MAX_SELL_CHARGES}) Sells Left`;

        // If we are full, stop the timer
        if (charges === MAX_SELL_CHARGES && pondSellTimerInterval) {
            clearInterval(pondSellTimerInterval);
            pondSellTimerInterval = null;
            localStorage.removeItem('nextSellChargeTime'); // Clean up
        }
    } else {
        // We have NO charges
        sellDuckPopupBtn.classList.add('is-disabled');
        const msRemaining = parseInt(localStorage.getItem('nextSellChargeTime') || '0') - now;

        if (msRemaining > 0) {
            const minutes = Math.floor(msRemaining / 60000);
            const seconds = Math.floor((msRemaining % 60000) / 1000);
            // --- MODIFIED: Show timer in span ---
            sellChargeDisplayPopup.textContent = `(${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')})`;
        } else {
            // Cooldown is done, but the tick hasn't run.
            // --- MODIFIED: Show "Recharging" in span ---
            sellChargeDisplayPopup.textContent = "Recharging...";
        }
    }
}
// --- === END REWRITE === ---
// --- === END REWRITE === ---


// --- EVENT LISTENERS ---
if (closePopupBtn) {
    closePopupBtn.addEventListener('click', closeDuckPopup);
}
if (loadDuckBtn) {
    loadDuckBtn.addEventListener('click', loadSelectedDuck);
}
if (deleteDuckBtn) {
    deleteDuckBtn.addEventListener('click', deleteSelectedDuck);
}
if (sellDuckPopupBtn) {
    sellDuckPopupBtn.addEventListener('click', sellSelectedDuck);
}


if (duckNameInput) {
    duckNameInput.addEventListener('input', saveDuckName);

    // --- NEW: Add keydown listener for Enter key ---
    duckNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop it from adding a newline or submitting a form
            duckNameInput.blur(); // "Leave the text box" by removing focus
        }
    });
    // --- END NEW ---
}
if (sortBySelect) {
    // NEW: Add event listener for sorting
    sortBySelect.addEventListener('change', displayPondDucks);
}

// --- ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // Master DOMContentLoaded in shared-logic.js handles coins and popups
    displayPondDucks();
});