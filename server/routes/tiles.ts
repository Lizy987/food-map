/**
 * GET /api/tiles/:layer/:z/:x/:y — 天地图瓦片代理
 *
 * 支持 SK 签名（天地图新版 Key 安全核验要求）
 *
 * ── 配置 ──
 * 1. 访问 https://console.tianditu.gov.cn/ 登录
 * 2. 进入"我的应用" → 点击应用名称
 * 3. TILE_KEY = 页面上的 Key (tk)
 * 4. TILE_SK  = 页面上的 SK（安全密钥）
 *    ⚠ SK 是一个独立字段，不是 Key 的子串！
 */
import { Hono } from 'hono';
import { createHash } from 'crypto';

const TILE_KEY = '6c3127689378b5aaa2d91161f6898c16';
const TILE_SK = 'b6fdd9563cd0d633083c1f8566b1cfaa';

const router = new Hono();

/**
 * 天地图 SK 签名
 * 算法：MD5(URL路径+排序后的query参数 + SK)
 */
function signUrl(baseUrl: string): string {
  if (!TILE_SK) return baseUrl;

  const url = new URL(baseUrl);
  const params: [string, string][] = [];
  url.searchParams.forEach((v, k) => {
    if (k !== 'tk' && k !== 'sign' && k !== 'ts') {
      params.push([k, v]);
    }
  });
  params.sort((a, b) => a[0].localeCompare(b[0]));

  const sortedQuery = params.map(([k, v]) => `${k}=${v}`).join('&');
  const rawPath = url.pathname + (sortedQuery ? '?' + sortedQuery : '');

  const sign = createHash('md5').update(rawPath + TILE_SK).digest('hex');
  return `${baseUrl}&sign=${sign}`;
}

router.get('/:layer/:z/:x/:y', async (c) => {
  const layer = c.req.param('layer');
  const z = c.req.param('z');
  const x = c.req.param('x');
  const y = c.req.param('y');

  if (!layer || !z || !x || !y) {
    return c.body(null, 400);
  }

  const candidates = [
    `https://t0.tianditu.gov.cn/DataServer?T=${layer}_w&x=${x}&y=${y}&l=${z}&tk=${TILE_KEY}`,
    `https://t0.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&tk=${TILE_KEY}`,
  ];

  for (const url of candidates) {
    try {
      const resp = await fetch(signUrl(url), {
        headers: {
          Referer: 'https://www.tianditu.gov.cn/',
          'User-Agent': 'Mozilla/5.0 (compatible; TiandituTileProxy/1.0)',
        },
      });

      if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        return new Response(buffer, {
          headers: {
            'Content-Type': resp.headers.get('content-type') || 'image/png',
            'Cache-Control': 'public, max-age=604800',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 301020 = SK 不匹配（静默跳过，不刷屏）
    } catch {
      continue;
    }
  }

  // 返回透明 PNG（不阻塞 Leaflet，让下层瓦片透出）
  return c.body(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    ),
    { headers: { 'Content-Type': 'image/png' } }
  );
});

export default router;
