// --- ELEMENTS ---
const pondContainer = document.getElementById('pond-container');
const popupOverlay = document.getElementById('duck-popup-overlay');
const closePopupBtn = document.getElementById('close-popup-btn');
const enlargedDuckDisplay = document.getElementById('enlarged-duck-display');
const loadDuckBtn = document.getElementById('load-duck-btn');
const deleteDuckBtn = document.getElementById('delete-duck-btn');
const duckNameInput = document.getElementById('duck-name-input');
const fashionRatingText = document.getElementById('fashion-rating-text'); // NEW element

let currentlySelectedDuckIndex = null;

// --- CORE FUNCTIONS ---

function displayPondDucks() {
    pondContainer.innerHTML = '';
    const savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];

    if (savedDucks.length === 0) {
        const message = document.createElement('h2');
        message.textContent = 'Aw Ducks! Your Pond is Empty!';
        message.style.textShadow = '2px 2px #000';
        pondContainer.appendChild(message);
        return;
    }

    savedDucks.forEach((savedDuck, index) => {
        const duckContainer = document.createElement('div');
        duckContainer.className = 'pond-duck-container';

        const nameTag = document.createElement('div');
        nameTag.className = 'duck-name-tag';
        if (savedDuck.name && savedDuck.name !== "Unnamed Duck") {
            nameTag.textContent = savedDuck.name;
        }

        const duckWrapper = document.createElement('div');
        duckWrapper.className = 'saved-duck-wrapper';
        if (savedDuck.flipped) {
            duckWrapper.classList.add('is-flipped');
        }

        const baseDuckImg = document.createElement('img');
        baseDuckImg.src = 'images/duck.png';
        baseDuckImg.style.zIndex = 0; // Base Duck Layer
        duckWrapper.appendChild(baseDuckImg);

        for (const type in savedDuck.look) {
            const src = savedDuck.look[type];
            const accessoryImg = document.createElement('img');
            accessoryImg.src = src;

            // --- FIX: Apply controlled Z-Index based on accessory type ---
            // Use the global LAYER_ORDER map from script.js
            accessoryImg.style.zIndex = LAYER_ORDER[type] || 5;
            // -------------------------------------------------------------

            duckWrapper.appendChild(accessoryImg);
        }

        duckWrapper.addEventListener('click', () => {
            openDuckPopup(index);
        });

        duckContainer.appendChild(nameTag);
        duckContainer.appendChild(duckWrapper);
        pondContainer.appendChild(duckContainer);
    });
}

function openDuckPopup(index) {
    const savedDucks = JSON.parse(localStorage.getItem('savedDucks')) || [];
    const savedDuck = savedDucks[index];
    if (!savedDuck) return;

    currentlySelectedDuckIndex = index;
    enlargedDuckDisplay.innerHTML = '';

    duckNameInput.value = savedDuck.name || "Unnamed Duck";

    if (savedDuck.flipped) {
        enlargedDuckDisplay.classList.add('is-flipped');
    } else {
        enlargedDuckDisplay.classList.remove('is-flipped');
    }

    // --- NEW: Calculate and display Fashion Rating ---
    let totalRating = 0;
    // We can use the global ACCESSORIES variable because we loaded script.js
    for (const type in savedDuck.look) {
        const accessorySrc = savedDuck.look[type];
        // Find the matching accessory in our master list
        const accessoryDetails = ACCESSORIES.find(item => item.src === accessorySrc);
        if (accessoryDetails) {
            totalRating += accessoryDetails.rarity;
        }
    }
    fashionRatingText.textContent = "Fashion Rating: " + totalRating;
    // --- End of new logic ---

    const baseDuckImg = document.createElement('img');
    baseDuckImg.src = 'images/duck.png';
    baseDuckImg.style.zIndex = 0; // Base Duck Layer
    enlargedDuckDisplay.appendChild(baseDuckImg);

    for (const type in savedDuck.look) {
        const src = savedDuck.look[type];
        const accessoryImg = document.createElement('img');
        accessoryImg.src = src;

        // --- FIX: Apply controlled Z-Index based on accessory type ---
        accessoryImg.style.zIndex = LAYER_ORDER[type] || 5;
        // -------------------------------------------------------------

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

// --- ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', displayPondDucks);