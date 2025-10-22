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
// filterBySelect is removed

let currentlySelectedDuckIndex = null;
let allDucksWithRatings = []; // Store ducks with pre-calculated ratings

// --- UTILITY ---

// Pre-calculate the Fashion Rating and accessory stats for each duck
function calculateDuckStats(duck) {
    let totalRating = 0;
    const accessoryStats = {};

    for (const type in duck.look) {
        const accessorySrc = duck.look[type]; // Can be null
        const accessoryDetails = ACCESSORIES.find(item => item.src === accessorySrc && item.type === type); // Match type too for nulls

        if (accessoryDetails) {
            const rarity = accessoryDetails.rarity;
            totalRating += rarity;

            // Format display type
            let displayType = type.charAt(0).toUpperCase() + type.slice(1);
            if (type === 'eyecolor') displayType = 'Eyes';
            else if (type === 'beak') displayType = 'Beaks';
            else if (type === 'ride') displayType = 'Rides';
            else if (type === 'feathers') displayType = 'Feathers';
            else if (type === 'back') displayType = 'Backs';
            else if (type === 'wings') displayType = 'Wings';
            else if (type === 'pants') displayType = 'Pants';
            else if (type === 'hat') displayType = 'Hats';
            else if (type === 'legs') displayType = 'Legs'; // Add legs
            else if (type === 'other') displayType = 'Other';

            accessoryStats[displayType] = {
                rarity: rarity,
                name: accessoryDetails.displayName
            };
        }
    }

    // Ensure all categories defined in LAYER_ORDER are present for stats display
    Object.keys(LAYER_ORDER).forEach(type => {
        let displayType = type.charAt(0).toUpperCase() + type.slice(1);
        if (type === 'eyecolor') displayType = 'Eyes';
        else if (type === 'beak') displayType = 'Beaks';
        else if (type === 'ride') displayType = 'Rides';
        else if (type === 'feathers') displayType = 'Feathers';
        else if (type === 'back') displayType = 'Backs';
        else if (type === 'wings') displayType = 'Wings';
        else if (type === 'pants') displayType = 'Pants';
        else if (type === 'hat') displayType = 'Hats';
        else if (type === 'legs') displayType = 'Legs'; // Add legs
        else if (type === 'other') displayType = 'Other';

        if (!accessoryStats[displayType]) {
            // Find default base part name if applicable
            const basePart = BASE_DUCK_PARTS.find(p => p.type === type);
            accessoryStats[displayType] = { rarity: 0, name: basePart ? 'Default' : 'None' }; // Show 'Default' for base types
        }
    });


    return {
        ...duck,
        rating: totalRating,
        accessoryStats: accessoryStats
    };
}

// --- FILTER & SORT LOGIC ---

// populateFilterOptions removed

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

function openDuckPopup(savedDate) {
    const savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];

    // FIX: Retrieve the duck object using the unique ID (savedDate)
    const duckToDisplay = savedDucks.find(d => d.savedDate === savedDate);
    if (!duckToDisplay) return;

    // FIX: Find the actual index of the duck in the original array for mutation (naming/deleting)
    currentlySelectedDuckIndex = savedDucks.findIndex(d => d.savedDate === savedDate);

    // Use the duck with pre-calculated stats
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

    // --- FUNCTION MOVED HERE ---
    // Helper function to map display names back to internal types
    const mapType = (displayType) => {
        if (displayType === 'Eyes') return 'eyecolor';
        if (displayType === 'Beaks') return 'beak';
        if (displayType === 'Rides') return 'ride';
        if (displayType === 'Feathers') return 'feathers';
        if (displayType === 'Backs') return 'back';
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
        const isBaseType = ['Rides', 'Feathers', 'Eyes', 'Beaks', 'Legs', 'Wings'].includes(displayType);
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

    popupOverlay.classList.remove('hidden'); // This line should execute now
}

function closeDuckPopup() {
    popupOverlay.classList.add('hidden');
    currentlySelectedDuckIndex = null;
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

function loadSelectedDuck() {
    if (currentlySelectedDuckIndex === null) return;
    const savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    const duckToLoad = savedDucks[currentlySelectedDuckIndex];

    sessionStorage.setItem('duckToLoad', JSON.stringify(duckToLoad));
    window.location.href = 'index.html';
}

function deleteSelectedDuck() {
    if (currentlySelectedDuckIndex === null) return;
    let savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    savedDucks.splice(currentlySelectedDuckIndex, 1);
    localStorage.setItem('savedDucks', JSON.stringify(savedDucks));
    closeDuckPopup();
    displayPondDucks();
}

// --- EVENT LISTENERS ---
closePopupBtn.addEventListener('click', closeDuckPopup);
loadDuckBtn.addEventListener('click', loadSelectedDuck);
deleteDuckBtn.addEventListener('click', deleteSelectedDuck);
duckNameInput.addEventListener('input', saveDuckName);

// NEW: Add event listener for sorting
sortBySelect.addEventListener('change', displayPondDucks);


// --- ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // populateFilterOptions removed
    displayPondDucks();
});