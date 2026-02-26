/**
 * Card Color Settings for Solitaire Tile Bingo
 *
 * 11 category colors + 1 filler color.
 * Adjust CATEGORY_ALPHA / FILLER_ALPHA to control overlay transparency.
 * CARD_COLORS array is used by game.js and generator.html to assign colors to categories.
 */

// ── Overlay transparency ────────────────────────────────────────
const CATEGORY_ALPHA = 0.3;   // category card overlay opacity (0 = transparent, 1 = opaque)
const FILLER_ALPHA   = 0.45;  // filler card overlay opacity

// ── Category colors (HEX only, alpha applied automatically) ─────
// 颜色备份 - gpt5.2给出的方案
// High-separation category colors (HEX only)
const CARD_COLOR_DEFS = [
  { name: 'color-1',  hex: '#E53935' }, // Red
  { name: 'color-2',  hex: '#FB8C00' }, // Orange
  { name: 'color-3',  hex: '#FDD835' }, // Yellow
  { name: 'color-4',  hex: '#7CB342' }, // Yellow-Green
  { name: 'color-5',  hex: '#43A047' }, // Green
  { name: 'color-6',  hex: '#00ACC1' }, // Cyan/Teal
  { name: 'color-7',  hex: '#039BE5' }, // Sky Blue
  { name: 'color-8',  hex: '#1E88E5' }, // Blue
  { name: 'color-9',  hex: '#3949AB' }, // Indigo
  { name: 'color-10', hex: '#8E24AA' }, // Purple
  { name: 'color-11', hex: '#D81B60' }, // Magenta
];

// 颜色备份 - 左左方案
// const CARD_COLOR_DEFS = [
//     { name: 'color-1',  hex: '#FFC083' },  // 
//     { name: 'color-2',  hex: '#FF7272' },  // 
//     { name: 'color-3',  hex: '#FFF074' },  // 
//     { name: 'color-4',  hex: '#B5FF66' },  // 
//     { name: 'color-5',  hex: '#26FFF7' },  // 
//     { name: 'color-6',  hex: '#229FFF' },  // 
//     { name: 'color-7',  hex: '#FF97EF' },  // 
//     { name: 'color-8',  hex: '#A168FF' },  // 
//     { name: 'color-9',  hex: '#5AFF9C' },  // 
//     { name: 'color-10', hex: '#64E4FF' },  // 
//     { name: 'color-11', hex: '#F665FF' },  // 
// ];



// 颜色备份 - 王总方案
// const CARD_COLOR_DEFS = [
//     { name: 'color-1',  hex: '#A06ED0' },  // 紫藤
//     { name: 'color-2',  hex: '#E8A448' },  // 琥珀橙
//     { name: 'color-3',  hex: '#7CC84E' },  // 苹果绿
//     { name: 'color-4',  hex: '#4AADE0' },  // 天蓝
//     { name: 'color-5',  hex: '#3EBE90' },  // 翡翠绿
//     { name: 'color-6',  hex: '#D86EA8' },  // 玫瑰粉
//     { name: 'color-7',  hex: '#E8806E' },  // 珊瑚红
//     { name: 'color-8',  hex: '#E0D85C' },  // 柠檬黄
//     { name: 'color-9',  hex: '#5570C8' },  // 靛蓝
//     { name: 'color-10', hex: '#EDE482' },  // 柠檬黄
//     { name: 'color-11', hex: '#AD79D2' },  // 紫藤
// ];

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
    const style = document.createElement('style');
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
})();
