document.addEventListener('DOMContentLoaded', function () {
    const galleryContainer = document.getElementById('gallery-container');
    const discovered = JSON.parse(localStorage.getItem('discoveredAccessories')) || [];
    // The check for mysteryModeEnabled has been DELETED

    const accessoriesByType = ACCESSORIES.reduce((acc, item) => {
        if (item.src) {
            const type = item.type || 'unknown';
            if (!acc[type]) { acc[type] = []; }
            acc[type].push(item);
        }
        return acc;
    }, {});

    for (const type in accessoriesByType) {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';

        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.classList.add('is-collapsed');

        let formattedTitle;
        if (type === 'other') { formattedTitle = 'Other'; }
        // --- MODIFIED: Handle already plural types like 'wings', 'feathers', 'pants' and new type 'beak' ---
        else if (type.endsWith('s')) { formattedTitle = type.charAt(0).toUpperCase() + type.slice(1); }
        else if (type === 'beak') { formattedTitle = 'Beaks'; }
        // -----------------------------------------------------------------------------
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

            if (accessory.effect && accessory.effect === 'flip') {
                const flippedDuckImage = document.createElement('img');
                flippedDuckImage.src = 'images/duck.png';
                flippedDuckImage.className = 'accessory-image is-flipped-gallery';
                if (!isDiscovered) {
                    flippedDuckImage.classList.add('undiscovered');
                }
                imageWrapper.appendChild(flippedDuckImage);
                name.textContent = isDiscovered ? accessory.displayName : '???'; // MODIFIED: Use displayName

            } else {
                const baseDuckImage = document.createElement('img');
                baseDuckImage.src = 'images/duck.png';
                baseDuckImage.className = 'accessory-image';
                imageWrapper.appendChild(baseDuckImage);

                const accessoryImage = document.createElement('img');
                accessoryImage.src = accessory.src;
                accessoryImage.className = 'accessory-image';
                imageWrapper.appendChild(accessoryImage);

                if (isDiscovered) {
                    name.textContent = accessory.displayName || 'Unnamed'; // MODIFIED: Use displayName
                } else {
                    // --- CHANGED: This is now the default behavior ---
                    baseDuckImage.classList.add('undiscovered');
                    accessoryImage.classList.add('undiscovered');
                    name.textContent = '???';
                }
            }

            if (!isDiscovered) {
                const tooltip = document.createElement('div');
                tooltip.className = 'rarity-tooltip';
                tooltip.textContent = `1 in ${accessory.rarity}`;
                imageWrapper.appendChild(tooltip);
            }

            itemContainer.appendChild(imageWrapper);
            itemContainer.appendChild(name);
            grid.appendChild(itemContainer);
        });

        categorySection.appendChild(grid);
        galleryContainer.appendChild(categorySection);
    }
});