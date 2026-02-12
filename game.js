/**
 * Solitaire Tile Bingo – v4.0 (TriPeaks Pyramid)
 *
 * Cards are arranged in a pyramid: upper-layer cards overlap and cover
 * lower-layer cards. Covered cards are face-down. The bottom layer is
 * a 5×5 grid used for BINGO detection.
 */

// ─── Data ────────────────────────────────────────────────────

const CATEGORIES = {
    animals: {
        name: 'Animals', emoji: '🐾',
        items: [
            { name: 'Bear', emoji: '🐻' }, { name: 'Monkey', emoji: '🐵' },
            { name: 'Pig', emoji: '🐷' }, { name: 'Sheep', emoji: '🐑' },
            { name: 'Horse', emoji: '🐴' }, { name: 'Cat', emoji: '🐱' },
            { name: 'Dog', emoji: '🐶' }, { name: 'Rabbit', emoji: '🐰' },
            { name: 'Fox', emoji: '🦊' }, { name: 'Panda', emoji: '🐼' },
        ]
    },
    flowers: {
        name: 'Flowers', emoji: '🌸',
        items: [
            { name: 'Lily', emoji: '🌷' }, { name: 'Peony', emoji: '🌺' },
            { name: 'Rose', emoji: '🌹' }, { name: 'Daisy', emoji: '🌼' },
            { name: 'Tulip', emoji: '💐' }, { name: 'Orchid', emoji: '🪻' },
            { name: 'Lotus', emoji: '🪷' }, { name: 'Sunflower', emoji: '🌻' },
        ]
    },
    furniture: {
        name: 'Furniture', emoji: '🪑',
        items: [
            { name: 'Chair', emoji: '🪑' }, { name: 'Bed', emoji: '🛏️' },
            { name: 'Sofa', emoji: '🛋️' }, { name: 'Lamp', emoji: '🪔' },
            { name: 'Table', emoji: '🪵' }, { name: 'Clock', emoji: '🕰️' },
            { name: 'Mirror', emoji: '🪞' }, { name: 'Vase', emoji: '🏺' },
        ]
    },
    aquatics: {
        name: 'Aquatics', emoji: '🐠',
        items: [
            { name: 'Fish', emoji: '🐟' }, { name: 'Whale', emoji: '🐋' },
            { name: 'Dolphin', emoji: '🐬' }, { name: 'Octopus', emoji: '🐙' },
            { name: 'Crab', emoji: '🦀' }, { name: 'Shrimp', emoji: '🦐' },
            { name: 'Turtle', emoji: '🐢' }, { name: 'Shark', emoji: '🦈' },
        ]
    },
    vehicles: {
        name: 'Vehicles', emoji: '🚗',
        items: [
            { name: 'Car', emoji: '🚗' }, { name: 'Bus', emoji: '🚌' },
            { name: 'Rocket', emoji: '🚀' }, { name: 'Boat', emoji: '⛵' },
            { name: 'Train', emoji: '🚂' }, { name: 'Plane', emoji: '✈️' },
            { name: 'Bike', emoji: '🚲' }, { name: 'Truck', emoji: '🚚' },
        ]
    },
    food: {
        name: 'Food', emoji: '🍔',
        items: [
            { name: 'Pizza', emoji: '🍕' }, { name: 'Burger', emoji: '🍔' },
            { name: 'Cake', emoji: '🎂' }, { name: 'Apple', emoji: '🍎' },
            { name: 'Ice Cream', emoji: '🍦' }, { name: 'Cookie', emoji: '🍪' },
            { name: 'Banana', emoji: '🍌' }, { name: 'Grape', emoji: '🍇' },
        ]
    },
    sports: {
        name: 'Sports', emoji: '⚽',
        items: [
            { name: 'Soccer', emoji: '⚽' }, { name: 'Baseball', emoji: '⚾' },
            { name: 'Tennis', emoji: '🎾' }, { name: 'Basket', emoji: '🏀' },
            { name: 'Bowling', emoji: '🎳' }, { name: 'Golf', emoji: '⛳' },
            { name: 'Rugby', emoji: '🏈' }, { name: 'Pingpong', emoji: '🏓' },
        ]
    },
    music: {
        name: 'Music', emoji: '🎵',
        items: [
            { name: 'Guitar', emoji: '🎸' }, { name: 'Piano', emoji: '🎹' },
            { name: 'Drum', emoji: '🥁' }, { name: 'Violin', emoji: '🎻' },
            { name: 'Trumpet', emoji: '🎺' }, { name: 'Sax', emoji: '🎷' },
            { name: 'Mic', emoji: '🎤' }, { name: 'Flute', emoji: '🪈' },
        ]
    },
};

