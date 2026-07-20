/**
 * Leaflet 地图图标配置
 * 使用内联 SVG Data URL，避免 CDN 依赖和 Vite 打包路径问题
 */
import L from 'leaflet';

// 蓝色默认标记的 SVG（模拟 Leaflet 默认蓝色标记）
const BLUE_MARKER_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#3274B9" stroke="#2C3E50" stroke-width="1.5"/>
  <circle cx="12.5" cy="12.5" r="5" fill="white"/>
</svg>
`);

// 橙色标记的 SVG（选中高亮态）
const ORANGE_MARKER_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#E86B35" stroke="#C55A2B" stroke-width="1.5"/>
  <circle cx="12.5" cy="12.5" r="5" fill="white"/>
</svg>
`);

/** 默认蓝色标记图标（列表中的普通标记） */
export const defaultIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${BLUE_MARKER_SVG}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

/** 橙色高亮图标（选中/激活态） */
export const activeIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${ORANGE_MARKER_SVG}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

/** 修复 Leaflet 默认图标路径（方式：让 L.Icon.Default 指向我们的图标） */
export function fixLeafletIcon() {
  // 不需要 delete，直接 mergeOptions 覆盖即可
}
