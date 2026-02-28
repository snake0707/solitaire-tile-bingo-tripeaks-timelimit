/**
 * Solitaire Tile Bingo – v5.0 (Same-Position Stacking + Hand Card Area)
 *
 * Cards are arranged in a 5x5 grid with stacked layers (1-on-1 covering).
 * Gold/category cards are in a Klondike-style hand area (draw pile + display).
 * The bottom layer is a 5x5 grid used for BINGO detection.
 */

// ─── Data (loaded from categories.js) ────────────────────────

const MAX_SLOTS = 5;
const LEVEL_SCAN_MAX = 50; // Upper bound for scanning level JSON files

// ─── Layout Constants ────────────────────────────────────────

const CARD_W = 60;
const CARD_H = 70;
const GAP_X = 4;
const GAP_Y = 3;

function getContainerInnerWidth() {
    const container = document.getElementById('game-container');
    if (container) {
        const style = getComputedStyle(container);
        return container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    }
    return 376;
}

// ─── Layout Constants (stacking offsets) ─────────────────────

// All layers are 5x5 grids (same-position stacking: 1-on-1 covering)
const STACK_OFFSET_X = 3;
const STACK_OFFSET_Y = 5;

// ─── Game ────────────────────────────────────────────────────

class Game {
    constructor() {
        this.level = 1;
        this.cards = [];
        this.cardMap = {};
        this.coveredBy = {};
        this.covers = {};
        this.cleared = [];
        this._prevCleared = {};
        this.slots = [];
        this.completedCount = 0;
        this.bingoLines = [];
        this.bingosNeeded = 1;
        this.moveHistory = [];
        this.isAnimating = false;
        this.flyAnimCount = 0;
        this._pendingBingoCells = new Set();
        this.categoryColorMap = {};
        this.timeLeft = 0;
        this.timerInterval = null;
        this.maxSlots = 3;
        this.penaltyTime = 5;
        this.timePaused = false;
        this.retryBonus = {};
        this.currentNumLayers = 2;
        this.handPile = [];
        this.handDisplay = [];

        this.gridEl = document.getElementById('bingo-grid');
        this.timerEl = document.getElementById('timer-count');
        this.collectorsEl = document.getElementById('collectors');
        this.bingoCountEl = document.getElementById('bingo-count');
        this.levelLabelEl = document.getElementById('level-label');
        this.winOverlay = document.getElementById('win-overlay');
        this.loseOverlay = document.getElementById('lose-overlay');
        this.levelOverlay = document.getElementById('level-overlay');
        this.levelGridEl = document.getElementById('level-grid');
        this.handDisplayEl = document.getElementById('hand-display');
        this.handPileEl = document.getElementById('hand-pile');

        document.getElementById('btn-hint').addEventListener('click', () => this.showHint());
        document.getElementById('btn-undo').addEventListener('click', () => this.undo());
        document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
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
            if (Date.now() - this._lastTouchTime < 500) return;
            const cardEl = e.target.closest('.pyramid-card');
            if (cardEl && !cardEl.classList.contains('face-down')) {
                this.onPyramidCardClick(Number(cardEl.dataset.cardId));
            }
        });

        // Hand area event listeners (with null safety for cached HTML)
        if (this.handPileEl) {
            this.handPileEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                this._lastTouchTime = Date.now();
                this.onHandPileClick();
            });
            this.handPileEl.addEventListener('click', (e) => {
                if (Date.now() - this._lastTouchTime < 500) return;
                this.onHandPileClick();
            });
        }
        if (this.handDisplayEl) {
            this.handDisplayEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                this._lastTouchTime = Date.now();
                const topCard = e.target.closest('.hand-display-card.topmost');
                if (topCard) this.onHandDisplayClick();
            });
            this.handDisplayEl.addEventListener('click', (e) => {
                if (Date.now() - this._lastTouchTime < 500) return;
                const topCard = e.target.closest('.hand-display-card.topmost');
                if (topCard) this.onHandDisplayClick();
            });
        }

        this.levelData = {};
        this.availableLevels = new Set(Object.keys(LEVEL_SETTINGS).map(Number));
        this.init();
    }

    // ── Layout Restore ─────────────────────────────────────────

    restoreLayout(layout) {
        this.completedCount = 0;
        this.slots = new Array(this.maxSlots).fill(null);
        this.categoryTargets = { ...layout.categoryTargets };
        // Collect all active categories from grid cards (exclude fillers) and hand pile
        const gridCatKeys = layout.cards.filter(c => c.card.type !== 'filler').map(c => c.card.category);
        const handCatKeys = (layout.handPile || []).map(c => c.category);
        const activeCatKeys = [...new Set([...gridCatKeys, ...handCatKeys])];
        this.categoryColorMap = {};
        activeCatKeys.forEach((key, i) => {
            this.categoryColorMap[key] = CARD_COLORS[i % CARD_COLORS.length];
        });
        this.cards = [];
        this.cardMap = {};
        this.cleared = [];
        this._prevCleared = {};
        this._pendingBingoCells.clear();

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

        // Restore hand pile and display
        this.handPile = (layout.handPile || []).map(c => ({ ...c }));
        this.handDisplay = (layout.handDisplay || []).map(c => ({ ...c }));

        this.buildCoveringRelationships();
        this.updateFaceUpStates();
    }

    async init() {
        // Fetch level JSON files (scan up to LEVEL_SCAN_MAX, 404s are silently ignored)
        const cacheBust = Date.now();
        const fetches = [];
        for (let lv = 1; lv <= LEVEL_SCAN_MAX; lv++) {
            fetches.push(
                fetch(`level/level_${lv}.json?v=${cacheBust}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                        if (!data) return;
                        if (Array.isArray(data)) {
                            this.levelData[lv] = data;
                        } else if (data.layouts) {
                            const lvlCfg = data.config || {};
                            this.levelData[lv] = data.layouts.map(layout =>
                                layout.config ? layout : { ...layout, config: lvlCfg }
                            );
                        }
                        this.availableLevels.add(lv);
                    })
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

        const baseConfig = getLevelSettings(level);
        const layouts = this.levelData[level];
        let config = baseConfig;
        let selectedLayout = null;

        // Try to load from pre-generated level data
        if (layouts && layouts.length > 0) {
            const idx = Math.floor(Math.random() * layouts.length);
            selectedLayout = layouts[idx];
            // Per-layout config overrides defaults
            if (selectedLayout.config) {
                config = { ...baseConfig, ...selectedLayout.config };
            }
        }

        this.bingosNeeded = config.bingosNeeded;
        this.currentNumLayers = config.numLayers;
        this.maxSlots = config.maxSlots;
        this.penaltyTime = config.penaltyTime;

        const bonus = this.retryBonus[level] || 0;
        this.timeLeft = config.timeLimit + bonus;

        if (selectedLayout) {
            this.restoreLayout(selectedLayout);
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
            this.categoryColorMap[key] = CARD_COLORS[i % CARD_COLORS.length];
        });

        // Gold/category cards go to hand pile, regular cards go to grid
        const goldCards = [];
        const regularCards = [];
        const regularCountPerCat = {};

        activeCatKeys.forEach(catKey => {
            const cat = CATEGORIES[catKey];
            goldCards.push({
                type: 'gold',
                category: catKey,
                name: cat.name,
                isText: cat.isText,
            });

            const shuffledItems = this.shuffleArray([...cat.items]);
            const count = Math.min(config.cardsPerCategory, shuffledItems.length);
            regularCountPerCat[catKey] = count;
            for (let i = 0; i < count; i++) {
                regularCards.push({
                    type: 'regular',
                    category: catKey,
                    name: shuffledItems[i].name,
                    image: shuffledItems[i].image,
                    isText: cat.isText,
                });
            }
        });

        this.categoryTargets = { ...regularCountPerCat };

        // Pad regular cards to fill grid positions (minus filler slots)
        const regularPositions = config.totalPositions - (config.numFillers || 0);
        while (regularCards.length < regularPositions) {
            const catKey = activeCatKeys[Math.floor(Math.random() * activeCatKeys.length)];
            const cat = CATEGORIES[catKey];
            const item = cat.items[Math.floor(Math.random() * cat.items.length)];
            regularCards.push({
                type: 'regular',
                category: catKey,
                name: item.name,
                image: item.image,
                isText: cat.isText,
            });
            regularCountPerCat[catKey]++;
            this.categoryTargets[catKey] = regularCountPerCat[catKey];
        }

        // Generate filler cards from non-active categories
        const fillerCards = [];
        const inactiveCatKeys = ALL_CATEGORY_KEYS.filter(k => !activeCatKeys.includes(k));
        const numFillers = config.numFillers || 0;
        for (let i = 0; i < numFillers && inactiveCatKeys.length > 0; i++) {
            const catKey = inactiveCatKeys[Math.floor(Math.random() * inactiveCatKeys.length)];
            const cat = CATEGORIES[catKey];
            const item = cat.items[Math.floor(Math.random() * cat.items.length)];
            fillerCards.push({
                type: 'filler',
                category: catKey,
                name: item.name,
                image: item.image,
                isText: cat.isText,
            });
        }

        // Determine which layer-0 positions get fillers
        const layer0Positions = [];
        const layerMask0 = config.layout[0];
        for (let r = 0; r < layerMask0.length; r++) {
            for (let c = 0; c < layerMask0[r].length; c++) {
                if (layerMask0[r][c]) layer0Positions.push({ r, c });
            }
        }
        this.shuffleArray(layer0Positions);
        const fillerPositionSet = new Set();
        for (let i = 0; i < Math.min(numFillers, layer0Positions.length); i++) {
            fillerPositionSet.add(`${layer0Positions[i].r}-${layer0Positions[i].c}`);
        }

        this.shuffleArray(regularCards);
        this.shuffleArray(goldCards);

        // Hand pile = gold/category cards (face-down draw pile)
        this.handPile = goldCards;
        this.handDisplay = [];

        // Distribute cards into 5x5 grid layers (fillers at layer 0 only)
        this.cards = [];
        this.cardMap = {};
        this.cleared = [];
        this._prevCleared = {};
        let regularIdx = 0;
        let fillerIdx = 0;

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
                    let card;
                    if (L === 0 && fillerPositionSet.has(`${r}-${c}`) && fillerIdx < fillerCards.length) {
                        card = fillerCards[fillerIdx++];
                    } else {
                        if (regularIdx >= regularCards.length) continue;
                        card = regularCards[regularIdx++];
                    }
                    const key = `${L}-${r}-${c}`;
                    const cardObj = {
                        id: this.cards.length,
                        layer: L,
                        row: r,
                        col: c,
                        card: card,
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

        // 1-to-1 covering: card at (L,R,C) only covers (L-1,R,C)
        for (const card of this.cards) {
            if (card.layer === 0) continue;
            const L = card.layer;
            const R = card.row;
            const C = card.col;
            const upperKey = `${L}-${R}-${C}`;
            const lowerKey = `${L - 1}-${R}-${C}`;

            if (this.cardMap[lowerKey]) {
                this.coveredBy[lowerKey].push(upperKey);
                this.covers[upperKey].push(lowerKey);
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
        const levels = [...this.availableLevels].sort((a, b) => a - b);
        for (const i of levels) {
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

        // 1. Any face-up basic card matches an active slot category?
        for (const cardObj of this.cards) {
            if (cardObj.removed || !cardObj.faceUp) continue;
            if (cardObj.card.type === 'regular' && activeKeys.has(cardObj.card.category)) return true;
        }

        // 1.5. Any face-up gold card on grid + empty slot = valid move
        if (hasEmptySlot) {
            for (const cardObj of this.cards) {
                if (cardObj.removed || !cardObj.faceUp) continue;
                if (cardObj.card.type === 'gold') return true;
            }
        }

        // 2. Hand pile has cards to flip?
        if (this.handPile.length > 0) return true;

        // 3. Display has cards + empty slot available?
        if (this.handDisplay.length > 0 && hasEmptySlot) return true;

        // 4. Can recycle (pile empty, display non-empty)?
        if (this.handPile.length === 0 && this.handDisplay.length > 0) return true;

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
        this.renderHandArea();
        this.renderPyramid();
        this.updateBingoCount();
    }

    // ── Timer ───────────────────────────────────────────────

    startTimer() {
        this.stopTimer();
        this.renderTimer();
        this.timerInterval = setInterval(() => {
            if (this.timePaused) return;
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

    togglePause() {
        this.timePaused = !this.timePaused;
        const btn = document.getElementById('btn-pause');
        btn.classList.toggle('active', this.timePaused);
        btn.title = this.timePaused ? 'Resume Timer' : 'Pause Timer';
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
            this.collectorsEl.appendChild(this._buildSlotWrapper(i));
        }
        this._renderCompletedBadge();
    }

    _buildSlotWrapper(i) {
        const slot = this.slots[i];
        const wrapper = document.createElement('div');
        wrapper.className = 'slot-wrapper';

        if (slot === null) {
            // Empty slot — invisible placeholder label to reserve height and prevent layout shift
            const placeholder = document.createElement('div');
            placeholder.className = 'slot-label';
            placeholder.style.visibility = 'hidden';
            placeholder.textContent = '\u00A0';
            wrapper.appendChild(placeholder);

            const div = document.createElement('div');
            div.className = 'slot-card empty';
            div.innerHTML = `<img class="slot-empty-img" src="res/Panel/empty_slot.png" alt="Empty">`;
            wrapper.appendChild(div);
        } else if (slot.collected === 0) {
            // Category placed, 0 collected — hide label until first card collected
            const placeholder = document.createElement('div');
            placeholder.className = 'slot-label';
            placeholder.style.visibility = 'hidden';
            placeholder.textContent = '\u00A0';
            wrapper.appendChild(placeholder);

            const div = document.createElement('div');
            div.className = 'slot-card category-placed';
            div.innerHTML = `<img class="slot-bg-img" src="res/Panel/category_card_1.png" alt=""><span class="slot-card-text">${slot.name}</span>`;
            wrapper.appendChild(div);
        } else {
            // Collecting: label above + card with last collected image + progress
            const label = document.createElement('div');
            label.className = 'slot-label';
            label.textContent = slot.name;
            wrapper.appendChild(label);

            const isFull = slot.collected >= slot.target;
            const div = document.createElement('div');
            div.className = 'slot-card collecting' + (isFull ? ' full' : '');

            let cardContent = `<span class="cat-progress">${slot.collected}/${slot.target}</span>`;
            if (slot.lastCard) {
                if (slot.lastCard.isText) {
                    cardContent += `<span class="slot-card-text">${slot.lastCard.name}</span>`;
                } else if (slot.lastCard.image) {
                    cardContent += `<img class="slot-card-img" src="${slot.lastCard.image}" alt="${slot.lastCard.name}">`;
                }
            }
            div.innerHTML = cardContent;
            wrapper.appendChild(div);
        }

        return wrapper;
    }

    _renderCompletedBadge() {
        // Remove existing badge if any
        const existing = this.collectorsEl.querySelector('.collector-done-badge');
        if (existing) existing.remove();

        if (this.completedCount > 0) {
            const badge = document.createElement('div');
            badge.className = 'collector-done-badge';
            badge.innerHTML = `<span>${this.completedCount}</span>`;
            badge.title = `${this.completedCount} categories completed`;
            this.collectorsEl.appendChild(badge);
        }
    }

    /** Update only a single slot element without rebuilding the entire collector area */
    updateSlot(slotIdx) {
        const oldWrapper = this.collectorsEl.children[slotIdx];
        if (!oldWrapper) return;
        const newWrapper = this._buildSlotWrapper(slotIdx);
        this.collectorsEl.replaceChild(newWrapper, oldWrapper);
        this._renderCompletedBadge();
    }

    getCardPosition(layer, row, col) {
        const containerW = getContainerInnerWidth();
        // All layers share the same 5x5 grid with small visual offset per layer
        const gridWidth = 5 * CARD_W + 4 * GAP_X;
        const gridOffsetX = (containerW - gridWidth) / 2;

        const x = gridOffsetX + col * (CARD_W + GAP_X) + layer * STACK_OFFSET_X;
        const y = row * (CARD_H + GAP_Y) + layer * STACK_OFFSET_Y;

        return { x, y };
    }

    computePyramidHeight() {
        // Height = 5-row grid + topmost layer offset
        const topLayer = this.currentNumLayers - 1;
        const bottom = 5 * (CARD_H + GAP_Y) - GAP_Y + topLayer * STACK_OFFSET_Y;
        return bottom;
    }

    getStackCountAt(row, col) {
        let count = 0;
        for (const card of this.cards) {
            if (!card.removed && card.row === row && card.col === col) count++;
        }
        return count;
    }

    renderPyramid() {
        this.gridEl.innerHTML = '';
        const pyramidHeight = this.computePyramidHeight();
        this.gridEl.style.height = pyramidHeight + 'px';

        // Track which cells already had marks before this render
        if (!this._prevCleared) this._prevCleared = {};

        // Render cleared marks for bottom layer
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (this.cleared[r][c]) {
                    const pos = this.getCardPosition(0, r, c);
                    const mark = document.createElement('div');
                    mark.className = 'cleared-mark-pyramid';
                    mark.dataset.row = r;
                    mark.dataset.col = c;
                    if (this.isCellInBingo(r, c) && !this._pendingBingoCells.has(r + ',' + c)) {
                        mark.classList.add('bingo-cell');
                    }
                    // Only animate newly cleared cells
                    const cellKey = r + ',' + c;
                    if (this._prevCleared[cellKey]) {
                        mark.classList.add('no-anim');
                    }
                    this._prevCleared[cellKey] = true;
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

            // Always render front face — all cards are visible face-up
            const face = document.createElement('div');
            let colorClass;
            if (cardObj.card.type === 'gold') {
                colorClass = ' ' + (this.categoryColorMap[cardObj.card.category] || '');
                face.className = `card-face gold-grid-card${colorClass}`;
                face.innerHTML = `<span class="card-text">${cardObj.card.name}</span>`;
            } else if (cardObj.card.type === 'filler') {
                colorClass = ' ' + FILLER_COLOR_DEF.name;
                face.className = `card-face${colorClass}`;

                if (cardObj.card.isText) {
                    face.innerHTML = `
                        <span class="card-text">${cardObj.card.name}</span>
                    `;
                } else {
                    face.innerHTML = `
                        <img class="card-img" src="${cardObj.card.image}" alt="${cardObj.card.name}">
                    `;
                }
            } else {
                colorClass = ' ' + (this.categoryColorMap[cardObj.card.category] || '');
                face.className = `card-face${colorClass}`;

                if (cardObj.card.isText) {
                    face.innerHTML = `
                        <span class="card-text">${cardObj.card.name}</span>
                    `;
                } else {
                    face.innerHTML = `
                        <img class="card-img" src="${cardObj.card.image}" alt="${cardObj.card.name}">
                    `;
                }
            }

            // Stack count badge (only on top/face-up card)
            if (cardObj.faceUp) {
                const stackCount = this.getStackCountAt(cardObj.row, cardObj.col);
                if (stackCount > 1) {
                    const badge = document.createElement('span');
                    badge.className = 'stack-count-badge';
                    badge.textContent = stackCount;
                    face.appendChild(badge);
                }
            }

            inner.appendChild(face);

            el.appendChild(inner);

            // Clear justFlipped without playing animation —
            // revealed cards should appear instantly, not flip.
            cardObj.justFlipped = false;

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

        // Handle filler cards, gold grid cards, and regular cards
        if (cardObj.card.type === 'filler') {
            this.onFillerCardClick(cardObj);
        } else if (cardObj.card.type === 'gold') {
            this.onGoldGridCardClick(cardObj);
        } else {
            this.onRegularCardClick(cardObj);
        }
    }

    // ── Hand Area Interactions ────────────────────────────────

    onHandPileClick() {
        if (this.isAnimating || this.flyAnimCount > 0) return;

        if (this.handPile.length > 0) {
            // Flip top card from pile to display
            const card = this.handPile.pop();
            this.handDisplay.push(card);
            this.moveHistory.push({ action: 'flip_hand', card: { ...card } });
            this.renderHandArea();
            this.checkDeadState();
        } else if (this.handDisplay.length > 0) {
            // Recycle: reverse display back into pile (Klondike-style, no shuffle)
            this.moveHistory.push({
                action: 'recycle',
                displaySnapshot: this.handDisplay.map(c => ({ ...c })),
            });
            this.handPile = this.handDisplay.reverse();
            this.handDisplay = [];
            this.renderHandArea();
            this.checkDeadState();
        }
    }

    onHandDisplayClick() {
        if (this.isAnimating || this.flyAnimCount > 0) return;
        if (this.handDisplay.length === 0) return;

        const emptySlotIdx = this.findEmptySlot();
        if (emptySlotIdx === -1) {
            // Shake the display area
            this.handDisplayEl.classList.add('no-match-hand');
            setTimeout(() => this.handDisplayEl.classList.remove('no-match-hand'), 400);
            if (!this.timePaused) {
                this.timeLeft = Math.max(0, this.timeLeft - this.penaltyTime);
                this.renderTimer();
            }
            // Floating penalty above the hand display card
            const topCard = this.handDisplayEl.querySelector('.hand-display-card.topmost');
            if (topCard) {
                const penaltyEl = document.createElement('span');
                penaltyEl.className = 'time-penalty-card';
                penaltyEl.textContent = `-${this.penaltyTime}s`;
                topCard.appendChild(penaltyEl);
                setTimeout(() => penaltyEl.remove(), 1000);
            }
            return;
        }

        const card = this.handDisplay.pop();

        this.moveHistory.push({
            action: 'place_from_display',
            card: { ...card },
            slotIndex: emptySlotIdx,
        });

        this.slots[emptySlotIdx] = {
            key: card.category,
            name: card.name,
            collected: 0,
            target: this.categoryTargets[card.category] || 0,
            lastCard: null,
        };

        this.renderSlots();
        this.renderHandArea();
        this.checkDeadState();
    }

    renderHandArea() {
        if (!this.handPileEl || !this.handDisplayEl) return;
        this.handPileEl.innerHTML = '';
        this.handDisplayEl.innerHTML = '';

        // Remove old label if present, then add fresh label
        const handArea = document.getElementById('hand-area');
        const oldLabel = handArea.querySelector('.hand-area-label');
        if (oldLabel) oldLabel.remove();
        const label = document.createElement('span');
        label.className = 'hand-area-label';
        const totalHand = this.handPile.length + this.handDisplay.length;
        label.textContent = totalHand > 0 ? `DRAW` : '';
        handArea.insertBefore(label, handArea.firstChild);

        // Pile rendering
        if (this.handPile.length > 0) {
            // Show stacked card backs (up to 3 visual) + count badge
            const showCount = Math.min(this.handPile.length, 3);
            for (let i = 0; i < showCount; i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'hand-pile-card';
                cardBack.style.left = (i * 2) + 'px';
                cardBack.style.top = (-i * 2) + 'px';
                this.handPileEl.appendChild(cardBack);
            }
            if (this.handPile.length > 1) {
                const badge = document.createElement('span');
                badge.className = 'hand-pile-badge';
                badge.textContent = this.handPile.length;
                this.handPileEl.appendChild(badge);
            }
        } else if (this.handDisplay.length > 0) {
            // Show recover icon
            const recoverImg = document.createElement('img');
            recoverImg.className = 'recover-icon';
            recoverImg.src = 'res/Panel/recover.png';
            recoverImg.alt = 'Recycle';
            this.handPileEl.appendChild(recoverImg);
        }

        // Display rendering: show top 3 cards fanned out
        const displayCount = this.handDisplay.length;
        const showMax = Math.min(displayCount, 3);
        for (let i = 0; i < showMax; i++) {
            const idx = displayCount - showMax + i;
            const card = this.handDisplay[idx];
            const cardEl = document.createElement('div');
            const colorClass = this.categoryColorMap[card.category] || '';
            const isTop = (i === showMax - 1);
            cardEl.className = `hand-display-card ${colorClass}${isTop ? ' topmost' : ''}`;
            cardEl.style.left = (i * 18) + 'px';
            cardEl.innerHTML = `<span class="hand-card-name">${card.name}</span>`;
            this.handDisplayEl.appendChild(cardEl);
        }
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
            previousLastCard: slot.lastCard ? { ...slot.lastCard } : null,
        });

        const cardEl = this.gridEl.querySelector(`[data-card-id="${cardObj.id}"]`);
        const slotWrapper = this.collectorsEl.children[slotIdx];
        const slotCardEl = slotWrapper ? slotWrapper.querySelector('.slot-card') : null;

        // Capture animation source/target before model update changes the DOM
        let sourceRect, targetRect, cardHTML;
        if (cardEl && slotCardEl) {
            sourceRect = cardEl.getBoundingClientRect();
            targetRect = slotCardEl.getBoundingClientRect();
            cardHTML = cardEl.querySelector('.card-inner').innerHTML;
            cardEl.style.visibility = 'hidden';
        }

        // Detect if this collection will complete the slot
        const isLastCard = (slot.collected + 1 >= slot.target);
        const hasFlyAnim = !!(sourceRect && targetRect);
        const deferComplete = isLastCard && hasFlyAnim;

        // Update model and re-render immediately (don't wait for animation)
        // but defer slot completion if it's the last card with a fly animation
        this._finishRegularCollect(cardObj, slot, slotIdx, deferComplete);

        // Fire-and-forget fly animation (purely visual)
        if (sourceRect && targetRect) {
            this.flyAnimCount++;
            this.flyCard(sourceRect, targetRect, cardHTML).then(() => {
                this.flyAnimCount--;
                if (deferComplete) {
                    // Last card arrived — now clear the completed slot
                    this.completeSlot(slotIdx);
                    this.updateSlot(slotIdx);
                } else {
                    // Receiving pulse after fly animation arrives
                    const sw = this.collectorsEl.children[slotIdx];
                    const se = sw ? sw.querySelector('.slot-card') : null;
                    if (se) {
                        se.classList.add('receiving');
                        setTimeout(() => se.classList.remove('receiving'), 400);
                    }
                }
            });
        }
    }

    _finishRegularCollect(cardObj, slot, slotIdx, deferComplete = false) {
        cardObj.removed = true;

        if (cardObj.layer === 0) {
            this.cleared[cardObj.row][cardObj.col] = true;
        }

        this.updateFaceUpStates();
        slot.collected++;
        slot.lastCard = { ...cardObj.card };

        if (!deferComplete && slot.collected >= slot.target) {
            this.completeSlot(slotIdx);
        }

        // Snapshot old bingo lines, compute new ones
        const oldLines = [...this.bingoLines];
        const newLines = this.findBingoLines();
        const freshLines = this._findFreshBingoLines(oldLines, newLines);

        // Mark fresh bingo cells as pending so renderPyramid doesn't give them bingo-cell yet
        this._pendingBingoCells.clear();
        for (const line of freshLines) {
            for (const [r, c] of line.cells) {
                this._pendingBingoCells.add(r + ',' + c);
            }
        }

        // Update bingoLines before render so existing bingo cells show correctly
        this.bingoLines = newLines;

        // Only re-render the pyramid and the changed slot — not the entire UI
        this.renderPyramid();
        this.updateSlot(slotIdx);
        this.updateBingoCount();

        if (freshLines.length > 0) {
            // New BINGO line(s) detected — play animation, then check win
            this.isAnimating = true;
            this._animateBingoLines(freshLines).then(() => {
                this._pendingBingoCells.clear();
                this.isAnimating = false;
                if (newLines.length >= this.bingosNeeded) {
                    setTimeout(() => this.onWin(), 300);
                } else {
                    this.checkDeadState();
                }
            });
        } else {
            if (newLines.length >= this.bingosNeeded) {
                setTimeout(() => this.onWin(), 500);
            } else {
                this.checkDeadState();
            }
        }
    }

    // ── Filler Card Interaction ──────────────────────────────

    onFillerCardClick(cardObj) {
        // Fillers are non-removable — shake + time penalty
        const cardEl = this.gridEl.querySelector(`[data-card-id="${cardObj.id}"]`);
        if (cardEl) {
            cardEl.classList.add('no-match');
            setTimeout(() => cardEl.classList.remove('no-match'), 400);
            // Floating penalty above the card
            const penaltyEl = document.createElement('span');
            penaltyEl.className = 'time-penalty-card';
            penaltyEl.textContent = `-${this.penaltyTime}s`;
            cardEl.appendChild(penaltyEl);
            setTimeout(() => penaltyEl.remove(), 1000);
        }
        if (!this.timePaused) {
            this.timeLeft = Math.max(0, this.timeLeft - this.penaltyTime);
            this.renderTimer();
        }
    }

    // ── Gold Grid Card Interaction ───────────────────────────

    onGoldGridCardClick(cardObj) {
        const emptySlotIdx = this.findEmptySlot();
        if (emptySlotIdx === -1) {
            // No empty slot — shake + penalty (same as filler behavior)
            this.shakeCardById(cardObj.id);
            return;
        }

        // Record move for undo
        this.moveHistory.push({
            action: 'collect_gold_grid',
            cardId: cardObj.id,
            card: { ...cardObj.card },
            slotIndex: emptySlotIdx,
            layer: cardObj.layer,
            row: cardObj.row,
            col: cardObj.col,
        });

        // Capture animation source/target before model update
        const cardEl = this.gridEl.querySelector(`[data-card-id="${cardObj.id}"]`);
        const slotWrapper = this.collectorsEl.children[emptySlotIdx];
        const slotCardEl = slotWrapper ? slotWrapper.querySelector('.slot-card') : null;

        let sourceRect, targetRect, cardHTML;
        if (cardEl && slotCardEl) {
            sourceRect = cardEl.getBoundingClientRect();
            targetRect = slotCardEl.getBoundingClientRect();
            cardHTML = cardEl.querySelector('.card-inner').innerHTML;
            cardEl.style.visibility = 'hidden';
        }

        // Update model
        cardObj.removed = true;
        if (cardObj.layer === 0) {
            this.cleared[cardObj.row][cardObj.col] = true;
        }

        // Create the collection slot
        this.slots[emptySlotIdx] = {
            key: cardObj.card.category,
            name: cardObj.card.name,
            collected: 0,
            target: this.categoryTargets[cardObj.card.category] || 0,
            lastCard: null,
        };

        this.updateFaceUpStates();

        // Snapshot old bingo lines, compute new ones
        const oldLines = [...this.bingoLines];
        const newLines = this.findBingoLines();
        const freshLines = this._findFreshBingoLines(oldLines, newLines);

        this._pendingBingoCells.clear();
        for (const line of freshLines) {
            for (const [r, c] of line.cells) {
                this._pendingBingoCells.add(r + ',' + c);
            }
        }
        this.bingoLines = newLines;

        this.renderPyramid();
        this.renderSlots();
        this.updateBingoCount();

        // Fire fly animation
        if (sourceRect && targetRect) {
            this.flyAnimCount++;
            this.flyCard(sourceRect, targetRect, cardHTML).then(() => {
                this.flyAnimCount--;
                const sw = this.collectorsEl.children[emptySlotIdx];
                const se = sw ? sw.querySelector('.slot-card') : null;
                if (se) {
                    se.classList.add('receiving');
                    setTimeout(() => se.classList.remove('receiving'), 400);
                }
            });
        }

        if (freshLines.length > 0) {
            this.isAnimating = true;
            this._animateBingoLines(freshLines).then(() => {
                this._pendingBingoCells.clear();
                this.isAnimating = false;
                if (newLines.length >= this.bingosNeeded) {
                    setTimeout(() => this.onWin(), 300);
                } else {
                    this.checkDeadState();
                }
            });
        } else {
            if (newLines.length >= this.bingosNeeded) {
                setTimeout(() => this.onWin(), 500);
            } else {
                this.checkDeadState();
            }
        }
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
            // Floating penalty above the card
            const penaltyEl = document.createElement('span');
            penaltyEl.className = 'time-penalty-card';
            penaltyEl.textContent = `-${this.penaltyTime}s`;
            cardEl.appendChild(penaltyEl);
            setTimeout(() => penaltyEl.remove(), 1000);
        }
        // Penalty: lose time for invalid click
        if (!this.timePaused) {
            this.timeLeft = Math.max(0, this.timeLeft - this.penaltyTime);
            this.renderTimer();
        }
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
        // Four corners
        if (this.cleared[0][0] && this.cleared[0][4] && this.cleared[4][0] && this.cleared[4][4])
            lines.push({ type: 'corners', index: 0, cells: [[0,0],[0,4],[4,0],[4,4]] });
        return lines;
    }

    isCellInBingo(row, col) {
        return this.bingoLines.some(line =>
            line.cells.some(([r, c]) => r === row && c === col)
        );
    }

    _findFreshBingoLines(oldLines, newLines) {
        const oldKeys = new Set(oldLines.map(l => l.type + ':' + l.index));
        return newLines.filter(l => !oldKeys.has(l.type + ':' + l.index));
    }

    async _animateBingoLines(freshLines) {
        // Collect all unique cells from fresh lines
        const cellSet = new Set();
        const cells = [];
        for (const line of freshLines) {
            for (const [r, c] of line.cells) {
                const key = r + ',' + c;
                if (!cellSet.has(key)) {
                    cellSet.add(key);
                    cells.push([r, c]);
                }
            }
        }

        // Animate each cell to bingo star sequentially
        for (const [r, c] of cells) {
            await this._animateCellToBingoStar(r, c);
        }

        // Show BINGO flash text
        await this._showBingoFlash();
    }

    _animateCellToBingoStar(row, col) {
        return new Promise(resolve => {
            const mark = this.gridEl.querySelector(
                `.cleared-mark-pyramid[data-row="${row}"][data-col="${col}"]`
            );
            if (mark) {
                mark.classList.add('bingo-cell', 'bingo-star-pop');
            }
            setTimeout(resolve, 200);
        });
    }

    _showBingoFlash() {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'bingo-flash-overlay';
            const text = document.createElement('div');
            text.className = 'bingo-flash-text';
            text.textContent = 'BINGO!';
            overlay.appendChild(text);
            document.body.appendChild(overlay);

            // After display duration, fade out then remove
            setTimeout(() => {
                overlay.classList.add('bingo-flash-exit');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 400);
            }, 800);
        });
    }

    onWin() {
        this.stopTimer();
        const lines = this.bingoLines.length;
        document.getElementById('win-message').textContent =
            `You got ${lines} BINGO line${lines > 1 ? 's' : ''}! Level ${this.level} complete!`;
        this.winOverlay.classList.remove('hidden');
    }

    // ── Tools ────────────────────────────────────────────────

    showHint() {
        if (this.isAnimating || this.flyAnimCount > 0) return;

        // Priority 1: matching basic card in grid
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

        // Priority 1.5: gold card on grid + empty slot
        if (this.findEmptySlot() !== -1) {
            for (const cardObj of this.cards) {
                if (cardObj.removed || !cardObj.faceUp) continue;
                if (cardObj.card.type === 'gold') {
                    this.highlightCardById(cardObj.id);
                    return;
                }
            }
        }

        // Priority 2: place display card into empty slot
        if (this.handDisplay.length > 0 && this.findEmptySlot() !== -1) {
            this.handDisplayEl.classList.add('hint-highlight-hand');
            setTimeout(() => this.handDisplayEl.classList.remove('hint-highlight-hand'), 2000);
            return;
        }

        // Priority 3: flip from pile
        if (this.handPile.length > 0) {
            this.handPileEl.classList.add('hint-highlight-hand');
            setTimeout(() => this.handPileEl.classList.remove('hint-highlight-hand'), 2000);
            return;
        }

        // Priority 4: recycle
        if (this.handPile.length === 0 && this.handDisplay.length > 0) {
            this.handPileEl.classList.add('hint-highlight-hand');
            setTimeout(() => this.handPileEl.classList.remove('hint-highlight-hand'), 2000);
            return;
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
        if (this.isAnimating || this.flyAnimCount > 0) return;
        if (this.moveHistory.length === 0) return;

        const move = this.moveHistory.pop();

        if (move.action === 'collect_regular') {
            // Restore card to grid, decrement slot
            const cardObj = this.cards.find(c => c.id === move.cardId);
            cardObj.removed = false;
            cardObj.card = move.card;

            if (move.layer === 0) {
                this.cleared[move.row][move.col] = false;
            }

            if (this.slots[move.slotIndex] === null) {
                this.completedCount--;
                const catKey = move.card.category;
                this.slots[move.slotIndex] = {
                    key: catKey,
                    name: CATEGORIES[catKey].name,
                    collected: this.categoryTargets[catKey] - 1,
                    target: this.categoryTargets[catKey],
                    lastCard: move.previousLastCard || null,
                };
            } else {
                this.slots[move.slotIndex].collected--;
                this.slots[move.slotIndex].lastCard = move.previousLastCard || null;
            }

            this.updateFaceUpStates();
        } else if (move.action === 'collect_gold_grid') {
            // Restore gold card to grid, clear the slot it created
            const cardObj = this.cards.find(c => c.id === move.cardId);
            cardObj.removed = false;
            cardObj.card = move.card;

            if (move.layer === 0) {
                this.cleared[move.row][move.col] = false;
            }

            this.slots[move.slotIndex] = null;
            this.updateFaceUpStates();
        } else if (move.action === 'place_from_display') {
            // Clear slot, push card back to display
            this.slots[move.slotIndex] = null;
            this.handDisplay.push(move.card);
        } else if (move.action === 'flip_hand') {
            // Pop from display, push back to pile
            this.handDisplay.pop();
            this.handPile.push(move.card);
        } else if (move.action === 'recycle') {
            // Restore display from saved snapshot, clear pile
            this.handDisplay = move.displaySnapshot.map(c => ({ ...c }));
            this.handPile = [];
        }

        // Only re-render what changed
        if (move.action === 'collect_regular' || move.action === 'collect_gold_grid') {
            this.render();
        } else {
            this.renderSlots();
            this.renderHandArea();
        }
    }

    // ── Fly Animation ──────────────────────────────────────────

    flyCard(sourceRect, targetRect, cardHTML, duration = 400) {
        return new Promise(resolve => {
            const clone = document.createElement('div');
            clone.className = 'flying-card';
            clone.innerHTML = cardHTML;
            clone.style.left = sourceRect.left + 'px';
            clone.style.top = sourceRect.top + 'px';
            clone.style.width = sourceRect.width + 'px';
            clone.style.height = sourceRect.height + 'px';
            document.body.appendChild(clone);

            // Force layout before starting transition
            clone.offsetHeight;

            clone.style.transition = `all ${duration}ms ease-in-out`;
            clone.style.left = targetRect.left + 'px';
            clone.style.top = targetRect.top + 'px';
            clone.style.width = targetRect.width + 'px';
            clone.style.height = targetRect.height + 'px';

            setTimeout(() => {
                clone.remove();
                resolve();
            }, duration);
        });
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