const ALL_CATEGORY_KEYS = Object.keys(CATEGORIES);
const MAX_SLOTS = 5;
const CARD_COLORS = ['color-a', 'color-b', 'color-c'];
const MAX_LEVEL = 10;

// ─── Layout Constants ────────────────────────────────────────

const CARD_W = 64;
const CARD_H = 56;
const GAP_X = 4;
const GAP_Y = 3;
const VERTICAL_OVERLAP = 30;

function getContainerInnerWidth() {
    const container = document.getElementById('game-container');
    if (container) {
        const style = getComputedStyle(container);
        return container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    }
    return 376;
}

// ─── Level Layouts (boolean masks) ──────────────────────────

const LEVEL_LAYOUTS = {
    1: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
    ],
    2: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
    ],
    3: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[0,1,1,0],[1,1,1,1],[1,1,1,1],[0,1,1,0]],
    ],
    4: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
        [[1,1,1],[1,1,1],[1,1,1]],
    ],
    5: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
        [[0,1,0],[1,1,1],[0,1,0]],
    ],
    6: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
        [[1,1,1],[1,1,1],[1,1,1]],
        [[1,1],[1,1]],
    ],
    7: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
        [[1,1,1],[1,0,1],[1,1,1]],
        [[1,1],[1,1]],
    ],
    8: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
        [[1,1,1],[1,1,1],[1,1,1]],
        [[1,1],[1,1]],
        [[1]],
    ],
    9: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[0,1,1,0],[1,1,1,1],[1,1,1,1],[0,1,1,0]],
        [[1,1,1],[1,1,1],[1,1,1]],
        [[1,0],[0,1]],
        [[1]],
    ],
    10: [
        [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
        [[1,1,1],[1,1,1],[1,1,1]],
        [[1,1],[1,1]],
        [[1]],
    ],
};

function countLayoutPositions(layout) {
    let total = 0;
    for (const layer of layout) {
        for (const row of layer) {
            for (const cell of row) {
                total += cell;
            }
        }
    }
    return total;
}

// ─── Level Config ────────────────────────────────────────────

function getLevelConfig(level) {
    const layout = LEVEL_LAYOUTS[level] || LEVEL_LAYOUTS[1];
    const numLayers = layout.length;
    const totalPositions = countLayoutPositions(layout);
    const NUM_CATEGORIES_BY_LEVEL = [0, 3, 4, 4, 5, 5, 5, 6, 6, 6, 6];
    const numCategories = NUM_CATEGORIES_BY_LEVEL[level] || 6;
    const bingosNeeded = Math.min(1 + Math.floor((level - 1) / 2), 5);
    const cardsPerCategory = Math.min(2 + level, 6);
    const maxSlots = Math.min(3 + Math.floor((level - 1) / 3), 5);
    const timeLimit = totalPositions * 10;

    return { numCategories, numLayers, bingosNeeded, cardsPerCategory, totalPositions, maxSlots, timeLimit, layout };
}

// ─── Game ────────────────────────────────────────────────────

