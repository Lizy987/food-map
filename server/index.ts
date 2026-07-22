/**
 * 美食地图 — Hono API 服务器
 * 开发：仅提供 API（Vite 代理前端请求到 5173）
 * 生产：同时提供 API + dist/ 静态文件
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import postsRoute from './routes/posts';
import uploadRoute from './routes/upload';
import categoriesRoute from './routes/categories';
import tilesRoute from './routes/tiles';
import authRoute from './routes/auth';

const app = new Hono();

// ── 全局中间件 ──
app.use('*', cors());
app.use('*', logger());

// ── API 路由 ──
app.route('/api/posts', postsRoute);
app.route('/api/upload', uploadRoute);
app.route('/api/categories', categoriesRoute);
app.route('/api/tiles', tilesRoute);
app.route('/api/auth', authRoute);

// ── 静态文件：上传的图片 ──
app.use('/uploads/*', serveStatic({ root: './' }));

// ── 生产模式：SPA 静态文件 + fallback ──
if (process.env.NODE_ENV === 'production') {
  // 先尝试匹配 dist/ 下的静态文件
  app.use('/*', serveStatic({ root: './dist' }));
  // SPA fallback：非 API/非文件请求返回 index.html
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
