import sharp from "sharp";
import { fileURLToPath } from "node:url";

const target = new URL("../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", import.meta.url);
const svg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="100" y1="60" x2="900" y2="970" gradientUnits="userSpaceOnUse">
      <stop stop-color="#54A6FF"/>
      <stop offset="0.52" stop-color="#1475F4"/>
      <stop offset="1" stop-color="#0642AA"/>
    </linearGradient>
    <linearGradient id="paper" x1="320" y1="260" x2="735" y2="805" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#E6F1FF"/>
    </linearGradient>
    <filter id="shadow" x="170" y="150" width="720" height="760" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="36" stdDeviation="34" flood-color="#03275F" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="835" cy="165" r="220" fill="#BCE1FF" opacity="0.18"/>
  <circle cx="120" cy="900" r="300" fill="#002D80" opacity="0.16"/>
  <g filter="url(#shadow)">
    <path d="M290 196C290 174 308 156 330 156H694C716 156 734 174 734 196V822C734 844 716 862 694 862H330C308 862 290 844 290 822V196Z" fill="url(#paper)"/>
    <rect x="290" y="156" width="82" height="706" rx="40" fill="#D5E9FF"/>
    <rect x="336" y="156" width="36" height="706" fill="#B9DAFF" opacity="0.7"/>
    <path d="M438 342H650" stroke="#2077DD" stroke-width="34" stroke-linecap="round"/>
    <path d="M438 446H650" stroke="#64A8F4" stroke-width="28" stroke-linecap="round"/>
    <path d="M438 542H610" stroke="#64A8F4" stroke-width="28" stroke-linecap="round"/>
    <path d="M438 638H570" stroke="#64A8F4" stroke-width="28" stroke-linecap="round"/>
  </g>
  <path d="M733 679L804 750L689 866L621 878L632 810L733 679Z" fill="#FFFFFF"/>
  <path d="M632 810L689 866L621 878L632 810Z" fill="#B8D9FF"/>
  <path d="M733 679L804 750" stroke="#91C4FF" stroke-width="20"/>
</svg>`;

const targetPath = fileURLToPath(target);
await sharp(Buffer.from(svg)).png().toFile(targetPath);
console.log(targetPath);
