/**
 * 美食地图 — 本地开发服务器（Bun 专用）
 * 生产部署使用 Vercel serverless（api/[[route]].ts）
 */
import { serveStatic } from 'hono/bun';
import app from './app';

// ── 本地开发：静态文件 + SPA fallback ──
app.use('/uploads/*', serveStatic({ root: './' }));

if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist' }));
  app.notFound((c) => {
    try {
      return c.html(Bun.file('./dist/index.html'));
    } catch {
      return c.json({ error: { code: 404, message: '页面不存在' } }, 404);
    }
  });
}

const port = parseInt(process.env.PORT || '3000');
console.log(`🍜 美食地图 API 服务已启动 → http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
