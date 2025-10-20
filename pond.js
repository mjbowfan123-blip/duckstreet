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
        const accessorySrc = duck.look[type];
        const accessoryDetails = ACCESSORIES.find(item => item.src === accessorySrc);

        if (accessoryDetails) {
            const rarity = accessoryDetails.rarity;
            totalRating += rarity;

            // Rename 'eyecolor' to 'Eyes' and format type
            const displayType = type === 'eyecolor' ? 'Eyes' :
                type === 'beak' ? 'Beaks' :
                    type.charAt(0).toUpperCase() + type.slice(1) + (type.endsWith('s') || type === 'other' ? '' : 's');

            accessoryStats[displayType] = {
                rarity: rarity,
                name: accessoryDetails.displayName
            };
        }
    }

    // Ensure all categories are present for the detailed stats display
    const allCategories = Object.keys(LAYER_ORDER);
    allCategories.forEach(type => {
        const displayType = type === 'eyecolor' ? 'Eyes' :
            type === 'beak' ? 'Beaks' :
                type.charAt(0).toUpperCase() + type.slice(1) + (type.endsWith('s') || type === 'other' ? '' : 's');
        if (!accessoryStats[displayType]) {
            accessoryStats[displayType] = { rarity: 0, name: 'None' };
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

        const baseDuckImg = document.createElement('img');
        baseDuckImg.src = 'images/duck.png';
        baseDuckImg.style.zIndex = 0; // Base Duck Layer
        duckWrapper.appendChild(baseDuckImg);

        for (const type in duck.look) {
            const src = duck.look[type];
            const accessoryImg = document.createElement('img');
            accessoryImg.src = src;

            // Use the global LAYER_ORDER map from script.js
            accessoryImg.style.zIndex = LAYER_ORDER[type] || 5;

            duckWrapper.appendChild(accessoryImg);
        }

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

    if (duckStats.flipped) {
        enlargedDuckDisplay.classList.add('is-flipped');
    } else {
        enlargedDuckDisplay.classList.remove('is-flipped');
    }

    // 1. Display Total Rating
    fashionRatingText.textContent = "Fashion Rating: " + duckStats.rating;

    // 2. Display Detailed Stats (Rarity Breakdown)

    // Sort accessory stats by LAYER_ORDER (hats first, rides last)
    const sortedTypes = Object.keys(duckStats.accessoryStats).sort((a, b) => {
        // Reverse mapping of display name to original type key
        const mapType = (displayType) => {
            if (displayType === 'Eyes') return 'eyecolor';
            if (displayType === 'Beaks') return 'beak';
            if (displayType === 'Rides') return 'ride';
            if (displayType === 'Feathers') return 'feathers';
            if (displayType === 'Backs') return 'back';
            if (displayType === 'Wings') return 'wings';
            if (displayType === 'Pants') return 'pants';
            if (displayType === 'Hats') return 'hat';
            return displayType.toLowerCase();
        };

        const keyA = mapType(a);
        const keyB = mapType(b);

        return (LAYER_ORDER[keyA] || 99) - (LAYER_ORDER[keyB] || 99);
    });


    sortedTypes.forEach(displayType => {
        const stat = duckStats.accessoryStats[displayType];

        // Only show 'Other' if it contributes a score (i.e., Double Duck or Flip)
        if (displayType === 'Other' && stat.rarity === 0) return;

        const statDiv = document.createElement('div');

        // Determine rarity name for color coding
        const accessoryDetails = ACCESSORIES.find(item => item.displayName === stat.name && item.rarity === stat.rarity);
        const rarityName = accessoryDetails ? accessoryDetails.rarityName : (stat.rarity > 0 ? 'unknown' : 'common');

        statDiv.innerHTML = `<strong>${displayType}:</strong> ${stat.name} <span class="rarity-${rarityName}">(${stat.rarity})</span>`;
        detailedStatsContainer.appendChild(statDiv);
    });


    // 3. Display Duck Image
    const baseDuckImg = document.createElement('img');
    baseDuckImg.src = 'images/duck.png';
    baseDuckImg.style.zIndex = 0; // Base Duck Layer
    enlargedDuckDisplay.appendChild(baseDuckImg);

    for (const type in duckToDisplay.look) {
        const src = duckToDisplay.look[type];
        const accessoryImg = document.createElement('img');
        accessoryImg.src = src;

        // Apply controlled Z-Index
        accessoryImg.style.zIndex = LAYER_ORDER[type] || 5;

        enlargedDuckDisplay.appendChild(accessoryImg);
    }

    popupOverlay.classList.remove('hidden');
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