class Game {
    constructor() {
        this.level = 1;
        this.cards = [];
        this.cardMap = {};
        this.coveredBy = {};
        this.covers = {};
        this.cleared = [];
        this.slots = [];
        this.completedCount = 0;
        this.bingoLines = [];
        this.bingosNeeded = 1;
        this.moveHistory = [];
        this.isAnimating = false;
        this.categoryColorMap = {};
        this.timeLeft = 0;
        this.timerInterval = null;
        this.maxSlots = 3;
        this.retryBonus = {};
        this.currentNumLayers = 2;

        this.gridEl = document.getElementById('bingo-grid');
        this.timerEl = document.getElementById('timer-count');
        this.collectorsEl = document.getElementById('collectors');
        this.bingoCountEl = document.getElementById('bingo-count');
        this.levelLabelEl = document.getElementById('level-label');
        this.winOverlay = document.getElementById('win-overlay');
        this.loseOverlay = document.getElementById('lose-overlay');
        this.levelOverlay = document.getElementById('level-overlay');
        this.levelGridEl = document.getElementById('level-grid');

        document.getElementById('btn-shuffle').addEventListener('click', () => this.shuffle());
        document.getElementById('btn-hint').addEventListener('click', () => this.showHint());
        document.getElementById('btn-undo').addEventListener('click', () => this.undo());
        document.getElementById('btn-next-level').addEventListener('click', () => this.nextLevel());
        document.getElementById('btn-retry').addEventListener('click', () => this.retry());
        document.getElementById('menu-btn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('btn-close-levels').addEventListener('click', () => this.hideLevelSelect());

        // Event delegation for pyramid cards (single listener instead of per-card)
        this._lastTouchTime = 0;
        this.gridEl.addEventListener('touchend', (e) => {
            e.preventDefault();
            this._lastTouchTime = Date.now();
            const cardEl = e.target.closest('.pyramid-card');
            if (cardEl && !cardEl.classList.contains('face-down')) {
                this.onPyramidCardClick(Number(cardEl.dataset.cardId));
            }
        });
        this.gridEl.addEventListener('click', (e) => {
            // Skip click if it followed a touchend (prevents double-fire on mobile)
            if (Date.now() - this._lastTouchTime < 500) return;
            const cardEl = e.target.closest('.pyramid-card');
            if (cardEl && !cardEl.classList.contains('face-down')) {
                this.onPyramidCardClick(Number(cardEl.dataset.cardId));
            }
        });

        this.levelData = {};
        this.init();
    }

    // ── Layout Restore ─────────────────────────────────────────

    restoreLayout(layout) {
        this.completedCount = 0;
        this.slots = new Array(this.maxSlots).fill(null);
        this.categoryTargets = { ...layout.categoryTargets };
        this.categoryColorMap = { ...layout.categoryColorMap };
        this.cards = [];
        this.cardMap = {};
        this.cleared = [];

        for (let r = 0; r < 5; r++) {
            this.cleared[r] = [];
            for (let c = 0; c < 5; c++) {
                this.cleared[r][c] = false;
            }
        }

        for (const saved of layout.cards) {
            const key = `${saved.layer}-${saved.row}-${saved.col}`;
            const cardObj = {
                id: this.cards.length,
                layer: saved.layer,
                row: saved.row,
                col: saved.col,
                card: { ...saved.card },
                faceUp: false,
                removed: false,
                justFlipped: false,
            };
            this.cards.push(cardObj);
            this.cardMap[key] = cardObj;
        }

        this.buildCoveringRelationships();
        this.updateFaceUpStates();
    }

    async init() {
        // Fetch all level JSON files
        const fetches = [];
        for (let lv = 1; lv <= MAX_LEVEL; lv++) {
            fetches.push(
                fetch(`level/level_${lv}.json`)
                    .then(r => r.ok ? r.json() : null)
                    .then(data => { if (data) this.levelData[lv] = data; })
                    .catch(() => {})
            );
        }
        await Promise.all(fetches);
        this.startLevel(this.level);
    }

    // ── Level Setup ──────────────────────────────────────────

    startLevel(level) {
        this.stopTimer();
        this.level = level;
        this.moveHistory = [];
        this.bingoLines = [];
        this.levelLabelEl.textContent = `Level ${level}`;
        const config = getLevelConfig(level);
        this.bingosNeeded = config.bingosNeeded;
        this.currentNumLayers = config.numLayers;
        this.maxSlots = config.maxSlots;

        const bonus = this.retryBonus[level] || 0;
        this.timeLeft = config.timeLimit + bonus;

        // Try to load from pre-generated level data
        const layouts = this.levelData[level];
        if (layouts && layouts.length > 0) {
            const idx = Math.floor(Math.random() * layouts.length);
            this.restoreLayout(layouts[idx]);
        } else {
            // Fallback: generate on-the-fly (unverified)
            this.completedCount = 0;
            this.slots = new Array(this.maxSlots).fill(null);
            this.generateCards(config);
        }

        this.render();
        this.startTimer();
        setTimeout(() => this.checkDeadState(), 100);
    }

    generateCards(config) {
        // Pick categories
        const shuffledCats = this.shuffleArray([...ALL_CATEGORY_KEYS]);
        const activeCatKeys = shuffledCats.slice(0, config.numCategories);

        this.categoryColorMap = {};
        activeCatKeys.forEach((key, i) => {
            this.categoryColorMap[key] = CARD_COLORS[Math.floor(i / 2) % CARD_COLORS.length];
        });

        // Build all cards: 1 gold + N regular per category
        const allCards = [];
        const regularCountPerCat = {};

        activeCatKeys.forEach(catKey => {
            const cat = CATEGORIES[catKey];
            allCards.push({
                type: 'gold',
                category: catKey,
                name: cat.name,
                emoji: cat.emoji,
            });

            const shuffledItems = this.shuffleArray([...cat.items]);
            const count = Math.min(config.cardsPerCategory, shuffledItems.length);
            regularCountPerCat[catKey] = count;
            for (let i = 0; i < count; i++) {
                allCards.push({
                    type: 'regular',
                    category: catKey,
                    name: shuffledItems[i].name,
                    emoji: shuffledItems[i].emoji,
                });
            }
        });

        this.categoryTargets = { ...regularCountPerCat };

        // Pad to fill all pyramid positions
        while (allCards.length < config.totalPositions) {
            const catKey = activeCatKeys[Math.floor(Math.random() * activeCatKeys.length)];
            const cat = CATEGORIES[catKey];
            const item = cat.items[Math.floor(Math.random() * cat.items.length)];
            allCards.push({
                type: 'regular',
                category: catKey,
                name: item.name,
                emoji: item.emoji,
            });
            regularCountPerCat[catKey]++;
            this.categoryTargets[catKey] = regularCountPerCat[catKey];
        }

        this.shuffleArray(allCards);

        // Distribute cards into pyramid
        this.cards = [];
        this.cardMap = {};
        this.cleared = [];
        let cardIndex = 0;

        for (let r = 0; r < 5; r++) {
            this.cleared[r] = [];
            for (let c = 0; c < 5; c++) {
                this.cleared[r][c] = false;
            }
        }

        for (let L = 0; L < config.numLayers; L++) {
            const layerMask = config.layout[L];
            for (let r = 0; r < layerMask.length; r++) {
                for (let c = 0; c < layerMask[r].length; c++) {
                    if (!layerMask[r][c]) continue;
                    if (cardIndex >= allCards.length) break;
                    const key = `${L}-${r}-${c}`;
                    const cardObj = {
                        id: this.cards.length,
                        layer: L,
                        row: r,
                        col: c,
                        card: allCards[cardIndex++],
                        faceUp: false,
                        removed: false,
                        justFlipped: false,
                    };
                    this.cards.push(cardObj);
                    this.cardMap[key] = cardObj;
                }
            }
        }

        this.buildCoveringRelationships();
        this.updateFaceUpStates();
        this.ensureGoldOnTop();
    }

    // ── Covering Relationships ───────────────────────────────

    buildCoveringRelationships() {
        this.coveredBy = {};
        this.covers = {};

        for (const card of this.cards) {
            const key = `${card.layer}-${card.row}-${card.col}`;
            this.coveredBy[key] = [];
            this.covers[key] = [];
        }

        for (const card of this.cards) {
            if (card.layer === 0) continue;
            const L = card.layer;
            const R = card.row;
            const C = card.col;
            const upperKey = `${L}-${R}-${C}`;

            const coveredPositions = [
                [L - 1, R, C], [L - 1, R, C + 1],
                [L - 1, R + 1, C], [L - 1, R + 1, C + 1]
            ];

            for (const [cl, cr, cc] of coveredPositions) {
                const lowerKey = `${cl}-${cr}-${cc}`;
                if (this.cardMap[lowerKey]) {
                    this.coveredBy[lowerKey].push(upperKey);
                    this.covers[upperKey].push(lowerKey);
                }
            }
        }
    }

    isCardFaceUp(key) {
        const coveringKeys = this.coveredBy[key] || [];
        return coveringKeys.every(ck => {
            const coverCard = this.cardMap[ck];
            return !coverCard || coverCard.removed;
        });
    }

    updateFaceUpStates() {
        for (const card of this.cards) {
            if (card.removed) continue;
            const key = `${card.layer}-${card.row}-${card.col}`;
            const wasFaceUp = card.faceUp;
            card.faceUp = this.isCardFaceUp(key);
            if (!wasFaceUp && card.faceUp) {
                card.justFlipped = true;
            }
        }
    }

    ensureGoldOnTop() {
        const faceUpCards = this.cards.filter(c => !c.removed && c.faceUp);
        if (faceUpCards.some(c => c.card.type === 'gold')) return;

        const buriedGold = this.cards.find(c => !c.removed && !c.faceUp && c.card.type === 'gold');
        if (!buriedGold) return;

        const swapTarget = faceUpCards.find(c => c.card.type !== 'gold');
        if (!swapTarget) return;

        const temp = buriedGold.card;
        buriedGold.card = swapTarget.card;
        swapTarget.card = temp;
    }

    // ── Level Flow ───────────────────────────────────────────

    nextLevel() {
        this.winOverlay.classList.add('hidden');
        this.retryBonus = {};
        this.startLevel(this.level + 1);
    }

    retry() {
        this.loseOverlay.classList.add('hidden');
        this.retryBonus[this.level] = (this.retryBonus[this.level] || 0) + 30;
        this.startLevel(this.level);
    }

    showLevelSelect() {
        this.levelGridEl.innerHTML = '';
        for (let i = 1; i <= MAX_LEVEL; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn' + (i === this.level ? ' current' : '');
            btn.textContent = i;
            btn.addEventListener('click', () => {
                this.levelOverlay.classList.add('hidden');
                this.winOverlay.classList.add('hidden');
                this.loseOverlay.classList.add('hidden');
                this.retryBonus = {};
                this.startLevel(i);
            });
            this.levelGridEl.appendChild(btn);
        }
        this.levelOverlay.classList.remove('hidden');
    }

    hideLevelSelect() {
        this.levelOverlay.classList.add('hidden');
    }

    // ── Dead State Detection ─────────────────────────────────

    checkDeadState() {
        if (this.hasValidMoves()) return;
        setTimeout(() => this.onLose(), 300);
    }

    hasValidMoves() {
        const hasEmptySlot = this.findEmptySlot() !== -1;
        const activeKeys = new Set(
            this.slots.filter(s => s !== null && s.collected < s.target).map(s => s.key)
        );

        for (const cardObj of this.cards) {
            if (cardObj.removed || !cardObj.faceUp) continue;
            const top = cardObj.card;
            if (top.type === 'gold' && hasEmptySlot) return true;
            if (top.type === 'regular' && activeKeys.has(top.category)) return true;
        }
        return false;
    }

    onLose(reason) {
        this.stopTimer();
        const msg = reason || 'No more moves available!';
        const bonus = (this.retryBonus[this.level] || 0) + 30;
        document.getElementById('lose-message').textContent =
            `${msg} Retry with +${bonus}s time.`;
        this.loseOverlay.classList.remove('hidden');
    }

    // ── Slot Helpers ─────────────────────────────────────────

    findEmptySlot() {
        return this.slots.findIndex(s => s === null);
    }

    findSlotByCategory(catKey) {
        return this.slots.findIndex(s => s !== null && s.key === catKey);
    }

    // ── Rendering ────────────────────────────────────────────

    render() {
        this.renderTimer();
        this.renderSlots();
        this.renderPyramid();
        this.updateBingoCount();
    }

    // ── Timer ───────────────────────────────────────────────

    startTimer() {
        this.stopTimer();
        this.renderTimer();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.renderTimer();
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.onLose('Time\'s up!');
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    renderTimer() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        this.timerEl.classList.toggle('low', this.timeLeft <= 30);
    }

    renderSlots() {
        this.collectorsEl.innerHTML = '';
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = this.slots[i];
            const div = document.createElement('div');

            if (slot === null) {
                div.className = 'slot-card empty';
                div.innerHTML = `<span class="slot-empty-icon">?</span>`;
            } else {
                const isFull = slot.collected >= slot.target;
                div.className = 'slot-card active' + (isFull ? ' full' : '');
                div.innerHTML = `
                    <span class="cat-emoji">${slot.emoji}</span>
                    <span class="cat-name">${slot.name}</span>
                    <span class="cat-progress">${slot.collected}/${slot.target}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${slot.target ? (slot.collected / slot.target * 100) : 0}%"></div>
                    </div>
                `;
            }
            this.collectorsEl.appendChild(div);
        }

        if (this.completedCount > 0) {
            const badge = document.createElement('div');
            badge.className = 'collector-done-badge';
            badge.innerHTML = `<span>${this.completedCount}</span>`;
            badge.title = `${this.completedCount} categories completed`;
            this.collectorsEl.appendChild(badge);
        }
    }

