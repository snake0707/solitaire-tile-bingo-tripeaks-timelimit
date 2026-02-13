/**
 * Card Color Settings for Solitaire Tile Bingo
 *
 * 11 category colors + 1 filler color.
 * Each entry: { name: CSS class suffix, rgba: overlay color for card face }
 * CARD_COLORS array is used by game.js and generator.html to assign colors to categories.
 */

const CARD_COLOR_DEFS = [
    { name: 'color-1',  rgba: 'rgba(232, 212, 196, 0.3)' },  // #E8D4C4
    { name: 'color-2',  rgba: 'rgba(255, 182, 173, 0.3)' },  // #FFB6AD
    { name: 'color-3',  rgba: 'rgba(255, 196, 145, 0.3)' },  // #FFC491
    { name: 'color-4',  rgba: 'rgba(255, 230, 153, 0.3)' },  // #FFE699
    { name: 'color-5',  rgba: 'rgba(201, 228, 160, 0.3)' },  // #C9E4A0
    { name: 'color-6',  rgba: 'rgba(152, 223, 198, 0.3)' },  // #98DFC6
    { name: 'color-7',  rgba: 'rgba(141, 211, 224, 0.3)' },  // #8DD3E0
    { name: 'color-8',  rgba: 'rgba(173, 216, 245, 0.3)' },  // #ADD8F5
    { name: 'color-9',  rgba: 'rgba(155, 184, 216, 0.3)' },  // #9BB8D8
    { name: 'color-10', rgba: 'rgba(200, 182, 230, 0.3)' },  // #C8B6E6
    { name: 'color-11', rgba: 'rgba(228, 184, 212, 0.3)' },  // #E4B8D4
];

const FILLER_COLOR_DEF = { name: 'color-filler', rgba: 'rgba(120, 144, 156, 0.45)' };

// Class name array for category assignment (used by game.js / generator.html)
const CARD_COLORS = CARD_COLOR_DEFS.map(c => c.name);

// Inject color CSS rules at load time
(function injectColorStyles() {
    const rules = CARD_COLOR_DEFS.map(c =>
        `.card-face.${c.name}::before { background: ${c.rgba}; }`
    );
    rules.push(`.card-face.${FILLER_COLOR_DEF.name}::before { background: ${FILLER_COLOR_DEF.rgba}; }`);
    rules.push(`.card-face.${FILLER_COLOR_DEF.name} { opacity: 0.85; }`);
    const style = document.createElement('style');
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
})();
