// A dynamic function to check for mobile view at any time
// MOVED HERE to break the circular dependency.
function isMobileView() {
    return document.body.classList.contains('mobile-view') || window.innerWidth <= 600;
}

// --- NEW: UPGRADE CONFIGS ---
// Speed Upgrade REMOVED


const SPAWN_UPGRADE_BASE_COST = 800;
const SPAWN_UPGRADE_COST_SCALING = 1.8;
const SPAWN_UPGRADE_BONUS_MS = 150;      // Bonus = level * 150ms
const SPAWN_MIN_RATE_MS = 500;           // The fastest spawn rate allowed

const ACCESSORY_UPGRADE_BASE_COST = 1200;
const ACCESSORY_UPGRADE_COST_SCALING = 1.9;
const ACCESSORY_UPGRADE_BONUS = 0.02;    // +2% chance per level
const ACCESSORY_CHANCE_CAP = 0.90;       // Max 90% chance

const SELL_UPGRADE_BASE_COST = 1500;
const SELL_UPGRADE_COST_SCALING = 2.0;   // Doubles each time
const SELL_UPGRADE_BONUS = 0.10;         // +10% sell value per level
// --- END UPGRADE CONFIGS ---

// --- NEW: SELL CHARGE CONFIGS ---
const SELL_CHARGE_REGEN_MS = 3 * 60 * 1000; // 3 minutes
const MAX_SELL_CHARGES = 5;
// --- END SELL CHARGE CONFIGS ---


// --- GAME CONFIG SETTINGS ---
// These are now global settings.

// --- MODIFIED: Read from localStorage to calculate game variables ---
// Speed Level REMOVED
let spawnLvl = parseInt(localStorage.getItem('spawnLevel') || '0');
let accessoryLvl = parseInt(localStorage.getItem('accessoryLevel') || '0');
let sellLvl = parseInt(localStorage.getItem('sellLevel') || '0');


// DUCK_SPEED_PX_PER_FRAME REMOVED (it's now fixed)
const DUCK_SPEED_PX_PER_FRAME = (isMobileView() ? 1.5 : 2); // Fixed speed
let DUCK_SPAWN_RATE_MS = Math.max(SPAWN_MIN_RATE_MS, (isMobileView() ? 5000 : 2000) - (spawnLvl * SPAWN_UPGRADE_BONUS_MS));
let BASE_ACCESSORY_CHANCE = Math.min(ACCESSORY_CHANCE_CAP, 0.50 + (accessoryLvl * ACCESSORY_UPGRADE_BONUS)); // Base 50% + bonus
let SELL_PRICE_MULTIPLIER = 1 + (sellLvl * SELL_UPGRADE_BONUS); // 1.0 + (level * 0.10)
// --- END MODIFICATION ---

const POND_CAPACITY = 1000;
// -------------------------------------------------------------------------------


// --- MODIFIED: This is now the SINGLE SOURCE OF TRUTH for all layering ---
// Accessories (e.g., 'ride') and base parts (e.g., 'legs') all
// get their z-index from this one object.
const LAYER_ORDER = {
    // Base Duck Slots (Replaced by accessories of the same type)
    'ride': 0,       // Replaced by 'ride' accessories
    'body': 1,       // Replaced by 'body' accessories (WAS 'feathers')
    'eyecolor': 2,   // Replaced by 'eyecolor' accessories
    'beak': 3,       // Replaced by 'beak' accessories
    'legs': 4,       // Replaced by 'legs' accessories (NEW)

    // Additive Layers (Stack on top)
    'pants': 5,      // Stacks on top of 'body' (z:1)
    'wings': 6,      // Replaced by 'wings' accessories
    // 'back': 7,    // <-- REMOVED THIS CATEGORY
    'hat': 8,        // Stacks on top
    'other': 9       // Stacks on top (Includes flip effect marker)
};
// -------------------------------------------------------------

