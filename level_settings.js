/**
 * Shared Level Settings for Solitaire Tile Bingo
 *
 * Used by game.js, generator.html, and converter.html.
 * Each level defines its base parameters and layout masks.
 * getLevelSettings(level) computes derived values (numLayers, totalPositions, timeLimit).
 */

const LEVEL_SETTINGS = {
    1: {
        bingosNeeded: 1, maxSlots: 3, numCategories: 3, numFillers: 3, cardsPerCategory: 3, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        ]
    },
    2: {
        bingosNeeded: 1, maxSlots: 3, numCategories: 4, numFillers: 3, cardsPerCategory: 4, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0]],
        ]
    },
    3: {
        bingosNeeded: 2, maxSlots: 3, numCategories: 4, numFillers: 4, cardsPerCategory: 5, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        ]
    },
    4: {
        bingosNeeded: 2, maxSlots: 4, numCategories: 5, numFillers: 4, cardsPerCategory: 6, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
        ]
    },
    5: {
        bingosNeeded: 3, maxSlots: 4, numCategories: 5, numFillers: 5, cardsPerCategory: 6, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0]],
        ]
    },
    6: {
        bingosNeeded: 3, maxSlots: 4, numCategories: 5, numFillers: 5, cardsPerCategory: 6, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        ]
    },
    7: {
        bingosNeeded: 4, maxSlots: 5, numCategories: 6, numFillers: 5, cardsPerCategory: 6, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0]],
        ]
    },
    8: {
        bingosNeeded: 4, maxSlots: 5, numCategories: 6, numFillers: 4, cardsPerCategory: 6, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        ]
    },
    9: {
        bingosNeeded: 5, maxSlots: 5, numCategories: 6, numFillers: 4, cardsPerCategory: 6, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[0,1,1,1,0],[1,1,0,1,1],[1,0,1,0,1],[1,1,0,1,1],[0,1,1,1,0]],
            [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
        ]
    },
    10: {
        bingosNeeded: 5, maxSlots: 5, numCategories: 6, numFillers: 3, cardsPerCategory: 6, timePerCard: 10, penaltyTime: 5,
        layout: [
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            [[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0]],
        ]
    },
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

const MAX_SETTINGS_LEVEL = Math.max(...Object.keys(LEVEL_SETTINGS).map(Number));

function getLevelSettings(level) {
    const settings = LEVEL_SETTINGS[level] || LEVEL_SETTINGS[MAX_SETTINGS_LEVEL];
    const layout = settings.layout;
    const numLayers = layout.length;
    const totalPositions = countLayoutPositions(layout);
    const timeLimit = totalPositions * settings.timePerCard;
    return {
        numCategories: settings.numCategories,
        numLayers,
        bingosNeeded: settings.bingosNeeded,
        cardsPerCategory: settings.cardsPerCategory,
        totalPositions,
        maxSlots: settings.maxSlots,
        timeLimit,
        layout,
        numFillers: settings.numFillers,
        penaltyTime: settings.penaltyTime,
    };
}
