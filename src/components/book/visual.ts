/**
 * 书架视觉工具 —— 书脊配色 / 尺寸（Bookshelf 与书籍详情页共用，保证封面与书脊同色）
 */

const spineColors = [
  "#7a2630", "#9bb0c4", "#d8d2c4", "#262220", "#7a5a38",
  "#33302c", "#1a1818", "#5e5246", "#2a2622", "#cfcabc", "#d4cfc2",
];
const widthSet = [26, 30, 28, 24, 30, 22, 28, 26, 24, 30, 28];
const heightSet = [92, 98, 95, 100, 94, 96, 99, 93, 97, 95, 91];

// 按相对亮度决定书脊文字颜色：浅色壳用深墨，深色壳用暖白
function inkFor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 150 ? "#2c2620" : "rgba(243,234,217,0.92)";
}

export function bookVisual(idx: number, name: string) {
  const seed = idx * 7 + (name?.length || 0);
  const color = spineColors[seed % spineColors.length];
  return {
    color,
    ink: inkFor(color),
    w: widthSet[(idx * 3) % widthSet.length],
    h: heightSet[(idx * 5) % heightSet.length],
  };
}
