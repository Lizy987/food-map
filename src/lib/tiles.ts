/**
 * 地图底图瓦片配置
 *
 * ── 瓦片源策略 ──
 * CartoDB（主力）+ OSM（兜底）双源加载。
 * 天地图代理默认关闭——SK 签名校验通过后，将下方 ENABLE_TIANDITU 改为 true 即可启用。
 *
 * ── 启用天地图 ──
 * 1. 确保 server/routes/tiles.ts 中 TILE_KEY + TILE_SK 正确配对
 * 2. 将下方 ENABLE_TIANDITU 改为 true
 * 3. 重启服务：bun run dev
 */

/** 天地图开关（SK 校验通过后再开启） */
const ENABLE_TIANDITU = false;

// ── 瓦片 URL ──────────────────────────────────

/** 天地图矢量底图（通过服务端代理 → /api/tiles） */
export const TIANDITU_VEC = '/api/tiles/vec/{z}/{x}/{y}';
/** 天地图中文注记 */
export const TIANDITU_CVA = '/api/tiles/cva/{z}/{x}/{y}';
/** CartoDB Voyager（国外 CDN，国内部分地区可达） */
export const CARTODB_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
/** OSM 直连（兜底） */
export const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/** 是否启用天地图层 */
export const hasTiandituKey = ENABLE_TIANDITU;

// ── 选项 ──────────────────────────────────────

export const TIANDITU_OPTIONS = { maxZoom: 18, errorTileUrl: '' };
export const OSM_OPTIONS = {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};
