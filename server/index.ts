/**
 * 美食地图 — Hono API 服务器
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

app.use('*', cors());
app.use('*', logger());

app.route('/api/posts', postsRoute);
app.route('/api/upload', uploadRoute);
app.route('/api/categories', categoriesRoute);
app.route('/api/tiles', tilesRoute);
app.route('/api/auth', authRoute);

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

// 显式启动服务器 → PM2 能正确识别
const port = parseInt(process.env.PORT || '3000');
const server = Bun.serve({
  port,
  fetch: app.fetch,
  hostname: '0.0.0.0',
});

console.log('🍜 服务器已启动 → http://' + server.hostname + ':' + server.port);
