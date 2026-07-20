/**
 * 美食地图 — Hono 应用定义（纯路由 + 中间件）
 * 供 server/index.ts（Bun 开发）和 api/[[route]].ts（Vercel）共用
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import postsRoute from './routes/posts';
import uploadRoute from './routes/upload';
import categoriesRoute from './routes/categories';
import tilesRoute from './routes/tiles';

const app = new Hono();

// ── 全局中间件 ──
app.use('*', cors());
app.use('*', logger());

// ── API 路由 ──
app.route('/api/posts', postsRoute);
app.route('/api/upload', uploadRoute);
app.route('/api/categories', categoriesRoute);
app.route('/api/tiles', tilesRoute);

export default app;
