/**
 * Solitaire Tile – v7.0 (SAJLike)
 *
 * Traditional solitaire-style gameplay:
 * - Tableau columns with face-down/face-up cards
 * - Hand pile (draw pile) + display area (max 3)
 * - Collector slots (category card first, then basic cards)
 * - Same-category stacking on columns; category card seals column
 * - No Bingo, no Filler cards
 */

// ─── Constants ────────────────────────────────────────────────

const MAX_SLOTS = 5;
const LEVEL_SCAN_MAX = 50;
const CARD_W = 60;
const CARD_H = 70;
const FACE_DOWN_H = 20; // visible height of face-down card in column
const FACE_UP_OFFSET = 20; // visible height of face-up card before next card overlaps

function getContainerInnerWidth() {
    const container = document.getElementById('game-container');
    if (container) {
        const style = getComputedStyle(container);
        return container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    }
    return 376;
}

// ─── Game ────────────────────────────────────────────────────

class Game {
    constructor() {
        this.level = 1;
        this.tableau = [];        // Array<Array<TableauCard>>
        this.slots = [];
        this.completedCount = 0;
        this.numCategories = 0;
        this.moveHistory = [];
        this.isAnimating = false;
        this.flyAnimCount = 0;
        this.categoryColorMap = {};
        this.categoryTargets = {};
        this.maxSlots = 3;
        this.retryBonus = {};
        this.handPile = [];
        this.handDisplay = [];

        // Chinese mode
        this.zhMode = false;

        // Step system
        this.stepsLeft = 0;
        this.maxSteps = 40;

        // Drag system
        this.dragState = null;

        // DOM refs
        this.tableauEl = document.getElementById('tableau');
        this.stepsEl = document.getElementById('steps-count');
        this.collectorsEl = document.getElementById('collectors');
        this.levelLabelEl = document.getElementById('level-label');
        this.winOverlay = document.getElementById('win-overlay');
        this.loseOverlay = document.getElementById('lose-overlay');
        this.levelOverlay = document.getElementById('level-overlay');
        this.levelGridEl = document.getElementById('level-grid');
        this.handDisplayEl = document.getElementById('hand-display');
        this.handPileEl = document.getElementById('hand-pile');

        document.getElementById('btn-hint').addEventListener('click', () => this.showHint());
        document.getElementById('btn-undo').addEventListener('click', () => this.undo());
        document.getElementById('btn-next-level').addEventListener('click', () => this.nextLevel());
        document.getElementById('btn-retry').addEventListener('click', () => this.retry());
        document.getElementById('btn-continue').addEventListener('click', () => this.continueWithSteps());
        document.getElementById('menu-btn').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('btn-close-levels').addEventListener('click', () => this.hideLevelSelect());
        document.getElementById('btn-zh').addEventListener('click', () => this.toggleZhMode());

        // Hand pile: click to flip (not drag)
        this._lastTouchTime = 0;
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

        this.initDragSystem();

        this.levelData = {};
        this.availableLevels = new Set();
        this.init();
    }

    // ── Drag System ─────────────────────────────────────────────

    initDragSystem() {
        document.addEventListener('pointerdown', (e) => this.onDragStart(e));
        document.addEventListener('pointermove', (e) => this.onDragMove(e));
        document.addEventListener('pointerup', (e) => this.onDragEnd(e));
        document.addEventListener('pointercancel', (e) => this.onDragEnd(e));
    }

    onDragStart(e) {
        if (this.isAnimating || this.flyAnimCount > 0) return;
        if (this.dragState) return;

        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return;

        let cardData = null;
        let sourceType = null;
        let sourceInfo = null;
        let sourceEl = null;

        // Check tableau cards (any face-up card — drags all cards from that position down)
        // When same-category cards are stacked together, auto-expand to drag them all
        const tableauCard = target.closest('.tableau-card');
        if (tableauCard && tableauCard.classList.contains('face-up')) {
            const colIdx = Number(tableauCard.dataset.colIdx);
            let posIdx = Number(tableauCard.dataset.posIdx);
            const col = this.tableau[colIdx];
            if (col && posIdx < col.length) {
                // Expand downward: include consecutive same-category face-up cards
                const clickedCategory = col[posIdx].card.category;
                while (posIdx > 0
                    && col[posIdx - 1].faceUp
                    && col[posIdx - 1].card.category === clickedCategory) {
                    posIdx--;
                }
                const tc = col[posIdx];
                cardData = tc;
                sourceType = 'tableau';
                sourceInfo = { colIdx, posIdx };
                // Use the element of the expanded start position
                sourceEl = this.tableauEl.querySelector(
                    `.tableau-card[data-col-idx="${colIdx}"][data-pos-idx="${posIdx}"]`
                ) || tableauCard;
            }
        }

        // Check hand display top card
        if (!cardData) {
            const handCard = target.closest('.hand-display-card.topmost');
            if (handCard && this.handDisplay.length > 0) {
                const topCard = this.handDisplay[this.handDisplay.length - 1];
                cardData = { card: topCard, _isHandDisplay: true };
                sourceType = 'hand_display';
                sourceInfo = {};
                sourceEl = handCard;
            }
        }

        if (!cardData || !sourceEl) return;

        e.preventDefault();

        const rect = sourceEl.getBoundingClientRect();
        const dragCount = sourceType === 'tableau'
            ? this.tableau[sourceInfo.colIdx].length - sourceInfo.posIdx
            : 1;

        // Create drag clone (multi-card stack for tableau)
        const clone = document.createElement('div');
        clone.className = 'drag-clone';
        if (dragCount > 1) {
            // Build stacked clone showing all cards being dragged
            clone.style.position = 'fixed';
            clone.style.width = CARD_W + 'px';
            const stackHeight = (dragCount - 1) * FACE_UP_OFFSET + CARD_H;
            clone.style.height = stackHeight + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.top = rect.top + 'px';
            const col = this.tableau[sourceInfo.colIdx];
            for (let i = 0; i < dragCount; i++) {
                const idx = sourceInfo.posIdx + i;
                const srcCardEl = this.tableauEl.querySelector(
                    `.tableau-card[data-col-idx="${sourceInfo.colIdx}"][data-pos-idx="${idx}"]`
                );
                if (srcCardEl) {
                    const cardClone = srcCardEl.cloneNode(true);
                    cardClone.style.position = 'absolute';
                    cardClone.style.left = '0';
                    cardClone.style.top = (i * FACE_UP_OFFSET) + 'px';
                    cardClone.style.width = CARD_W + 'px';
                    cardClone.style.height = CARD_H + 'px';
                    cardClone.classList.remove('covered', 'dragging-source');
                    clone.appendChild(cardClone);
                    srcCardEl.style.display = 'none';
                }
            }
        } else {
            // Single card (tableau or hand display) — clone the whole element
            const cardClone = sourceEl.cloneNode(true);
            cardClone.style.position = 'relative';
            cardClone.style.top = '0';
            cardClone.style.left = '0';
            cardClone.style.width = '100%';
            cardClone.style.height = '100%';
            clone.appendChild(cardClone);
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.top = rect.top + 'px';
            sourceEl.style.display = 'none';
        }

        // Reveal the card below the dragged card(s) — expand to full size
        if (sourceType === 'tableau' && sourceInfo.posIdx > 0) {
            const revealIdx = sourceInfo.posIdx - 1;
            const revealEl = this.tableauEl.querySelector(
                `.tableau-card[data-col-idx="${sourceInfo.colIdx}"][data-pos-idx="${revealIdx}"]`
            );
            if (revealEl) {
                if (revealEl.classList.contains('covered')) {
                    revealEl.classList.remove('covered');
                }
                if (revealEl.classList.contains('face-down')) {
                    // Expand face-down card to show full card back
                    revealEl.style.height = CARD_H + 'px';
                    revealEl.style.borderRadius = '8px';
                    const backEl = revealEl.querySelector('.card-back');
                    if (backEl) {
                        backEl.style.borderRadius = '8px';
                        backEl.style.boxShadow = '';
                    }
                }
                revealEl.style.height = CARD_H + 'px';
                revealEl.style.overflow = '';
            }
        }

        document.body.appendChild(clone);

        this.dragState = {
            cardData,
            sourceType,
            sourceInfo,
            sourceEl,
            clone,
            dragCount,
            sourceRect: rect,
            startX: e.clientX,
            startY: e.clientY,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            hasMoved: false,
        };

        this._highlightDropTargets(cardData, sourceType, sourceInfo);
    }