    getCardPosition(layer, row, col) {
        const containerW = getContainerInnerWidth();
        const layerCols = 5 - layer;
        const layerWidth = layerCols * CARD_W + (layerCols - 1) * GAP_X;
        const layerOffsetX = (containerW - layerWidth) / 2;

        // Upper layers shift DOWN so they visually overlap lower layers
        const layerY = layer * VERTICAL_OVERLAP;

        const x = layerOffsetX + col * (CARD_W + GAP_X);
        const y = layerY + row * (CARD_H + GAP_Y);

        return { x, y };
    }

    computePyramidHeight() {
        // Find the maximum bottom edge across all layers
        let maxBottom = 0;
        for (let L = 0; L < this.currentNumLayers; L++) {
            const rows = 5 - L;
            const layerY = L * VERTICAL_OVERLAP;
            const bottom = layerY + rows * (CARD_H + GAP_Y) - GAP_Y;
            if (bottom > maxBottom) maxBottom = bottom;
        }
        return maxBottom;
    }

    renderPyramid() {
        this.gridEl.innerHTML = '';
        const pyramidHeight = this.computePyramidHeight();
        this.gridEl.style.height = pyramidHeight + 'px';

        // Render cleared marks for bottom layer
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (this.cleared[r][c]) {
                    const pos = this.getCardPosition(0, r, c);
                    const mark = document.createElement('div');
                    mark.className = 'cleared-mark-pyramid';
                    if (this.isCellInBingo(r, c)) {
                        mark.classList.add('bingo-cell');
                    }
                    mark.style.left = pos.x + 'px';
                    mark.style.top = pos.y + 'px';
                    mark.style.zIndex = '1';
                    this.gridEl.appendChild(mark);
                }
            }
        }

        // Render all non-removed cards, sorted by layer (lower first)
        const sortedCards = [...this.cards].filter(c => !c.removed)
            .sort((a, b) => a.layer - b.layer || a.row - b.row || a.col - b.col);

        for (const cardObj of sortedCards) {
            const pos = this.getCardPosition(cardObj.layer, cardObj.row, cardObj.col);
            const zIndex = cardObj.layer * 100 + cardObj.row * 10 + cardObj.col;

            const el = document.createElement('div');
            el.className = 'pyramid-card';
            el.dataset.cardId = cardObj.id;
            el.style.left = pos.x + 'px';
            el.style.top = pos.y + 'px';
            el.style.zIndex = zIndex;

            if (!cardObj.faceUp) {
                el.classList.add('face-down');
            }

            // Inner container for flip
            const inner = document.createElement('div');
            inner.className = 'card-inner';

            // Only render the visible face to avoid opacity-based stacking issues
            if (cardObj.faceUp) {
                // Front face
                const face = document.createElement('div');
                const goldClass = cardObj.card.type === 'gold' ? ' gold-card' : '';
                const colorClass = cardObj.card.type === 'regular'
                    ? ' ' + (this.categoryColorMap[cardObj.card.category] || '')
                    : '';
                face.className = `card-face${goldClass}${colorClass}`;
                face.innerHTML = `
                    <span class="card-emoji">${cardObj.card.emoji}</span>
                    <span class="card-name">${cardObj.card.name}</span>
                `;
                inner.appendChild(face);
            } else {
                // Back face
                const back = document.createElement('div');
                back.className = 'card-back';
                inner.appendChild(back);
            }

            el.appendChild(inner);

            // 2D flip animation for newly uncovered cards
            if (cardObj.justFlipped) {
                el.classList.add('flipping');
                setTimeout(() => el.classList.remove('flipping'), 500);
                cardObj.justFlipped = false;
            }

            this.gridEl.appendChild(el);
        }
    }

    updateBingoCount() {
        const lines = this.findBingoLines();
        this.bingoLines = lines;
        this.bingoCountEl.textContent = `${lines.length} / ${this.bingosNeeded}`;

        const indicator = document.getElementById('category-indicator');
        indicator.innerHTML = '';
        for (let i = 0; i < this.bingosNeeded; i++) {
            const dot = document.createElement('div');
            dot.className = 'cat-dot' + (i < lines.length ? ' active' : '');
            indicator.appendChild(dot);
        }
    }

    // ── Card Interaction ─────────────────────────────────────

    onPyramidCardClick(cardId) {
        if (this.isAnimating) return;

        const cardObj = this.cards.find(c => c.id === cardId);
        if (!cardObj || cardObj.removed || !cardObj.faceUp) return;

        if (cardObj.card.type === 'gold') {
            this.onGoldCardClick(cardObj);
        } else {
            this.onRegularCardClick(cardObj);
        }
    }

    onGoldCardClick(cardObj) {
        const emptySlotIdx = this.findEmptySlot();
        if (emptySlotIdx === -1) {
            this.shakeCardById(cardObj.id);
            return;
        }

        this.moveHistory.push({
            action: 'place_gold',
            cardId: cardObj.id,
            card: { ...cardObj.card },
            slotIndex: emptySlotIdx,
            layer: cardObj.layer,
            row: cardObj.row,
            col: cardObj.col,
        });

        this.isAnimating = true;

        const cardEl = this.gridEl.querySelector(`[data-card-id="${cardObj.id}"]`);
        if (cardEl) cardEl.classList.add('removing');

        setTimeout(() => {
            cardObj.removed = true;

            if (cardObj.layer === 0) {
                this.cleared[cardObj.row][cardObj.col] = true;
            }

            this.updateFaceUpStates();

            this.slots[emptySlotIdx] = {
                key: cardObj.card.category,
                name: cardObj.card.name,
                emoji: cardObj.card.emoji,
                collected: 0,
                target: this.categoryTargets[cardObj.card.category] || 0,
            };

            this.isAnimating = false;
            this.render();
            this.checkDeadState();
        }, 400);
    }

    onRegularCardClick(cardObj) {
        const slotIdx = this.findSlotByCategory(cardObj.card.category);
        if (slotIdx === -1) {
            this.shakeCardById(cardObj.id);
            return;
        }

        const slot = this.slots[slotIdx];
        if (slot.collected >= slot.target) {
            this.shakeCardById(cardObj.id);
            return;
        }

        this.moveHistory.push({
            action: 'collect_regular',
            cardId: cardObj.id,
            card: { ...cardObj.card },
            slotIndex: slotIdx,
            layer: cardObj.layer,
            row: cardObj.row,
            col: cardObj.col,
        });

        this.isAnimating = true;

        const cardEl = this.gridEl.querySelector(`[data-card-id="${cardObj.id}"]`);
        if (cardEl) cardEl.classList.add('removing');

        const slotEl = this.collectorsEl.children[slotIdx];
        setTimeout(() => {
            if (slotEl) {
                slotEl.classList.add('receiving');
                setTimeout(() => slotEl.classList.remove('receiving'), 400);
            }
        }, 200);

        setTimeout(() => {
            cardObj.removed = true;

            if (cardObj.layer === 0) {
                this.cleared[cardObj.row][cardObj.col] = true;
            }

            this.updateFaceUpStates();
            slot.collected++;

            if (slot.collected >= slot.target) {
                this.completeSlot(slotIdx);
            }

            this.isAnimating = false;
            this.render();

            const lines = this.findBingoLines();
            if (lines.length >= this.bingosNeeded) {
                setTimeout(() => this.onWin(), 500);
                return;
            }

            this.checkDeadState();
        }, 400);
    }

    completeSlot(slotIdx) {
        this.slots[slotIdx] = null;
        this.completedCount++;
    }

    shakeCardById(cardId) {
        const cardEl = this.gridEl.querySelector(`[data-card-id="${cardId}"]`);
        if (cardEl) {
            cardEl.classList.add('no-match');
            setTimeout(() => cardEl.classList.remove('no-match'), 400);
        }
        // Penalty: lose 10 seconds for invalid click
        this.timeLeft = Math.max(0, this.timeLeft - 10);
        this.renderTimer();
        // Floating penalty animation
        const timerDisplay = document.getElementById('timer-display');
        const penaltyEl = document.createElement('span');
        penaltyEl.className = 'time-penalty';
        penaltyEl.textContent = '-10s';
        timerDisplay.appendChild(penaltyEl);
        setTimeout(() => penaltyEl.remove(), 1000);
    }

    // ── Bingo Logic ──────────────────────────────────────────

    findBingoLines() {
        const lines = [];
        for (let r = 0; r < 5; r++) {
            if (this.cleared[r].every(v => v))
                lines.push({ type: 'row', index: r, cells: [0,1,2,3,4].map(c => [r, c]) });
        }
        for (let c = 0; c < 5; c++) {
            if ([0,1,2,3,4].every(r => this.cleared[r][c]))
                lines.push({ type: 'col', index: c, cells: [0,1,2,3,4].map(r => [r, c]) });
        }
        if ([0,1,2,3,4].every(i => this.cleared[i][i]))
            lines.push({ type: 'diag', index: 0, cells: [0,1,2,3,4].map(i => [i, i]) });
        if ([0,1,2,3,4].every(i => this.cleared[i][4 - i]))
            lines.push({ type: 'diag', index: 1, cells: [0,1,2,3,4].map(i => [i, 4 - i]) });
        return lines;
    }

    isCellInBingo(row, col) {
        return this.bingoLines.some(line =>
            line.cells.some(([r, c]) => r === row && c === col)
        );
    }

    onWin() {
        this.stopTimer();
        const lines = this.bingoLines.length;
        document.getElementById('win-message').textContent =
            `You got ${lines} BINGO line${lines > 1 ? 's' : ''}! Level ${this.level} complete!`;
        this.winOverlay.classList.remove('hidden');
    }

    // ── Tools ────────────────────────────────────────────────

    shuffle() {
        if (this.isAnimating) return;

        const clickableCards = this.cards.filter(c => !c.removed && c.faceUp);
        const cardDatas = clickableCards.map(c => ({ ...c.card }));
        this.shuffleArray(cardDatas);

        clickableCards.forEach((cardObj, i) => {
            cardObj.card = cardDatas[i];
        });

        this.ensureGoldOnTop();
        this.render();
        this.checkDeadState();
    }

    showHint() {
        if (this.isAnimating) return;

        if (this.findEmptySlot() !== -1) {
            for (const cardObj of this.cards) {
                if (cardObj.removed || !cardObj.faceUp) continue;
                if (cardObj.card.type === 'gold') {
                    this.highlightCardById(cardObj.id);
                    return;
                }
            }
        }

        const activeKeys = new Set(
            this.slots.filter(s => s !== null && s.collected < s.target).map(s => s.key)
        );
        for (const cardObj of this.cards) {
            if (cardObj.removed || !cardObj.faceUp) continue;
            if (cardObj.card.type === 'regular' && activeKeys.has(cardObj.card.category)) {
                this.highlightCardById(cardObj.id);
                return;
            }
        }
    }

    highlightCardById(cardId) {
        const cardEl = this.gridEl.querySelector(`[data-card-id="${cardId}"]`);
        if (cardEl) {
            cardEl.classList.add('hint-highlight');
            setTimeout(() => cardEl.classList.remove('hint-highlight'), 2000);
        }
    }

    undo() {
        if (this.isAnimating) return;
        if (this.moveHistory.length === 0) return;

        const move = this.moveHistory.pop();

        const cardObj = this.cards.find(c => c.id === move.cardId);
        cardObj.removed = false;
        cardObj.card = move.card;

        if (move.layer === 0) {
            this.cleared[move.row][move.col] = false;
        }

        if (move.action === 'place_gold') {
            this.slots[move.slotIndex] = null;
        } else if (move.action === 'collect_regular') {
            if (this.slots[move.slotIndex] === null) {
                this.completedCount--;
                const catKey = move.card.category;
                this.slots[move.slotIndex] = {
                    key: catKey,
                    name: CATEGORIES[catKey].name,
                    emoji: CATEGORIES[catKey].emoji,
                    collected: this.categoryTargets[catKey] - 1,
                    target: this.categoryTargets[catKey],
                };
            } else {
                this.slots[move.slotIndex].collected--;
            }
        }

        // Recalculate face-up states (restored card may re-cover cards below)
        this.updateFaceUpStates();
        this.render();
    }

    // ── Utility ──────────────────────────────────────────────

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}

// ─── Start ───────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
