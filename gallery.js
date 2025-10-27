document.addEventListener('DOMContentLoaded', function () {
    // --- NEW: GALLERY WELCOME POPUP LOGIC ---
    const galleryWelcomeOverlay = document.getElementById('gallery-welcome-overlay');
    const closeGalleryWelcomeBtn = document.getElementById('close-gallery-welcome-btn');

    function showGalleryWelcomePopup() {
        if (galleryWelcomeOverlay) galleryWelcomeOverlay.classList.remove('hidden');
    }

    function closeGalleryWelcomePopup() {
        if (galleryWelcomeOverlay) galleryWelcomeOverlay.classList.add('hidden');
        localStorage.setItem('hasVisitedGallery', 'true'); // Set flag so it doesn't show again
    }

    if (closeGalleryWelcomeBtn) {
        closeGalleryWelcomeBtn.addEventListener('click', closeGalleryWelcomePopup);
    }

    // Check for first gallery visit
    if (!localStorage.getItem('hasVisitedGallery')) {
        showGalleryWelcomePopup();
    }
    // --- END NEW LOGIC ---


    const galleryContainer = document.getElementById('gallery-container');
    // --- MODIFIED: Handle 'null' string from storage ---
    const discoveredStored = JSON.parse(localStorage.getItem('discoveredAccessories')) || [];
    const discovered = discoveredStored.map(item => item === 'null' ? null : item);
    // --- END MODIFIED ---

    const accessoriesByType = ACCESSORIES.reduce((acc, item) => {
        // Allow null src items
        if (item.type !== undefined) { // Check if type exists instead of src
            const type = item.type || 'unknown';
            if (!acc[type]) { acc[type] = []; }
            acc[type].push(item);
        }
        return acc;
    }, {});

    // --- FIX: Define the custom display order including 'legs' ---
    const customDisplayOrder = [
        'hat',
        'eyecolor',
        'beak',
        // 'legs', // Position legs correctly if needed, or keep it later
        'wings',
        'feathers',
        'back',
        'pants',
        'ride',
        'legs', // Added legs here, adjust order as desired
        'other'
    ];
    // ------------------------------------------------------------------------------------------------------

    // 1. Filter the custom order list to only include types that actually have accessories
    const finalOrderedTypes = customDisplayOrder.filter(type => accessoriesByType.hasOwnProperty(type));

    // Use the finalOrderedTypes array for iteration
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
        else if (type === 'legs') { formattedTitle = 'Legs'; } // Add Legs title
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

            // --- MODIFIED: Build the gallery duck using the new render logic ---

            // 1. Create a "look" for this duck
            let galleryLook = {};
            let isFlipped = false;

            if (accessory.effect && accessory.effect === 'flip') {
                isFlipped = true;
                name.textContent = isDiscovered ? accessory.displayName : '???';
                // Add flip effect to look so it's tracked
                galleryLook[accessory.type] = accessory.src;
            } else {
                // Use accessory.src (can be null)
                galleryLook[accessory.type] = accessory.src;
                name.textContent = isDiscovered ? accessory.displayName || 'Unnamed' : '???';
            }

            // 2. Fill in with default base parts
            let imagesToRender = { ...galleryLook };
            BASE_DUCK_PARTS.forEach(part => {
                // *** Corrected Check ***
                // Only add default if the type isn't already set (even if set to null)
                if (!(part.type in imagesToRender)) {
                    imagesToRender[part.type] = part.src;
                }
            });
            // --- END FIX ---

            // 3. Create a sorted list of parts to render
            let renderList = [];
            for (const type in imagesToRender) {
                renderList.push({
                    src: imagesToRender[type],
                    zIndex: LAYER_ORDER[type] === undefined ? 0 : LAYER_ORDER[type],
                    isAccessory: galleryLook[type] === imagesToRender[type]
                });
            }
            renderList.sort((a, b) => a.zIndex - b.zIndex);

            // 4. Append images in sorted order
            renderList.forEach(item => {
                // --- Skip rendering if src is null OR if it's the flip effect image ---
                if (item.src === null || item.src === 'images/flip-effect.png') {
                    return;
                }
                // --- END ---

                const img = document.createElement('img');
                img.src = item.src;
                img.className = 'accessory-image'; // Use the same class for all

                if (isFlipped) {
                    img.classList.add('is-flipped-gallery');
                }

                // --- FIX: If the accessory is not discovered, grey out ALL parts ---
                if (!isDiscovered) {
                    img.classList.add('undiscovered');
                }
                // --- END FIX ---

                imageWrapper.appendChild(img);
            });
            // ---------------------------------------------------------


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
});