    onDragMove(e) {
        if (!this.dragState) return;
        e.preventDefault();

        const { clone, offsetX, offsetY } = this.dragState;
        clone.style.left = (e.clientX - offsetX) + 'px';
        clone.style.top = (e.clientY - offsetY) + 'px';

        const dx = e.clientX - this.dragState.startX;
        const dy = e.clientY - this.dragState.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            this.dragState.hasMoved = true;
        }
    }

    onDragEnd(e) {
        if (!this.dragState) return;

        const { cardData, sourceType, sourceInfo, sourceEl, clone, dragCount, sourceRect, hasMoved } = this.dragState;

        this._clearDropTargets();

        if (!hasMoved) {
            clone.remove();
            this.dragState = null;
            // Re-render to restore hidden cards
            this.render();
            return;
        }

        const dropResult = this._checkDrop(e.clientX, e.clientY, cardData, sourceType, sourceInfo);

        if (dropResult.success) {
            const targetRect = dropResult.targetRect;
            clone.style.transition = 'all 0.2s ease-out';
            clone.style.left = targetRect.left + 'px';
            clone.style.top = targetRect.top + 'px';
            clone.style.width = targetRect.width + 'px';
            clone.style.height = targetRect.height + 'px';

            setTimeout(() => {
                clone.remove();
                this.handleDrop(cardData, sourceType, sourceInfo, dropResult);
            }, 200);
        } else {
            // Snap back to saved source position
            clone.style.transition = 'all 0.25s ease-out';
            clone.style.left = sourceRect.left + 'px';
            clone.style.top = sourceRect.top + 'px';
            setTimeout(() => {
                clone.remove();
                // Re-render to restore all hidden cards
                this.render();
            }, 250);
        }

        this.dragState = null;
    }

    _highlightDropTargets(cardData, sourceType, sourceInfo) {
        const card = cardData._isHandDisplay ? cardData.card : cardData.card;
        if (!card) return;

        // Determine drag count
        const dragCount = sourceType === 'tableau'
            ? this.tableau[sourceInfo.colIdx].length - sourceInfo.posIdx
            : 1;

        // Highlight valid collector slots
        const slotWrappers = this.collectorsEl.children;
        for (let i = 0; i < this.maxSlots; i++) {
            const wrapper = slotWrappers[i];
            if (!wrapper) continue;
            const slotCardEl = wrapper.querySelector('.slot-card');
            if (!slotCardEl) continue;

            if (dragCount === 1) {
                // Single card: original logic
                const slot = this.slots[i];
                if (card.type === 'gold' && slot === null) {
                    slotCardEl.classList.add('drop-target');
                } else if (card.type === 'regular' && slot !== null &&
                           slot.key === card.category && slot.collected < slot.target) {
                    slotCardEl.classList.add('drop-target');
                }
            } else if (sourceType === 'tableau') {
                // Multi-card: check stack compatibility
                if (this._canMultiDropToSlot(sourceInfo.colIdx, sourceInfo.posIdx, i)) {
                    slotCardEl.classList.add('drop-target');
                }
            }
        }

        // Highlight valid tableau columns
        const colEls = this.tableauEl.querySelectorAll('.tableau-column');
        for (let i = 0; i < this.tableau.length; i++) {
            // Don't highlight source column
            if (sourceType === 'tableau' && sourceInfo.colIdx === i) continue;
            if (this.canStackOnColumn(card, i)) {
                colEls[i]?.classList.add('drop-target');
            }
        }
    }

    _clearDropTargets() {
        document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    }

    _checkDrop(x, y, cardData, sourceType, sourceInfo) {
        const card = cardData._isHandDisplay ? cardData.card : cardData.card;
        if (!card) return { success: false };

        // Determine drag count
        const dragCount = sourceType === 'tableau'
            ? this.tableau[sourceInfo.colIdx].length - sourceInfo.posIdx
            : 1;

        // Check collector slots
        const slotWrappers = this.collectorsEl.children;
        for (let i = 0; i < this.maxSlots; i++) {
            const wrapper = slotWrappers[i];
            if (!wrapper) continue;
            const slotCardEl = wrapper.querySelector('.slot-card');
            if (!slotCardEl) continue;

            const rect = slotCardEl.getBoundingClientRect();
            const expanded = {
                left: rect.left - 15, right: rect.right + 15,
                top: rect.top - 15, bottom: rect.bottom + 15,
            };

            if (x >= expanded.left && x <= expanded.right &&
                y >= expanded.top && y <= expanded.bottom) {
                if (this._isValidSlotDrop(card, sourceType, sourceInfo, dragCount, i)) {
                    return { success: true, targetType: 'slot', slotIdx: i, targetRect: rect };
                }
            }
        }

        // Check tableau columns
        const colEls = this.tableauEl.querySelectorAll('.tableau-column');
        for (let i = 0; i < this.tableau.length; i++) {
            if (sourceType === 'tableau' && sourceInfo.colIdx === i) continue;
            const colEl = colEls[i];
            if (!colEl) continue;

            const rect = colEl.getBoundingClientRect();
            const expanded = {
                left: rect.left - 8, right: rect.right + 8,
                top: rect.top - 8, bottom: rect.bottom + 8,
            };

            if (x >= expanded.left && x <= expanded.right &&
                y >= expanded.top && y <= expanded.bottom) {
                if (this.canStackOnColumn(card, i)) {
                    // Use a card-sized rect at the drop position (bottom of column)
                    const cardRect = {
                        left: rect.left,
                        top: rect.bottom - CARD_H,
                        width: CARD_W,
                        height: CARD_H,
                    };
                    return { success: true, targetType: 'column', colIdx: i, targetRect: cardRect };
                }
            }
        }

        return { success: false };
    }

    // ── Stacking Rules ──────────────────────────────────────────

    canStackOnColumn(card, colIdx) {
        const col = this.tableau[colIdx];
        if (!col || col.length === 0) return true; // empty column accepts anything

        const topCard = col[col.length - 1];
        // If top card is a category (gold) card = sealed, nothing can stack
        if (topCard.card.type === 'gold') return false;

        // Both regular and gold cards can stack if same category
        return card.category === topCard.card.category;
    }

    // Check if a single card can drop to a slot (used by _isValidSlotDrop)
    _isValidSlotDrop(card, sourceType, sourceInfo, dragCount, slotIdx) {
        if (dragCount === 1) {
            // Single card: original logic
            const slot = this.slots[slotIdx];
            if (card.type === 'gold' && slot === null) return true;
            if (card.type === 'regular' && slot !== null &&
                slot.key === card.category && slot.collected < slot.target) return true;
            return false;
        }
        // Multi-card: delegate to multi check
        if (sourceType === 'tableau') {
            return this._canMultiDropToSlot(sourceInfo.colIdx, sourceInfo.posIdx, slotIdx);
        }
        return false;
    }

    // Check if a multi-card stack from tableau can drop to a slot
    _canMultiDropToSlot(colIdx, posIdx, slotIdx) {
        const col = this.tableau[colIdx];
        const cards = col.slice(posIdx); // bottom-to-top of dragged stack
        if (cards.length <= 1) return false;

        const topCard = cards[cards.length - 1]; // visual top = last card in array
        const slot = this.slots[slotIdx];

        // Case 1: Top card is gold, slot is empty → create slot + collect regulars
        if (topCard.card.type === 'gold' && slot === null) {
            const cat = topCard.card.category;
            // All other cards must be regular of the same category
            return cards.slice(0, -1).every(c => c.card.type === 'regular' && c.card.category === cat);
        }

        // Case 2: All cards are regular, matching existing slot with enough room
        if (slot !== null && slot.collected < slot.target) {
            const cat = slot.key;
            const allRegularMatch = cards.every(c => c.card.type === 'regular' && c.card.category === cat);
            if (allRegularMatch && slot.collected + cards.length <= slot.target) return true;
        }

        return false;
    }

    // ── Drop Handler ────────────────────────────────────────────

    handleDrop(cardData, sourceType, sourceInfo, dropResult) {
        if (dropResult.targetType === 'slot') {
            this._handleDropToSlot(cardData, sourceType, sourceInfo, dropResult.slotIdx);
        } else if (dropResult.targetType === 'column') {
            this._handleDropToColumn(cardData, sourceType, sourceInfo, dropResult.colIdx);
        }
    }

    _handleDropToSlot(cardData, sourceType, sourceInfo, slotIdx) {
        const card = cardData._isHandDisplay ? cardData.card : cardData.card;

        // Check for multi-card drop from tableau
        if (sourceType === 'tableau') {
            const col = this.tableau[sourceInfo.colIdx];
            const dragCount = col.length - sourceInfo.posIdx;

            if (dragCount > 1) {
                this._handleMultiDropToSlot(sourceInfo.colIdx, sourceInfo.posIdx, slotIdx);
                return;
            }
        }

        if (card.type === 'gold') {
            // Gold card → create slot
            if (sourceType === 'tableau') {
                const col = this.tableau[sourceInfo.colIdx];
                const removed = col.pop();
                const autoFlipped = this.autoFlipColumn(sourceInfo.colIdx);

                this.moveHistory.push({
                    action: 'move_tableau_to_slot',
                    colIdx: sourceInfo.colIdx,
                    tableauCard: { ...removed, card: { ...removed.card } },
                    slotIdx,
                    slotWasNull: true,
                    autoFlipped,
                });

                this.slots[slotIdx] = {
                    key: card.category,
                    name: card.name,
                    zhName: card.zhName || '',
                    collected: 0,
                    target: this.categoryTargets[card.category] || 0,
                    lastCard: null,
                    _animateIn: true,
                };
            } else if (sourceType === 'hand_display') {
                const displayCard = this.handDisplay.pop();
                this.moveHistory.push({
                    action: 'move_display_to_slot',
                    card: { ...displayCard },
                    slotIdx,
                    slotWasNull: true,
                });

                this.slots[slotIdx] = {
                    key: displayCard.category,
                    name: displayCard.name,
                    zhName: displayCard.zhName || '',
                    collected: 0,
                    target: this.categoryTargets[displayCard.category] || 0,
                    lastCard: null,
                    _animateIn: true,
                };
            }
        } else if (card.type === 'regular') {
            // Regular card → match to slot
            const slot = this.slots[slotIdx];
            const previousLastCard = slot.lastCard ? { ...slot.lastCard } : null;

            if (sourceType === 'tableau') {
                const col = this.tableau[sourceInfo.colIdx];
                const removed = col.pop();
                const autoFlipped = this.autoFlipColumn(sourceInfo.colIdx);

                this.moveHistory.push({
                    action: 'move_tableau_to_slot',
                    colIdx: sourceInfo.colIdx,
                    tableauCard: { ...removed, card: { ...removed.card } },
                    slotIdx,
                    slotWasNull: false,
                    previousCollected: slot.collected,
                    previousLastCard,
                    autoFlipped,
                });

                slot.collected++;
                slot.lastCard = { ...card };
                if (slot.collected >= slot.target) {
                    this.completeSlot(slotIdx);
                }
            } else if (sourceType === 'hand_display') {
                const displayCard = this.handDisplay.pop();
                this.moveHistory.push({
                    action: 'move_display_to_slot',
                    card: { ...displayCard },
                    slotIdx,
                    slotWasNull: false,
                    previousCollected: slot.collected,
                    previousLastCard,
                });

                slot.collected++;
                slot.lastCard = { ...displayCard };
                if (slot.collected >= slot.target) {
                    this.completeSlot(slotIdx);
                }
            }
        }

        this.decrementStep();
        this.render();
        this.checkWinOrDead();
    }

    _handleMultiDropToSlot(colIdx, posIdx, slotIdx) {
        const col = this.tableau[colIdx];
        const cards = col.slice(posIdx); // snapshot before splice
        const topCard = cards[cards.length - 1];
        const slot = this.slots[slotIdx];

        // Save state for undo
        const removedCards = col.splice(posIdx);
        const autoFlipped = this.autoFlipColumn(colIdx);

        if (topCard.card.type === 'gold' && slot === null) {
            // Case: gold on top + regulars below → create slot and collect regulars
            const cat = topCard.card.category;
            const regularCount = removedCards.length - 1;

            this.slots[slotIdx] = {
                key: cat,
                name: topCard.card.name,
                zhName: topCard.card.zhName || '',
                collected: regularCount,
                target: this.categoryTargets[cat] || 0,
                lastCard: regularCount > 0 ? { ...removedCards[regularCount - 1].card } : null,
                _animateIn: true,
            };

            this.moveHistory.push({
                action: 'move_multi_tableau_to_slot',
                colIdx,
                slotIdx,
                removedCards: removedCards.map(tc => ({ id: tc.id, card: { ...tc.card }, faceUp: tc.faceUp })),
                slotWasNull: true,
                autoFlipped,
                count: removedCards.length,
            });

            if (this.slots[slotIdx].collected >= this.slots[slotIdx].target) {
                this.completeSlot(slotIdx);
            }
        } else if (slot !== null) {
            // Case: all regulars → add to existing slot
            const previousCollected = slot.collected;
            const previousLastCard = slot.lastCard ? { ...slot.lastCard } : null;

            slot.collected += removedCards.length;
            slot.lastCard = { ...removedCards[removedCards.length - 1].card };

            this.moveHistory.push({
                action: 'move_multi_tableau_to_slot',
                colIdx,
                slotIdx,
                removedCards: removedCards.map(tc => ({ id: tc.id, card: { ...tc.card }, faceUp: tc.faceUp })),
                slotWasNull: false,
                previousCollected,
                previousLastCard,
                autoFlipped,
                count: removedCards.length,
            });

            if (slot.collected >= slot.target) {
                this.completeSlot(slotIdx);
            }
        }

        this.decrementStep();
        this.render();
        this.checkWinOrDead();
    }

    _handleDropToColumn(cardData, sourceType, sourceInfo, targetColIdx) {
        const card = cardData._isHandDisplay ? cardData.card : cardData.card;

        if (sourceType === 'tableau') {
            const srcCol = this.tableau[sourceInfo.colIdx];
            const dragCount = srcCol.length - sourceInfo.posIdx;

            if (dragCount > 1) {
                // Multi-card move: splice all cards from posIdx to end
                const removedCards = srcCol.splice(sourceInfo.posIdx);
                const autoFlipped = this.autoFlipColumn(sourceInfo.colIdx);

                const newCards = [];
                for (const tc of removedCards) {
                    const newTC = { id: this._nextCardId++, card: { ...tc.card }, faceUp: true };
                    this.tableau[targetColIdx].push(newTC);
                    newCards.push(newTC);
                }

                this.moveHistory.push({
                    action: 'move_multi_tableau_to_column',
                    srcColIdx: sourceInfo.colIdx,
                    targetColIdx,
                    removedCards: removedCards.map(tc => ({ id: tc.id, card: { ...tc.card }, faceUp: tc.faceUp })),
                    newCardIds: newCards.map(tc => tc.id),
                    autoFlipped,
                    count: dragCount,
                });
            } else {
                // Single card move
                const removed = srcCol.pop();
                const autoFlipped = this.autoFlipColumn(sourceInfo.colIdx);

                const newTC = { id: this._nextCardId++, card: { ...card }, faceUp: true };
                this.tableau[targetColIdx].push(newTC);

                this.moveHistory.push({
                    action: 'move_tableau_to_column',
                    srcColIdx: sourceInfo.colIdx,
                    targetColIdx,
                    tableauCard: { ...removed, card: { ...removed.card } },
                    newCardId: newTC.id,
                    autoFlipped,
                });
            }
        } else if (sourceType === 'hand_display') {
            const displayCard = this.handDisplay.pop();

            const newTC = { id: this._nextCardId++, card: { ...displayCard }, faceUp: true };
            this.tableau[targetColIdx].push(newTC);

            this.moveHistory.push({
                action: 'move_display_to_column',
                card: { ...displayCard },
                targetColIdx,
                newCardId: newTC.id,
            });
        }

        this.decrementStep();
        this.render();
        this.checkWinOrDead();
    }

    autoFlipColumn(colIdx) {
        const col = this.tableau[colIdx];
        if (col.length === 0) return false;
        const topCard = col[col.length - 1];
        if (!topCard.faceUp) {
            topCard.faceUp = true;
            topCard.justFlipped = true;
            return true;
        }
        return false;
    }

    // ── Layout Restore ─────────────────────────────────────────

    restoreLayout(layout) {
        this.completedCount = 0;
        this.slots = new Array(this.maxSlots).fill(null);
        this.categoryTargets = { ...layout.categoryTargets };

        // Build color map from all cards
        const allCatKeys = new Set();
        if (layout.tableau) {
            for (const col of layout.tableau) {
                for (const tc of col) {
                    if (tc.card.category) allCatKeys.add(tc.card.category);
                }
            }
        }
        if (layout.cards) {
            for (const c of layout.cards) {
                if (c.card.category) allCatKeys.add(c.card.category);
            }
        }
        (layout.handPile || []).forEach(c => { if (c.category) allCatKeys.add(c.category); });

        this.categoryColorMap = {};
        [...allCatKeys].forEach((key, i) => {
            this.categoryColorMap[key] = CARD_COLORS[i % CARD_COLORS.length];
        });

        this._nextCardId = 0;

        // Restore tableau
        if (layout.tableau) {
            // New format: tableau is Array<Array<{card, faceUp}>>
            this.tableau = layout.tableau.map(col =>
                col.map(tc => ({
                    id: this._nextCardId++,
                    card: { ...tc.card },
                    faceUp: tc.faceUp !== undefined ? tc.faceUp : true,
                    justFlipped: false,
                }))
            );
        } else if (layout.cards) {
            // Legacy conversion: cards with colIndex/position
            const colMap = {};
            for (const c of layout.cards) {
                const ci = c.colIndex !== undefined ? c.colIndex : (c.col !== undefined ? c.col : 0);
                if (!colMap[ci]) colMap[ci] = [];
                colMap[ci].push(c);
            }
            this.tableau = [];
            const colIndices = Object.keys(colMap).map(Number).sort((a, b) => a - b);
            for (const ci of colIndices) {
                const cards = colMap[ci].sort((a, b) => (a.position || 0) - (b.position || 0));
                this.tableau.push(cards.map((c, idx) => ({
                    id: this._nextCardId++,
                    card: { ...c.card },
                    faceUp: idx === cards.length - 1, // bottom card face-up
                    justFlipped: false,
                })));
            }
        }

        this.handPile = (layout.handPile || []).map(c => ({ ...c }));
        this.handDisplay = (layout.handDisplay || []).map(c => ({ ...c }));
    }

    async init() {
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
        this.level = level;
        this.moveHistory = [];
        this.levelLabelEl.textContent = `Level ${level}`;
        this._nextCardId = 0;

        const baseConfig = getLevelSettings(level);
        const layouts = this.levelData[level];
        let config = baseConfig;
        let selectedLayout = null;

        if (layouts && layouts.length > 0) {
            const idx = Math.floor(Math.random() * layouts.length);
            selectedLayout = layouts[idx];
            if (selectedLayout.config) {
                config = { ...baseConfig, ...selectedLayout.config };
            }
        }

        this.numCategories = config.numCategories;
        this.maxSlots = config.maxSlots;

        const bonus = this.retryBonus[level] || 0;
        this.maxSteps = config.maxSteps + bonus;
        this.stepsLeft = this.maxSteps;

        if (selectedLayout) {
            this.restoreLayout(selectedLayout);
        } else {
            this.completedCount = 0;
            this.slots = new Array(this.maxSlots).fill(null);
            this.generateCards(config);
        }

        this.injectZhNames(level);
        this.render();
        setTimeout(() => this.checkDeadState(), 100);
    }

    generateCards(config) {
        const shuffledCats = this.shuffleArray([...ALL_CATEGORY_KEYS]);
        const activeCatKeys = shuffledCats.slice(0, config.numCategories);

        this.categoryColorMap = {};
        activeCatKeys.forEach((key, i) => {
            this.categoryColorMap[key] = CARD_COLORS[i % CARD_COLORS.length];
        });

        // Build gold and regular cards (no fillers)
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

        // Total cards needed = tableau + hand pile
        const totalColumnCards = config.totalColumnCards;
        const handPileSize = Math.max(config.numCategories, Math.round(totalColumnCards * 0.4));
        const totalNeeded = totalColumnCards + handPileSize;

        const allCards = [...regularCards, ...goldCards];

        // Pad if needed
        while (allCards.length < totalNeeded) {
            const catKey = activeCatKeys[Math.floor(Math.random() * activeCatKeys.length)];
            const cat = CATEGORIES[catKey];
            const item = cat.items[Math.floor(Math.random() * cat.items.length)];
            allCards.push({
                type: 'regular',
                category: catKey,
                name: item.name,
                image: item.image,
                isText: cat.isText,
            });
            regularCountPerCat[catKey]++;
            this.categoryTargets[catKey] = regularCountPerCat[catKey];
        }

        this.shuffleArray(allCards);

        // Split: first totalColumnCards go to tableau, rest to hand pile
        const tableauCards = allCards.slice(0, totalColumnCards);
        const handCards = allCards.slice(totalColumnCards);

        this.handPile = handCards;
        this.handDisplay = [];

        // Distribute to columns
        this.tableau = [];
        this._nextCardId = 0;
        let cardIdx = 0;

        for (let ci = 0; ci < config.numColumns; ci++) {
            const colSize = config.columnSizes[ci];
            const col = [];
            for (let pos = 0; pos < colSize; pos++) {
                if (cardIdx >= tableauCards.length) break;
                const card = tableauCards[cardIdx++];
                const isFaceUp = (pos === colSize - 1); // only bottom card face-up
                col.push({
                    id: this._nextCardId++,
                    card,
                    faceUp: isFaceUp,
                    justFlipped: false,
                });
            }
            this.tableau.push(col);
        }
    }

    // ── Step System ─────────────────────────────────────────

    renderSteps() {
        this.stepsEl.textContent = this.stepsLeft;
        this.stepsEl.classList.toggle('low', this.stepsLeft <= 5);
    }

    decrementStep() {
        this.stepsLeft--;
        this.renderSteps();
        if (this.stepsLeft <= 0) {
            this.onLose('No more steps!');
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
        this.retryBonus[this.level] = (this.retryBonus[this.level] || 0) + 5;
        this.startLevel(this.level);
    }

    continueWithSteps() {
        this.loseOverlay.classList.add('hidden');
        this.stepsLeft += 10;
        this.maxSteps += 10;
        this.renderSteps();
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

    // ── Win / Dead State ─────────────────────────────────────

    checkWinOrDead() {
        if (this.checkWin()) return;
        this.checkDeadState();
    }

    checkWin() {
        if (this.completedCount >= this.numCategories) {
            setTimeout(() => this.onWin(), 300);
            return true;
        }
        return false;
    }

    checkDeadState() {
        if (this.stepsLeft <= 0) return;
        if (this.hasValidMoves()) return;
        setTimeout(() => this.onLose(), 300);
    }

    hasValidMoves() {
        const hasEmptySlot = this.findEmptySlot() !== -1;
        const activeKeys = new Set(
            this.slots.filter(s => s !== null && s.collected < s.target).map(s => s.key)
        );

        // 1. Tableau bottom cards → slot
        for (let ci = 0; ci < this.tableau.length; ci++) {
            const col = this.tableau[ci];
            if (col.length === 0) continue;
            const topCard = col[col.length - 1];
            if (!topCard.faceUp) continue;
            if (topCard.card.type === 'gold' && topCard.card.type !== 'sealed') {
                if (hasEmptySlot) return true;
            }
            if (topCard.card.type === 'regular' && activeKeys.has(topCard.card.category)) return true;
        }

        // 2. Tableau face-up cards → other columns (including multi-card moves)
        for (let ci = 0; ci < this.tableau.length; ci++) {
            const col = this.tableau[ci];
            if (col.length === 0) continue;
            // Check every face-up card as a potential drag start
            for (let p = 0; p < col.length; p++) {
                if (!col[p].faceUp) continue;
                for (let ti = 0; ti < this.tableau.length; ti++) {
                    if (ti === ci) continue;
                    if (this.canStackOnColumn(col[p].card, ti)) return true;
                }
            }
        }

        // 3. Hand display → slot or column
        if (this.handDisplay.length > 0) {
            const topCard = this.handDisplay[this.handDisplay.length - 1];
            if (topCard.type === 'gold' && hasEmptySlot) return true;
            if (topCard.type === 'regular' && activeKeys.has(topCard.category)) return true;
            // Hand display → column
            for (let ti = 0; ti < this.tableau.length; ti++) {
                if (this.canStackOnColumn(topCard, ti)) return true;
            }
        }

        // 4. Flip from hand pile
        if (this.handPile.length > 0) return true;

        // 5. Recycle (costs 1 step now)
        if (this.handPile.length === 0 && this.handDisplay.length > 0 && this.stepsLeft > 1) return true;

        return false;
    }

    onLose(reason) {
        const msg = reason || 'No more moves available!';
        const bonus = (this.retryBonus[this.level] || 0) + 5;
        document.getElementById('lose-message').textContent =
            `${msg} Retry with +${bonus} steps.`;
        this.loseOverlay.classList.remove('hidden');
    }

    onWin() {
        document.getElementById('win-message').textContent =
            `All categories collected! Level ${this.level} complete!`;
        this.winOverlay.classList.remove('hidden');
    }

    // ── Slot Helpers ─────────────────────────────────────────

    findEmptySlot() {
        return this.slots.findIndex(s => s === null);
    }

    completeSlot(slotIdx) {
        this.slots[slotIdx] = null;
        this.completedCount++;
    }

    // ── Rendering ────────────────────────────────────────────

    // ── Chinese Mode ───────────────────────────────────────────

    getDisplayName(card) {
        return this.zhMode && card.zhName ? card.zhName : card.name;
    }

    toggleZhMode() {
        this.zhMode = !this.zhMode;
        const btn = document.getElementById('btn-zh');
        if (btn) btn.classList.toggle('active', this.zhMode);
        // Update slot zhName display
        for (const slot of this.slots) {
            if (slot && slot.lastCard) {
                slot.lastCard._displayName = this.getDisplayName(slot.lastCard);
            }
        }
        this.render();
    }

    injectZhNames(level) {
        if (typeof LEVEL_CARD_DEFS === 'undefined') return;
        const defs = LEVEL_CARD_DEFS[level];
        if (!defs) return;

        // Build lookup tables
        const wordZhMap = {};    // {category + '|' + name: zh}
        const catZhMap = {};     // {categoryName: zhCategoryName}
        for (const cat of defs) {
            if (cat.zhCategoryName) catZhMap[cat.categoryName] = cat.zhCategoryName;
            const catKey = cat.isImage ? cat.categoryName : cat.categoryName + '_word';
            if (cat.cardWords) {
                for (const w of cat.cardWords) {
                    const name = typeof w === 'string' ? w : w.name;
                    const zh = typeof w === 'string' ? '' : (w.zh || '');
                    if (zh) wordZhMap[catKey + '|' + name] = zh;
                }
            }
        }

        // Inject into all cards
        const injectCard = (card) => {
            if (!card) return;
            if (card.type === 'gold') {
                // Gold card: category name → zhCategoryName
                const baseCat = card.category.replace(/_word$/, '');
                card.zhName = catZhMap[baseCat] || '';
            } else {
                // Regular card: lookup by category + name
                card.zhName = wordZhMap[card.category + '|' + card.name] || '';
            }
        };

        // Tableau cards
        for (const col of this.tableau) {
            for (const tc of col) {
                injectCard(tc.card);
            }
        }
        // Hand pile + display
        for (const c of this.handPile) injectCard(c);
        for (const c of this.handDisplay) injectCard(c);
    }

    // ── Rendering ──────────────────────────────────────────────

    render() {
        this.renderSteps();
        this.renderSlots();
        this.renderHandArea();
        this.renderTableau();
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
            const slotDisplayName = this.zhMode && slot.zhName ? slot.zhName : slot.name;
            const placeholder = document.createElement('div');
            placeholder.className = 'slot-label';
            placeholder.style.visibility = 'hidden';
            placeholder.textContent = '\u00A0';
            wrapper.appendChild(placeholder);

            const div = document.createElement('div');
            div.className = 'slot-card category-placed' + (slot._animateIn ? ' animate-in' : '');
            if (slot._animateIn) slot._animateIn = false;
            div.innerHTML = `<img class="slot-bg-img" src="res/Panel/category_card_1.png" alt=""><span class="cat-progress">0/${slot.target}</span><span class="slot-card-text">${slotDisplayName}</span>`;
            wrapper.appendChild(div);
        } else {
            const slotDisplayName = this.zhMode && slot.zhName ? slot.zhName : slot.name;
            const label = document.createElement('div');
            label.className = 'slot-label';
            label.textContent = slotDisplayName;
            wrapper.appendChild(label);

            const isFull = slot.collected >= slot.target;
            const div = document.createElement('div');
            div.className = 'slot-card collecting' + (isFull ? ' full' : '');

            let cardContent = `<span class="cat-progress">${slot.collected}/${slot.target}</span>`;
            if (slot.lastCard) {
                const lastCardDisplayName = this.getDisplayName(slot.lastCard);
                if (slot.lastCard.isText) {
                    cardContent += `<span class="slot-card-text">${lastCardDisplayName}</span>`;
                } else if (slot.lastCard.image) {
                    cardContent += `<img class="slot-card-img" src="${slot.lastCard.image}" alt="${lastCardDisplayName}">`;
                }
            }
            div.innerHTML = cardContent;
            wrapper.appendChild(div);
        }

        return wrapper;
    }

    _renderCompletedBadge() {
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

    renderTableau() {
        this.tableauEl.innerHTML = '';

        for (let ci = 0; ci < this.tableau.length; ci++) {
            const col = this.tableau[ci];
            const colEl = document.createElement('div');
            colEl.className = 'tableau-column';
            if (col.length === 0) {
                colEl.classList.add('empty-column');
            }
            colEl.dataset.colIdx = ci;

            let topOffset = 0;
            for (let pos = 0; pos < col.length; pos++) {
                const tc = col[pos];
                const el = document.createElement('div');
                el.className = 'tableau-card';
                el.dataset.colIdx = ci;
                el.dataset.posIdx = pos;
                el.style.top = topOffset + 'px';
                el.style.zIndex = pos + 1;

                const inner = document.createElement('div');
                inner.className = 'card-inner';

                if (!tc.faceUp) {
                    el.classList.add('face-down');
                    const back = document.createElement('div');
                    back.className = 'card-back';
                    inner.appendChild(back);
                    topOffset += FACE_DOWN_H;
                } else {
                    el.classList.add('face-up');
                    el.style.touchAction = 'none';

                    if (tc.justFlipped) {
                        el.classList.add('flipping');
                        tc.justFlipped = false;
                    }

                    // Check if this card is sealed (gold card that seals the column)
                    if (tc.card.type === 'gold' && pos === col.length - 1) {
                        el.classList.add('sealed');
                    }

                    // Non-last face-up cards are partially covered
                    const isCovered = pos < col.length - 1;
                    if (isCovered) {
                        el.classList.add('covered');
                    }

                    const face = document.createElement('div');
                    const displayName = this.getDisplayName(tc.card);

                    if (tc.card.type === 'gold') {
                        face.className = 'card-face gold-grid-card';
                        const goldTarget = this.categoryTargets[tc.card.category] || 0;
                        const goldCounter = `<span class="gold-counter">0/${goldTarget}</span>`;
                        if (isCovered) {
                            face.innerHTML = `${goldCounter}<span class="card-name">${displayName}</span>`;
                        } else {
                            face.innerHTML = `${goldCounter}<span class="card-text">${displayName}</span>`;
                        }
                    } else {
                        face.className = 'card-face';
                        if (isCovered) {
                            if (tc.card.isText) {
                                face.innerHTML = `<span class="card-name">${displayName}</span>`;
                            } else {
                                face.innerHTML = `<img class="card-img" src="${tc.card.image}" alt="${displayName}">`;
                            }
                        } else if (tc.card.isText) {
                            face.innerHTML = `<span class="card-text">${displayName}</span>`;
                        } else {
                            face.innerHTML = `<img class="card-img" src="${tc.card.image}" alt="${displayName}">`;
                        }
                    }

                    inner.appendChild(face);
                    // Non-last face-up cards: show only top portion; last card: full height
                    if (pos < col.length - 1) {
                        topOffset += FACE_UP_OFFSET;
                    } else {
                        topOffset += CARD_H;
                    }
                }

                el.appendChild(inner);
                colEl.appendChild(el);
            }

            // Set column height = total offset accumulated
            if (col.length > 0) {
                colEl.style.height = topOffset + 'px';
            }

            this.tableauEl.appendChild(colEl);
        }
    }

    // ── Hand Area ────────────────────────────────────────────

    onHandPileClick() {
        if (this.isAnimating || this.flyAnimCount > 0) return;

        if (this.handPile.length > 0) {
            const card = this.handPile.pop();
            this.handDisplay.push(card);
            this.moveHistory.push({ action: 'flip_hand', card: { ...card } });
            this.decrementStep(); // flip costs 1 step
            this.renderHandArea();
            this.checkDeadState();
        } else if (this.handDisplay.length > 0) {
            // Recycle: costs 1 step (changed from 0)
            this.moveHistory.push({
                action: 'recycle',
                displaySnapshot: this.handDisplay.map(c => ({ ...c })),
            });
            this.handPile = [...this.handDisplay].reverse();
            this.handDisplay = [];
            this.decrementStep(); // recycle costs 1 step
            this.renderHandArea();
            this.checkDeadState();
        }
    }

    renderHandArea() {
        if (!this.handPileEl || !this.handDisplayEl) return;
        this.handPileEl.innerHTML = '';
        this.handDisplayEl.innerHTML = '';

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
            const recoverImg = document.createElement('img');
            recoverImg.className = 'recover-icon';
            recoverImg.src = 'res/Panel/recover.png';
            recoverImg.alt = 'Recycle';
            this.handPileEl.appendChild(recoverImg);
        }

        // Display rendering — topmost card at left, covered cards to the right
        const displayCount = this.handDisplay.length;
        const showMax = Math.min(displayCount, 3);
        for (let i = 0; i < showMax; i++) {
            const idx = displayCount - showMax + i;
            const card = this.handDisplay[idx];
            const cardEl = document.createElement('div');
            const isGold = card.type === 'gold';
            const isTop = (i === showMax - 1);
            const isCovered = !isTop;
            cardEl.className = `hand-display-card${isTop ? ' topmost' : ''}`;
            if (isGold) {
                cardEl.style.background = `url('res/Panel/category_card_1.png') center/cover no-repeat`;
                cardEl.style.border = '2px solid #ffd700';
            }
            // Reverse layout: topmost (last i) at left=0, older cards shift right
            const reversePos = showMax - 1 - i;
            cardEl.style.left = (reversePos * 18) + 'px';
            cardEl.style.zIndex = i;  // topmost gets highest z-index
            cardEl.style.touchAction = 'none';

            const inner = document.createElement('div');

            if (isCovered) {
                // Covered card: show content in left 18px strip (CSS handles sizing)
                inner.className = 'card-inner hand-covered-inner';
                const coveredName = this.getDisplayName(card);
                if (card.type === 'gold') {
                    // Gold card covered: just show name, no counter
                    inner.innerHTML = `<span class="hand-covered-text">${coveredName}</span>`;
                } else if (!card.isText && card.image) {
                    inner.innerHTML = `<img class="hand-covered-img" src="${card.image}" alt="${coveredName}">`;
                } else {
                    inner.innerHTML = `<span class="hand-covered-text">${coveredName}</span>`;
                }
            } else if (isGold) {
                inner.className = 'card-inner';
                inner.style.width = '100%';
                inner.style.height = '100%';
                inner.style.display = 'flex';
                inner.style.flexDirection = 'column';
                inner.style.alignItems = 'center';
                inner.style.justifyContent = 'center';
                const goldTarget = this.categoryTargets[card.category] || 0;
                const goldName = this.getDisplayName(card);
                inner.innerHTML = `<span class="gold-counter">0/${goldTarget}</span><span class="hand-card-name">${goldName}</span>`;
            } else {
                inner.className = 'card-inner';
                inner.style.width = '100%';
                inner.style.height = '100%';
                inner.style.display = 'flex';
                inner.style.flexDirection = 'column';
                inner.style.alignItems = 'center';
                inner.style.justifyContent = 'center';
                if (card.isText) {
                    inner.innerHTML = `<span class="hand-card-name">${this.getDisplayName(card)}</span>`;
                } else if (card.image) {
                    inner.innerHTML = `<img class="card-img" src="${card.image}" alt="${this.getDisplayName(card)}" style="width:40px;height:48px;object-fit:contain;pointer-events:none;">`;
                } else {
                    inner.innerHTML = `<span class="hand-card-name">${this.getDisplayName(card)}</span>`;
                }
            }

            cardEl.appendChild(inner);
            this.handDisplayEl.appendChild(cardEl);
        }
    }

    // ── Hint ────────────────────────────────────────────────

    showHint() {
        if (this.isAnimating || this.flyAnimCount > 0) return;

        const activeKeys = new Set(
            this.slots.filter(s => s !== null && s.collected < s.target).map(s => s.key)
        );
        const hasEmptySlot = this.findEmptySlot() !== -1;

        // Priority 1: Tableau card matches collector slot
        for (let ci = 0; ci < this.tableau.length; ci++) {
            const col = this.tableau[ci];
            if (col.length === 0) continue;
            const topCard = col[col.length - 1];
            if (!topCard.faceUp) continue;
            if (topCard.card.type === 'regular' && activeKeys.has(topCard.card.category)) {
                this._highlightTableauCard(ci, col.length - 1);
                return;
            }
        }

        // Priority 2: Gold card + empty slot
        if (hasEmptySlot) {
            for (let ci = 0; ci < this.tableau.length; ci++) {
                const col = this.tableau[ci];
                if (col.length === 0) continue;
                const topCard = col[col.length - 1];
                if (!topCard.faceUp) continue;
                if (topCard.card.type === 'gold') {
                    this._highlightTableauCard(ci, col.length - 1);
                    return;
                }
            }
        }

        // Priority 3: Hand display matches
        if (this.handDisplay.length > 0) {
            const topCard = this.handDisplay[this.handDisplay.length - 1];
            if (topCard.type === 'gold' && hasEmptySlot) {
                this.handDisplayEl.classList.add('hint-highlight-hand');
                setTimeout(() => this.handDisplayEl.classList.remove('hint-highlight-hand'), 2000);
                return;
            }
            if (topCard.type === 'regular' && activeKeys.has(topCard.category)) {
                this.handDisplayEl.classList.add('hint-highlight-hand');
                setTimeout(() => this.handDisplayEl.classList.remove('hint-highlight-hand'), 2000);
                return;
            }
        }

        // Priority 4: Hand display top card can stack on a tableau column
        //   Prefer non-empty columns first, then empty columns
        if (this.handDisplay.length > 0) {
            const topCard = this.handDisplay[this.handDisplay.length - 1];
            let found = false;
            // First pass: non-empty columns
            for (let ti = 0; ti < this.tableau.length; ti++) {
                if (this.tableau[ti].length > 0 && this.canStackOnColumn(topCard, ti)) {
                    found = true;
                    break;
                }
            }
            // Second pass: empty columns
            if (!found) {
                for (let ti = 0; ti < this.tableau.length; ti++) {
                    if (this.tableau[ti].length === 0 && this.canStackOnColumn(topCard, ti)) {
                        found = true;
                        break;
                    }
                }
            }
            if (found) {
                this.handDisplayEl.classList.add('hint-highlight-hand');
                setTimeout(() => this.handDisplayEl.classList.remove('hint-highlight-hand'), 2000);
                return;
            }
        }

        // Priority 5: Tableau inter-column moves (including multi-card)
        //   Suggest any valid move between columns
        for (let ci = 0; ci < this.tableau.length; ci++) {
            const col = this.tableau[ci];
            if (col.length === 0) continue;
            // Find the deepest face-up card in the column
            let deepestFaceUp = col.length - 1;
            for (let p = 0; p < col.length; p++) {
                if (col[p].faceUp) { deepestFaceUp = p; break; }
            }
            // Try moving from each face-up position
            for (let startPos = deepestFaceUp; startPos < col.length; startPos++) {
                const moveCard = col[startPos];
                for (let ti = 0; ti < this.tableau.length; ti++) {
                    if (ti === ci) continue;
                    if (this.canStackOnColumn(moveCard.card, ti)) {
                        this._highlightTableauCard(ci, startPos);
                        return;
                    }
                }
            }
        }

        // Priority 6: Flip hand
        if (this.handPile.length > 0) {
            this.handPileEl.classList.add('hint-highlight-hand');
            setTimeout(() => this.handPileEl.classList.remove('hint-highlight-hand'), 2000);
            return;
        }

        // Priority 7: Recycle
        if (this.handPile.length === 0 && this.handDisplay.length > 0) {
            this.handPileEl.classList.add('hint-highlight-hand');
            setTimeout(() => this.handPileEl.classList.remove('hint-highlight-hand'), 2000);
            return;
        }
    }

    _highlightTableauCard(colIdx, posIdx) {
        const cardEl = this.tableauEl.querySelector(
            `.tableau-card[data-col-idx="${colIdx}"][data-pos-idx="${posIdx}"]`
        );
        if (cardEl) {
            cardEl.classList.add('hint-highlight');
            setTimeout(() => cardEl.classList.remove('hint-highlight'), 2000);
        }
    }

    // ── Undo ────────────────────────────────────────────────

    undo() {
        if (this.isAnimating || this.flyAnimCount > 0) return;
        if (this.moveHistory.length === 0) return;

        const move = this.moveHistory.pop();

        if (move.action === 'move_tableau_to_slot') {
            // Undo auto-flip
            if (move.autoFlipped) {
                const col = this.tableau[move.colIdx];
                if (col.length > 0) {
                    col[col.length - 1].faceUp = false;
                }
            }
            // Restore card to source column
            this.tableau[move.colIdx].push({
                id: move.tableauCard.id,
                card: { ...move.tableauCard.card },
                faceUp: true,
                justFlipped: false,
            });

            if (move.slotWasNull) {
                // Was a gold card creating a slot
                this.slots[move.slotIdx] = null;
            } else {
                // Was a regular card collecting
                if (this.slots[move.slotIdx] === null) {
                    // Slot was completed
                    this.completedCount--;
                    const catKey = move.tableauCard.card.category;
                    this.slots[move.slotIdx] = {
                        key: catKey,
                        name: CATEGORIES[catKey].name,
                        zhName: move.tableauCard.card.zhName || '',
                        collected: move.previousCollected,
                        target: this.categoryTargets[catKey],
                        lastCard: move.previousLastCard || null,
                    };
                } else {
                    this.slots[move.slotIdx].collected = move.previousCollected;
                    this.slots[move.slotIdx].lastCard = move.previousLastCard || null;
                }
            }
            this.stepsLeft++;

        } else if (move.action === 'move_multi_tableau_to_slot') {
            // Undo auto-flip
            if (move.autoFlipped) {
                const col = this.tableau[move.colIdx];
                if (col.length > 0) {
                    col[col.length - 1].faceUp = false;
                }
            }

            // Restore all cards to source column
            for (const tc of move.removedCards) {
                this.tableau[move.colIdx].push({
                    id: tc.id,
                    card: { ...tc.card },
                    faceUp: tc.faceUp,
                    justFlipped: false,
                });
            }

            if (move.slotWasNull) {
                // Slot was created by gold card — remove it entirely
                if (this.slots[move.slotIdx] === null) {
                    // Slot was completed
                    this.completedCount--;
                }
                this.slots[move.slotIdx] = null;
            } else {
                // Slot existed — restore previous collected count
                if (this.slots[move.slotIdx] === null) {
                    // Slot was completed
                    this.completedCount--;
                    const catKey = move.removedCards[0].card.category;
                    this.slots[move.slotIdx] = {
                        key: catKey,
                        name: CATEGORIES[catKey].name,
                        zhName: move.removedCards[0].card.zhName || '',
                        collected: move.previousCollected,
                        target: this.categoryTargets[catKey],
                        lastCard: move.previousLastCard || null,
                    };
                } else {
                    this.slots[move.slotIdx].collected = move.previousCollected;
                    this.slots[move.slotIdx].lastCard = move.previousLastCard || null;
                }
            }
            this.stepsLeft++;

        } else if (move.action === 'move_display_to_slot') {
            if (move.slotWasNull) {
                this.slots[move.slotIdx] = null;
            } else {
                if (this.slots[move.slotIdx] === null) {
                    this.completedCount--;
                    const catKey = move.card.category;
                    this.slots[move.slotIdx] = {
                        key: catKey,
                        name: CATEGORIES[catKey].name,
                        zhName: move.card.zhName || '',
                        collected: move.previousCollected,
                        target: this.categoryTargets[catKey],
                        lastCard: move.previousLastCard || null,
                    };
                } else {
                    this.slots[move.slotIdx].collected = move.previousCollected;
                    this.slots[move.slotIdx].lastCard = move.previousLastCard || null;
                }
            }
            this.handDisplay.push(move.card);
            this.stepsLeft++;

        } else if (move.action === 'move_tableau_to_column') {
            // Remove from target column
            const targetCol = this.tableau[move.targetColIdx];
            targetCol.pop();

            // Undo auto-flip
            if (move.autoFlipped) {
                const srcCol = this.tableau[move.srcColIdx];
                if (srcCol.length > 0) {
                    srcCol[srcCol.length - 1].faceUp = false;
                }
            }

            // Restore to source column
            this.tableau[move.srcColIdx].push({
                id: move.tableauCard.id,
                card: { ...move.tableauCard.card },
                faceUp: true,
                justFlipped: false,
            });
            this.stepsLeft++;

        } else if (move.action === 'move_multi_tableau_to_column') {
            // Remove all moved cards from target column
            const targetCol = this.tableau[move.targetColIdx];
            targetCol.splice(targetCol.length - move.count);

            // Undo auto-flip
            if (move.autoFlipped) {
                const srcCol = this.tableau[move.srcColIdx];
                if (srcCol.length > 0) {
                    srcCol[srcCol.length - 1].faceUp = false;
                }
            }

            // Restore all cards to source column
            for (const tc of move.removedCards) {
                this.tableau[move.srcColIdx].push({
                    id: tc.id,
                    card: { ...tc.card },
                    faceUp: tc.faceUp,
                    justFlipped: false,
                });
            }
            this.stepsLeft++;

        } else if (move.action === 'move_display_to_column') {
            const targetCol = this.tableau[move.targetColIdx];
            targetCol.pop();
            this.handDisplay.push(move.card);
            this.stepsLeft++;

        } else if (move.action === 'flip_hand') {
            this.handDisplay.pop();
            this.handPile.push(move.card);
            this.stepsLeft++;

        } else if (move.action === 'recycle') {
            this.handDisplay = move.displaySnapshot.map(c => ({ ...c }));
            this.handPile = [];
            this.stepsLeft++; // recycle now costs 1 step, so restore
        }

        this.render();
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
