/**
 * Card Color Settings for Solitaire Tile Bingo
 *
 * 11 category colors + 1 filler color.
 * Adjust CATEGORY_ALPHA / FILLER_ALPHA to control overlay transparency.
 * CARD_COLORS array is used by game.js and generator.html to assign colors to categories.
 */

// ── Overlay transparency ────────────────────────────────────────
const CATEGORY_ALPHA = 0.5;   // category card overlay opacity (0 = transparent, 1 = opaque)
const FILLER_ALPHA   = 0.45;  // filler card overlay opacity

// ── Category colors (HEX only, alpha applied automatically) ─────
const CARD_COLOR_DEFS = [
    { name: 'color-1',  hex: '#5E67C9' },  // 宝蓝
    { name: 'color-2',  hex: '#EB8C79' },  // 珊瑚红
    { name: 'color-3',  hex: '#DBBD93' },  // 暖棕
    { name: 'color-4',  hex: '#95D368' },  // 苹果绿
    { name: 'color-5',  hex: '#63CED8' },  // 青碧
    { name: 'color-6',  hex: '#E28CB7' },  // 玫瑰粉
    { name: 'color-7',  hex: '#58CE9D' },  // 翡翠绿
    { name: 'color-8',  hex: '#78ADE2' },  // 天蓝
    { name: 'color-9',  hex: '#EDA862' },  // 琥珀橙
    { name: 'color-10', hex: '#EDE482' },  // 柠檬黄
    { name: 'color-11', hex: '#AD79D2' },  // 紫藤
];

const FILLER_COLOR_DEF = { name: 'color-filler', hex: '#78909C' };

// ── Helpers ─────────────────────────────────────────────────────

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Class name array for category assignment (used by game.js / generator.html)
const CARD_COLORS = CARD_COLOR_DEFS.map(c => c.name);

// Inject color CSS rules at load time
(function injectColorStyles() {
    const rules = CARD_COLOR_DEFS.map(c =>
        `.card-face.${c.name}::before { background: ${hexToRgba(c.hex, CATEGORY_ALPHA)}; }`
    );
    rules.push(`.card-face.${FILLER_COLOR_DEF.name}::before { background: ${hexToRgba(FILLER_COLOR_DEF.hex, FILLER_ALPHA)}; }`);
    rules.push(`.card-face.${FILLER_COLOR_DEF.name} { opacity: 0.85; }`);
    const style = document.createElement('style');
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
})();
