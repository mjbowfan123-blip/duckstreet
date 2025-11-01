// --- REMOVED: Redundant Coin Functions ---
// getCoins, saveCoins, addCoins, and displayCoinCount
// are now all loaded from script.js, which runs first.
// --- END REMOVED ---

document.addEventListener('DOMContentLoaded', function () {

    // --- REMOVED: displayCoinCount() ---
    // Now handled by the master 'DOMContentLoaded' in script.js

    // --- TAB ELEMENTS ---
    const showItemsTab = document.getElementById('show-items-tab');
    const showSetsTab = document.getElementById('show-sets-tab');
    const galleryContainer = document.getElementById('gallery-container');
    const setsContainer = document.getElementById('sets-container');

    // --- REMOVED: Welcome & Cookie Elements ---
    // All these elements are now handled in script.js

    // --- DISCOVERED ITEMS ---
    const discoveredStored = JSON.parse(localStorage.getItem('discoveredAccessories')) || [];
    const discovered = discoveredStored.map(item => item === 'null' ? null : item);

    // --- NEW: JUST DISCOVERED ITEMS ---
    const justDiscoveredStored = sessionStorage.getItem('justDiscoveredItems') || '[]';
    const justDiscovered = JSON.parse(justDiscoveredStored);

    // --- NEW: Flag for tab notification ---
    let hasAnyNewSetItem = false;

    // Find all accessories by their displayName for easy lookup
    const accessoriesByName = ACCESSORIES.reduce((acc, item) => {
        acc[item.displayName] = item;
        return acc;
    }, {});

    // --- TAB SWITCHING LOGIC ---
    if (showItemsTab) {
        showItemsTab.addEventListener('click', () => {
            showItemsTab.classList.add('active');
            showSetsTab.classList.remove('active');
            galleryContainer.classList.remove('hidden');
            setsContainer.classList.add('hidden');
        });
    }
    if (showSetsTab) {
        showSetsTab.addEventListener('click', () => {
            showSetsTab.classList.add('active');
            showItemsTab.classList.remove('active');
            setsContainer.classList.remove('hidden');
            galleryContainer.classList.add('hidden');

            // --- NEW: Remove tab indicator on click ---
            const indicator = document.getElementById('sets-tab-indicator');
            if (indicator) {
                indicator.remove();
            }
            // --- END NEW ---
        });
    }

    // --- REMOVED: WELCOME & COOKIE LOGIC ---
    // All this logic is now in initializePage() in script.js
    // --- END REMOVED ---


    // --- MODIFIED FUNCTION: RENDER SETS ---
    function renderFashionSets() {
        // Clear any existing content except the H1
        const h1 = setsContainer.querySelector('h1');
        setsContainer.innerHTML = '';
        if (h1) setsContainer.appendChild(h1);

        FASHION_SETS.forEach(set => {
            const setCard = document.createElement('div');
            setCard.className = 'set-card';

            let allDiscovered = true;
            let hasNewItem = false; // Flag for card "!" indicator

            const setItemList = document.createElement('ul');
            setItemList.classList.add('is-collapsed'); // Start as collapsed

            set.items.forEach(itemName => {
                const accessory = accessoriesByName[itemName];
                const li = document.createElement('li');

                if (accessory) {
                    const srcKey = accessory.src === null ? 'null' : accessory.src;
                    const isDiscovered = discovered.includes(srcKey);

                    // Check for "just discovered" items
                    if (justDiscovered.includes(srcKey)) {
                        hasNewItem = true;
                        hasAnyNewSetItem = true; // --- NEW: Set the master flag ---
                    }

                    if (isDiscovered) {
                        li.textContent = itemName; // Show the name if discovered
                        li.classList.add('discovered');
                    } else {
                        li.textContent = "???"; // Show "???" if not discovered
                        allDiscovered = false;
                    }

                } else {
                    li.textContent = `${itemName} (Item Error)`;
                    li.style.color = "red";
                    allDiscovered = false;
                }
                setItemList.appendChild(li);
            });

            // --- NEW: Add coin bonus as the last item in the list ---
            const coinBonus = Math.ceil(set.bonus / 4);
            const bonusLi = document.createElement('li');
            bonusLi.classList.add('set-bonus-item'); // New class for styling
            bonusLi.innerHTML = `Set Bonus: +${coinBonus}<img src="images/coin.png" class="set-bonus-coin">`;

            // --- MODIFIED: Always add the bonus li ---
            setItemList.appendChild(bonusLi);

            // --- NEW: If set is not complete, grey out the bonus text ---
            if (!allDiscovered) {
                bonusLi.classList.add('undiscovered');
            }
            // --- END NEW ---



            // Assign rarity border based on set bonus
            if (set.bonus >= 5000) setCard.classList.add('rarity-mythical');
            else if (set.bonus >= 1500) setCard.classList.add('rarity-legendary');
            else if (set.bonus >= 1000) setCard.classList.add('rarity-very-rare');
            else if (set.bonus >= 300) setCard.classList.add('rarity-rare');
            else setCard.classList.add('rarity-uncommon');


            const setTitle = document.createElement('h3');
            setTitle.classList.add('is-collapsed'); // For the arrow
            
            // --- MODIFICATION: Bonus removed from title ---
            setTitle.innerHTML = `${set.setName}`;
            // --- END MODIFICATION ---


            // Add "!" indicator to card if a new item was found
            let newIndicator = null;

            // Add click listener for collapsible AND to hide card "!"
            setTitle.addEventListener('click', () => {
                setTitle.classList.toggle('is-collapsed');
                setItemList.classList.toggle('is-collapsed');

                // Find and hide the card's "!" indicator on click
                const indicator = setCard.querySelector('.new-set-indicator');
                if (indicator) {
                    indicator.style.display = 'none';
                }
            });

            if (!allDiscovered) {
                setTitle.style.color = '#AAA'; // Grey out title if not complete
                setCard.classList.add('rarity-common'); // Use common border if not complete
                setCard.classList.remove('rarity-mythical', 'rarity-legendary', 'rarity-very-rare', 'rarity-rare', 'rarity-uncommon');
            }

            setCard.appendChild(setTitle); // Add the title to the card
            setCard.appendChild(setItemList); // Add the item list to the card
            setsContainer.appendChild(setCard); // Add the card to the page
        });
    }

    // --- NEW FUNCTION: RENDER ITEMS (Original logic moved here) ---
    function renderItemsGallery() {
        // Clear any existing content except the H1
        const h1 = galleryContainer.querySelector('h1');
        galleryContainer.innerHTML = '';
        if (h1) galleryContainer.appendChild(h1);

        const accessoriesByType = ACCESSORIES.reduce((acc, item) => {
            if (item.type !== undefined) {
                const type = item.type || 'unknown';
                if (!acc[type]) { acc[type] = []; }
                acc[type].push(item);
            }
            return acc;
        }, {});

        const customDisplayOrder = [
            'hat',
            'eyecolor',
            'beak',
            'wings',
            'body',
            'pants',
            'ride',
            'legs',
            'other'
        ];

        const finalOrderedTypes = customDisplayOrder.filter(type => accessoriesByType.hasOwnProperty(type));

        finalOrderedTypes.forEach(type => {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';

            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.classList.add('is-collapsed');

            let formattedTitle;
            if (type === 'other') { formattedTitle = 'Other'; }
            else if (type === 'ride') { formattedTitle = 'Rides'; }
            else if (type === 'eyecolor') { formattedTitle = 'Eyes'; }
            else if (type === 'body') { formattedTitle = 'Body'; }
            else if (type === 'legs') { formattedTitle = 'Legs'; }
            else if (type.endsWith('s')) { formattedTitle = type.charAt(0).toUpperCase() + type.slice(1); }
            else if (type === 'beak') { formattedTitle = 'Beaks'; }
            else { formattedTitle = type.charAt(0).toUpperCase() + type.slice(1) + "s"; }
            categoryTitle.textContent = formattedTitle;


            categoryTitle.addEventListener('click', function () {
                this.classList.toggle('is-collapsed');
                const grid = this.nextElementSibling;
                if (grid) { grid.classList.toggle('is-collapsed'); }
            });

            categorySection.appendChild(categoryTitle);

            const grid = document.createElement('div');
            grid.className = 'accessory-grid';
            grid.classList.add('is-collapsed');

            accessoriesByType[type].sort((a, b) => {
                const aIsDiscovered = discovered.includes(a.src);
                const bIsDiscovered = discovered.includes(b.src);
                if (aIsDiscovered && !bIsDiscovered) return -1;
                if (!aIsDiscovered && bIsDiscovered) return 1;
                return a.rarity - b.rarity;
            });

            accessoriesByType[type].forEach(accessory => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'accessory-item';

                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'accessory-image-wrapper';

                if (accessory.rarityName) {
                    imageWrapper.classList.add(`rarity-${accessory.rarityName}`);
                }

                const name = document.createElement('div');
                name.className = 'accessory-name';

                const isDiscovered = discovered.includes(accessory.src);

                let galleryLook = {};
                let isFlipped = false;

                if (accessory.effect && accessory.effect === 'flip') {
                    isFlipped = true;
                    name.textContent = isDiscovered ? accessory.displayName : '???';
                    galleryLook[accessory.type] = accessory.src;
                } else {
                    galleryLook[accessory.type] = accessory.src;
                    name.textContent = isDiscovered ? accessory.displayName || 'Unnamed' : '???';
                }

                let imagesToRender = { ...galleryLook };
                BASE_DUCK_PARTS.forEach(part => {
                    if (!(part.type in imagesToRender)) {
                        imagesToRender[part.type] = part.src;
                    }
                });

                let renderList = [];
                for (const type in imagesToRender) {
                    renderList.push({
                        src: imagesToRender[type],
                        zIndex: LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type],
                        isAccessory: galleryLook[type] === imagesToRender[type]
                    });
                }
                renderList.sort((a, b) => a.zIndex - b.zIndex);

                renderList.forEach(item => {
                    if (item.src === null || item.src === 'images/flip-effect.png') {
                        return;
                    }
                    const img = document.createElement('img');
                    img.src = item.src;
                    img.className = 'accessory-image';
                    if (isFlipped) {
                        img.classList.add('is-flipped-gallery');
                    }
                    if (!isDiscovered) {
                        img.classList.add('undiscovered');
                    }
                    imageWrapper.appendChild(img);
                });

                const tooltip = document.createElement('div');
                tooltip.className = 'rarity-tooltip';
                tooltip.textContent = `1 in ${accessory.rarity}`;
                imageWrapper.appendChild(tooltip);

                itemContainer.appendChild(imageWrapper);
                itemContainer.appendChild(name);
                grid.appendChild(itemContainer);
            });

            categorySection.appendChild(grid);
            galleryContainer.appendChild(categorySection);
        });
    }

    // --- INITIALIZE ---
    renderItemsGallery();
    renderFashionSets();

    // --- NEW: Add "!" to Sets Tab if any set is new ---
    if (hasAnyNewSetItem) {
        if (showSetsTab) {
            // Create the indicator span
            const newIndicator = document.createElement('span');
            newIndicator.className = 'tab-new-indicator'; // New style
            newIndicator.textContent = ' !';

            // Add an ID to make it easy to remove
            newIndicator.id = 'sets-tab-indicator';

            showSetsTab.appendChild(newIndicator);
        }
    }
    // --- END NEW ---


    // --- Clear the "just discovered" flag after rendering ---
    sessionStorage.removeItem('justDiscoveredItems');
});