// --- MODIFIED: This list now just maps a TYPE to its DEFAULT image ---
// The z-index is now controlled by LAYER_ORDER.
const BASE_DUCK_PARTS = [
    { type: 'ride', src: 'images/baseduck/BOARD.png' },
    { type: 'body', src: 'images/baseduck/BODY.png' }, // WAS 'feathers'
    { type: 'eyecolor', src: 'images/baseduck/EYE.png' },
    { type: 'beak', src: 'images/baseduck/BEAK.png' },
    { type: 'legs', src: 'images/baseduck/LEGS.png' },
    { type: 'wings', src: 'images/baseduck/WING.png' }
];
// -------------------------------------------------------------


const ACCESSORIES = [
    // ... (All your accessories remain the same) ...
    { src: 'images/hat.png', rarity: 5, rarityName: 'common', type: 'hat', displayName: 'Top Hat' },
    { src: 'images/fez.png', rarity: 20, rarityName: 'uncommon', type: 'hat', displayName: 'Fez' },
    { src: 'images/hatstretchy.png', rarity: 25, rarityName: 'uncommon', type: 'hat', displayName: 'Stretchy Hat' },
    // { src: 'images/saddle.png', rarity: 40, rarityName: 'rare', type: 'back', displayName: 'Saddle' }, // <-- DELETED
    { src: 'images/redeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Red Eyes' },
    { src: 'images/angryeye.png', rarity: 5, rarityName: 'common', type: 'eyecolor', displayName: 'Angry Eyes' },
    { src: 'images/happyeye.png', rarity: 6, rarityName: 'common', type: 'eyecolor', displayName: 'Happy Eyes' },
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

    // --- MOVED 'back' items to 'wings' ---
    { src: 'images/nailback.png', rarity: 75, rarityName: 'very-rare', type: 'wings', displayName: 'Nail Back' },
    { src: 'images/mutantback.png', rarity: 120, rarityName: 'legendary', type: 'wings', displayName: 'Mutant Back' },
    { src: 'images/umbrellaback.png', rarity: 35, rarityName: 'uncommon', type: 'wings', displayName: 'Umbrella' },
    // --- END MOVED SECTION ---

    { src: 'images/bluebandwing.png', rarity: 15, rarityName: 'uncommon', type: 'wings', displayName: 'Blue Bands' },
    { src: 'images/blackbandwing.png', rarity: 15, rarityName: 'uncommon', type: 'wings', displayName: 'Black Bands' },
    { src: 'images/goldbraceletwing.png', rarity: 50, rarityName: 'rare', type: 'wings', displayName: 'Gold Bracelets' },

    // --- RENAMED 'feathers' to 'body' and changed displayNames ---
    { src: 'images/mallardfeathers.png', rarity: 5, rarityName: 'common', type: 'body', displayName: 'Mallard' },
    { src: 'images/bodyfishbowl.png', rarity: 80, rarityName: 'very-rare', type: 'body', displayName: 'Fishbowl' },
    { src: 'images/checkerfeathers.png', rarity: 30, rarityName: 'uncommon', type: 'body', displayName: 'Checker' },
    { src: 'images/femalefeathers.png', rarity: 10, rarityName: 'common', type: 'body', displayName: 'Female' },
    { src: 'images/bluefeathers.png', rarity: 10, rarityName: 'common', type: 'body', displayName: 'Blue' },
    { src: 'images/redfeathers.png', rarity: 10, rarityName: 'common', type: 'body', displayName: 'Red' },
    { src: 'images/sodafeathers.png', rarity: 50, rarityName: 'rare', type: 'body', displayName: 'Soda' },
    { src: 'images/yellowfeathers.png', rarity: 10, rarityName: 'common', type: 'body', displayName: 'Yellow' },
    // --- END RENAMED SECTION ---

    { src: 'images/darkpants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Dark Pants' },
    { src: 'images/jeanspants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Jeans' },
    { src: 'images/kahikipants.png', rarity: 20, rarityName: 'uncommon', type: 'pants', displayName: 'Khaki Pants' },
    { src: 'images/rainbowpants.png', rarity: 100, rarityName: 'very-rare', type: 'pants', displayName: 'Rainbow Pants' },
    { src: 'images/freakduck.png', rarity: 500, rarityName: 'mythical', type: 'other', displayName: 'Double Duck' },
    { src: 'images/flip-effect.png', rarity: 200, rarityName: 'legendary', type: 'other', effect: 'flip', displayName: 'Flip' },
    { src: 'images/babyhair.png', rarity: 15, rarityName: 'uncommon', type: 'hat', displayName: 'Baby Hair' },
    { src: 'images/evileye.png', rarity: 50, rarityName: 'rare', type: 'eyecolor', displayName: 'Evil Eye' },
    { src: 'images/longbeak.png', rarity: 25, rarityName: 'uncommon', type: 'beak', displayName: 'Long Beak' },
    { src: 'images/longwing.png', rarity: 30, rarityName: 'uncommon', type: 'wings', displayName: 'Long Wings' },
    { src: 'images/openbeak.png', rarity: 15, rarityName: 'uncommon', type: 'beak', displayName: 'Open Beak' },
    { src: 'images/overbitebeak.png', rarity: 45, rarityName: 'rare', type: 'beak', displayName: 'Overbite Beak' },
    { src: 'images/pelicanbeak.png', rarity: 75, rarityName: 'very-rare', type: 'beak', displayName: 'Pelican Beak' },
    { src: 'images/rainbowbeak.png', rarity: 150, rarityName: 'legendary', type: 'beak', displayName: 'Rainbow Beak' },
    { src: 'images/slightlyopenbeak.png', rarity: 10, rarityName: 'common', type: 'beak', displayName: 'Slightly Open Beak' },
    { src: 'images/sodahat.png', rarity: 50, rarityName: 'rare', type: 'hat', displayName: 'Soda Hat' },
    { src: 'images/squigglybeak.png', rarity: 60, rarityName: 'rare', type: 'beak', displayName: 'Squiggly Beak' },
    { src: 'images/yellowbeak.png', rarity: 5, rarityName: 'common', type: 'beak', displayName: 'Yellow Beak' },
    { src: 'images/downbeak.png', rarity: 30, rarityName: 'uncommon', type: 'beak', displayName: 'Down Beak' },
    { src: 'images/nubbeak.png', rarity: 30, rarityName: 'uncommon', type: 'beak', displayName: 'Nub Beak' },
    { src: 'images/upbeak.png', rarity: 30, rarityName: 'uncommon', type: 'beak', displayName: 'Up Beak' },
    { src: 'images/yappybeak.png', rarity: 50, rarityName: 'rare', type: 'beak', displayName: 'Yappy Beak' },
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
    { src: 'images/bigfeet.png', rarity: 25, rarityName: 'uncommon', type: 'legs', displayName: 'Big Feet' },
    { src: 'images/oneleg.png', rarity: 60, rarityName: 'rare', type: 'legs', displayName: 'One Leg' },
    { src: 'images/pinlegs.png', rarity: 10, rarityName: 'common', type: 'legs', displayName: 'Pin Legs' },
    { src: 'images/skinnyfeet.png', rarity: 10, rarityName: 'common', type: 'legs', displayName: 'Skinny Feet' },
    { src: 'images/yellowlegs.png', rarity: 5, rarityName: 'common', type: 'legs', displayName: 'Yellow Legs' },

    // --- NEW ACCESSORIES START HERE ---
    // Beaks
    { src: 'images/beakblocky.png', rarity: 25, rarityName: 'uncommon', type: 'beak', displayName: 'Blocky Beak' },
    { src: 'images/beakdragon.png', rarity: 75, rarityName: 'very-rare', type: 'beak', displayName: 'Snout' },
    { src: 'images/beakgold.png', rarity: 150, rarityName: 'legendary', type: 'beak', displayName: 'Gold Beak' },
    { src: 'images/beakmosquito.png', rarity: 50, rarityName: 'rare', type: 'beak', displayName: 'Mosquito Beak' },
    { src: 'images/beaksword.png', rarity: 80, rarityName: 'very-rare', type: 'beak', displayName: 'Sword Beak' },
    { src: 'images/beaktropical.png', rarity: 80, rarityName: 'very-rare', type: 'beak', displayName: 'Tropical Beak' },
    // Body (was Feathers)
    { src: 'images/bodyblack.png', rarity: 10, rarityName: 'common', type: 'body', displayName: 'Black' },
    { src: 'images/bodyblocky.png', rarity: 50, rarityName: 'rare', type: 'body', displayName: 'Blocky' },
    { src: 'images/bodygold.png', rarity: 150, rarityName: 'legendary', type: 'body', displayName: 'Gold' },
    { src: 'images/bodygreen.png', rarity: 16, rarityName: 'common', type: 'body', displayName: 'Green' },
    { src: 'images/bodyhighland.png', rarity: 60, rarityName: 'rare', type: 'body', displayName: 'Highland' },
    { src: 'images/bodynecklace.png', rarity: 25, rarityName: 'uncommon', type: 'body', displayName: 'Necklace' },
    { src: 'images/bodypumpkin.png', rarity: 60, rarityName: 'rare', type: 'body', displayName: 'Pumpkin' },
    { src: 'images/bodyrainbow.png', rarity: 150, rarityName: 'legendary', type: 'body', displayName: 'Rainbow' },
    { src: 'images/bodytropical.png', rarity: 80, rarityName: 'very-rare', type: 'body', displayName: 'Tropical' },
    { src: 'images/bodytuxedo.png', rarity: 80, rarityName: 'very-rare', type: 'body', displayName: 'Tuxedo' },
    // Eyes
    { src: 'images/eyedragon.png', rarity: 78, rarityName: 'very-rare', type: 'eyecolor', displayName: 'Dragon Eyes' },
    { src: 'images/eyethief.png', rarity: 22, rarityName: 'uncommon', type: 'eyecolor', displayName: 'Thief Eyes' },
    { src: 'images/eyetropical.png', rarity: 80, rarityName: 'very-rare', type: 'eyecolor', displayName: 'Tropical Eyes' },
    { src: 'images/eyeunsettling.png', rarity: 100, rarityName: 'very-rare', type: 'eyecolor', displayName: 'Unsettling Eyes' },
    // Hats
    { src: 'images/hatantenna.png', rarity: 50, rarityName: 'rare', type: 'hat', displayName: 'Antenna' },
    { src: 'images/hathighland.png', rarity: 82, rarityName: 'very-rare', type: 'hat', displayName: 'Highland Hair' },
    { src: 'images/hatstem.png', rarity: 10, rarityName: 'common', type: 'hat', displayName: 'Stem' },
    { src: 'images/hatwitch.png', rarity: 45, rarityName: 'rare', type: 'hat', displayName: 'Witch Hat' },
    // Legs
    { src: 'images/legsblockyfeet.png', rarity: 50, rarityName: 'rare', type: 'legs', displayName: 'Blocky Feet' },
    { src: 'images/legsblueskeakers.png', rarity: 20, rarityName: 'uncommon', type: 'legs', displayName: 'Blue Sneakers' },
    { src: 'images/legschickenfeet.png', rarity: 60, rarityName: 'rare', type: 'legs', displayName: 'Chicken Feet' },
    { src: 'images/legsgold.png', rarity: 150, rarityName: 'legendary', type: 'legs', displayName: 'Gold Legs' },
    { src: 'images/legsgreensneakers.png', rarity: 20, rarityName: 'uncommon', type: 'legs', displayName: 'Green Sneakers' },
    { src: 'images/legslongfeet.png', rarity: 88, rarityName: 'very-rare', type: 'legs', displayName: 'Long Feet' },
    { src: 'images/legspinksneakers.png', rarity: 20, rarityName: 'uncommon', type: 'legs', displayName: 'Pink Sneakers' },
    { src: 'images/legsrainbowfeet.png', rarity: 150, rarityName: 'legendary', type: 'legs', displayName: 'Rainbow Feet' },
    { src: 'images/legsredboots.png', rarity: 25, rarityName: 'uncommon', type: 'legs', displayName: 'Red Boots' },
    { src: 'images/legsredsneakers.png', rarity: 20, rarityName: 'uncommon', type: 'legs', displayName: 'Red Sneakers' },
    { src: 'images/legstropical.png', rarity: 80, rarityName: 'very-rare', type: 'legs', displayName: 'Tropical Legs' },
    { src: 'images/legswidestance.png', rarity: 25, rarityName: 'uncommon', type: 'legs', displayName: 'Wide Stance' },
    { src: 'images/legswobbly.png', rarity: 49, rarityName: 'rare', type: 'legs', displayName: 'Wobbly Legs' },
    // Rides
    { src: 'images/ridebanana.png', rarity: 80, rarityName: 'very-rare', type: 'ride', displayName: 'Banana' },
    { src: 'images/rideblocky.png', rarity: 25, rarityName: 'uncommon', type: 'ride', displayName: 'Blocky Board' },
    { src: 'images/ridegold.png', rarity: 150, rarityName: 'legendary', type: 'ride', displayName: 'Gold Board' },
    { src: 'images/riderainbow.png', rarity: 150, rarityName: 'legendary', type: 'ride', displayName: 'Rainbow Board' },
    { src: 'images/rideuglyduckling.png', rarity: 77, rarityName: 'very-rare', type: 'ride', displayName: 'Ugly Duckling' },
    // Wings
    { src: 'images/wingangel.png', rarity: 150, rarityName: 'legendary', type: 'wings', displayName: 'Angel Wings' },
    { src: 'images/wingblocky.png', rarity: 50, rarityName: 'rare', type: 'wings', displayName: 'Blocky Wings' },
    { src: 'images/wingbouquet.png', rarity: 60, rarityName: 'rare', type: 'wings', displayName: 'Bouquet' },
    { src: 'images/wingbug.png', rarity: 25, rarityName: 'uncommon', type: 'wings', displayName: 'Bug Wings' },
    { src: 'images/wingbutterfly.png', rarity: 60, rarityName: 'rare', type: 'wings', displayName: 'Butterfly Wings' },
    { src: 'images/wingdragon.png', rarity: 78, rarityName: 'very-rare', type: 'wings', displayName: 'Dragon Wings' },
    { src: 'images/wingfencingsword.png', rarity: 60, rarityName: 'rare', type: 'wings', displayName: 'Fencing Sword' },
    { src: 'images/wingflag.png', rarity: 25, rarityName: 'uncommon', type: 'wings', displayName: 'Flag' },
    { src: 'images/wingleafumbrella.png', rarity: 60, rarityName: 'rare', type: 'wings', displayName: 'Leaf Umbrella' },
    { src: 'images/wingmitten.png', rarity: 15, rarityName: 'common', type: 'wings', displayName: 'Mittens' },
    { src: 'images/wingpaddle.png', rarity: 30, rarityName: 'uncommon', type: 'wings', displayName: 'Paddle Wing' },
    { src: 'images/wingsword.png', rarity: 80, rarityName: 'very-rare', type: 'wings', displayName: 'Sword' },
    // --- END NEW ACCESSORIES ---

    // Null (Invisible) Accessories
    { src: null, rarity: 200, rarityName: 'legendary', type: 'ride', displayName: 'No Ride' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'body', displayName: 'No Body' }, // WAS 'feathers'
    { src: null, rarity: 200, rarityName: 'legendary', type: 'eyecolor', displayName: 'No Eye' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'beak', displayName: 'No Beak' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'wings', displayName: 'No Wing' },
    { src: null, rarity: 200, rarityName: 'legendary', type: 'legs', displayName: 'No Legs' },
];

