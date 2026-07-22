/**
 * /api/auth — 用户注册、登录、获取当前用户
 */
import { Hono } from 'hono';
import { z } from 'zod';
import { getDb } from '../db';
import { generateId } from '../lib/uuid';
import { signToken, authMiddleware } from '../lib/auth';

const router = new Hono();

// ── 校验 Schema ──

const authSchema = z.object({
  username: z
    .string()
    .min(2, '用户名至少 2 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^[a-zA-Z0-9_一-龥]+$/, '用户名只能包含字母、数字、下划线和中文'),
  password: z
    .string()
    .min(6, '密码至少 6 位')
    .max(50, '密码最多 50 位'),
});

// ── POST /api/auth/register — 注册 ──

router.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = authSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: { code: 400, message: parsed.error.errors[0].message } },
        400
      );
    }

    const { username, password } = parsed.data;
    const db = getDb();

    // 检查用户名是否已存在
    const existing = db
      .query('SELECT id FROM users WHERE username = ?')
      .get(username);
    if (existing) {
      return c.json(
        { error: { code: 409, message: '用户名已存在' } },
        409
      );
    }

    // 创建用户
    const id = generateId();
    const passwordHash = await Bun.password.hash(password);

    db.run('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)', [
      id,
      username,
      passwordHash,
    ]);

    // 生成 token
    const token = await signToken(id);

    return c.json(
      { data: { user: { id, username }, token } },
      201
    );
  } catch (err) {
    console.error('注册失败:', err);
    return c.json({ error: { code: 500, message: '注册失败，请重试' } }, 500);
  }
});

// ── POST /api/auth/login — 登录 ──

router.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = authSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: { code: 400, message: parsed.error.errors[0].message } },
        400
      );
    }

    const { username, password } = parsed.data;
    const db = getDb();

    // 查找用户
    const user = db
      .query('SELECT * FROM users WHERE username = ?')
      .get(username) as Record<string, unknown> | null;

    if (!user) {
      return c.json(
        { error: { code: 401, message: '用户名或密码错误' } },
        401
      );
    }

    // 验证密码
    const valid = await Bun.password.verify(
      password,
      user.password_hash as string
    );
    if (!valid) {
      return c.json(
        { error: { code: 401, message: '用户名或密码错误' } },
        401
      );
    }

    // 生成 token
    const token = await signToken(user.id as string);

    return c.json({
      data: {
        user: { id: user.id, username: user.username },
        token,
      },
    });
  } catch (err) {
    console.error('登录失败:', err);
    return c.json({ error: { code: 500, message: '登录失败，请重试' } }, 500);
  }
});

// ── GET /api/auth/me — 获取当前用户 ──

router.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const db = getDb();

  const user = db.query('SELECT id, username FROM users WHERE id = ?').get(userId) as Record<string, unknown> | null;

  if (!user) {
    return c.json({ error: { code: 404, message: '用户不存在' } }, 404);
  }

  return c.json({ data: { id: user.id, username: user.username } });
});

export default router;