// --- NEW: FASHION SETS ---
// This list is used by pond.js to calculate bonuses
// and by gallery.js to display the sets.
const FASHION_SETS = [
    { setName: "The Blocky Set", bonus: 2500, items: ["Blocky Beak", "Blocky", "Blocky Feet", "Blocky Board", "Blocky Wings"] },
    { setName: "The Golden Set", bonus: 5000, items: ["Gold Beak", "Gold", "Gold Legs", "Gold Board"] },
    { setName: "The Rainbow Set", bonus: 2500, items: ["Rainbow Beak", "Rainbow", "Rainbow Pants", "Rainbow Feet", "Rainbow Board"] },
    { setName: "The Tropical Duck", bonus: 1000, items: ["Tropical Beak", "Tropical", "Tropical Eyes", "Tropical Legs"] },
    { setName: "The Dragon Duck", bonus: 1000, items: ["Snout", "Dragon Eyes", "Dragon Wings", "Black"] },
    { setName: "The Blade Master Duck", bonus: 250, items: ["Sword Beak", "Sword"] },
    { setName: "The Angelic Set", bonus: 1000, items: ["Halo", "Angel Wings"] },
    { setName: "The Highland Duck", bonus: 300, items: ["Highland", "Highland Hair"] },
    { setName: "Nailed It", bonus: 300, items: ["Nail Cap", "Nail Back"] },
    { setName: "The Pumpkin Duck", bonus: 300, items: ["Pumpkin", "Stem"] },
    { setName: "Double Soda I Guess??", bonus: 300, items: ["Soda", "Soda Hat"] },
    { setName: "Prom Duck", bonus: 1800, items: ["Bouquet", "Tuxedo", "Top Hat", "Dark Pants"] },
    { setName: "Witch Duck", bonus: 300, items: ["Green", "Witch Hat"] },
    { setName: "Thief Duck", bonus: 200, items: ["Black Bandana", "Thief Eyes"] },
    { setName: "Birthday Duck", bonus: 200, items: ["Party Hat", "Happy Eyes"] },
    { setName: "I Don't Like It", bonus: 1500, items: ["No Beak", "Unsettling Eyes"] },
    { setName: "A True Mallard", bonus: 1000, items: ["Mallard", "Yellow Beak", "Yellow Legs", "Blue Bands"] },
    { setName: "Mosquito Duck", bonus: 300, items: ["Mosquito Beak", "Bug Wings"] },
    { setName: "How Did We Get Here?", bonus: 5000, items: ["No Ride", "No Body", "No Eye", "No Beak", "No Wing", "No Legs"] },
    { setName: "Turmoil Duck", bonus: 1000, items: ["Checker", "Happy Eyes"] },
    { setName: "Duck Family", bonus: 500, items: ["Yellow", "Ugly Duckling"] },
    { setName: "Rainy Duck", bonus: 300, items: ["Umbrella", "Red Boots"] },
    { setName: "CHAAAARGE!", bonus: 250, items: ["Open Beak", "Flag"] },
    { setName: "Bling Duck", bonus: 300, items: ["Gold Bracelets", "Necklace"] },
    { setName: "DuckMaxxing", bonus: 2000, items: ["Duckboard", "Mutant Back", "Double Duck"] },
    { setName: "Formal Duck", bonus: 300, items: ["Tuxedo", "Top Hat"] },
    { setName: "Disco Duck", bonus: 500, items: ["Pink Cap", "Disco Scooter", "Pink Sneakers"] }
];