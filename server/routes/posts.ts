/**
 * /api/posts — 美食记录 CRUD + CSV 导出
 */
import { Hono } from 'hono';
import { z } from 'zod';
import fs from 'fs';
import { getDb } from '../db';
import { generateId } from '../lib/uuid';
import { toCsv } from '../lib/csv';
import { authMiddleware } from '../lib/auth';
import { CATEGORIES } from './categories';

// ── Zod 校验 Schema ────────────────────────────────────────

const createSchema = z.object({
  dish_name: z.string().min(1, '菜名不能为空'),
  store_name: z.string().min(1, '店名不能为空'),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: '请选择有效的分类' }),
  }),
  address: z.string().min(1, '地址不能为空'),
  image_url: z.string().min(1, '请先上传图片'),
  latitude: z.number().min(-90).max(90, '纬度范围 -90 ~ 90'),
  longitude: z.number().min(-180).max(180, '经度范围 -180 ~ 180'),
  note: z.string().optional().default(''),
});

const updateSchema = createSchema;

const router = new Hono();

// ── GET /api/posts — 列表查询（公开）───────────────────────

router.get('/', (c) => {
  try {
    const db = getDb();
    const category = c.req.query('category');

    let rows;
    if (category && CATEGORIES.includes(category as any)) {
      rows = db
        .query('SELECT * FROM food_posts WHERE category = ? ORDER BY created_at DESC')
        .all(category);
    } else {
      rows = db
        .query('SELECT * FROM food_posts ORDER BY created_at DESC')
        .all();
    }

    return c.json({ data: rows });
  } catch (err) {
    console.error('查询列表失败:', err);
    return c.json({ error: { code: 500, message: '查询失败' } }, 500);
  }
});

// ── GET /api/posts/export/csv — CSV 导出（公开）────────────

router.get('/export/csv', (c) => {
  try {
    const db = getDb();
    const rows = db
      .query('SELECT * FROM food_posts ORDER BY created_at DESC')
      .all();

    const csvContent = toCsv(rows as Record<string, unknown>[]);

    return new Response('﻿' + csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="food-map.csv"',
      },
    });
  } catch (err) {
    console.error('CSV 导出失败:', err);
    return c.json({ error: { code: 500, message: '导出失败' } }, 500);
  }
});

// ── GET /api/posts/:id — 单条详情（公开）───────────────────

router.get('/:id', (c) => {
  try {
    const db = getDb();
    const id = c.req.param('id');
    const post = db.query('SELECT * FROM food_posts WHERE id = ?').get(id);

    if (!post) {
      return c.json({ error: { code: 404, message: '记录不存在' } }, 404);
    }

    return c.json({ data: post });
  } catch (err) {
    console.error('查询详情失败:', err);
    return c.json({ error: { code: 500, message: '查询失败' } }, 500);
  }
});

// ── POST /api/posts — 创建记录（需登录）─────────────────────

router.post('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const body = await c.req.json();

    // Zod 校验
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return c.json(
        { error: { code: 400, message: firstError.message } },
        400
      );
    }

    const data = parsed.data;
    const db = getDb();
    const id = generateId();
    const now = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    db.run(
      `INSERT INTO food_posts
        (id, dish_name, store_name, category, address, image_url, latitude, longitude, note, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.dish_name,
        data.store_name,
        data.category,
        data.address,
        data.image_url,
        data.latitude,
        data.longitude,
        data.note || '',
        userId,
        now,
        now,
      ]
    );

    const post = db.query('SELECT * FROM food_posts WHERE id = ?').get(id);

    return c.json({ data: post }, 201);
  } catch (err) {
    console.error('创建记录失败:', err);
    return c.json({ error: { code: 500, message: '创建失败，请重试' } }, 500);
  }
});

// ── PUT /api/posts/:id — 更新记录（仅 owner）────────────────

router.put('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const id = c.req.param('id');
    const body = await c.req.json();

    const db = getDb();

    // 检查记录是否存在 + 所有权
    const existing = db
      .query('SELECT * FROM food_posts WHERE id = ?')
      .get(id) as Record<string, unknown> | null;

    if (!existing) {
      return c.json({ error: { code: 404, message: '记录不存在' } }, 404);
    }

    if (existing.user_id && existing.user_id !== userId) {
      return c.json({ error: { code: 403, message: '只能编辑自己上传的美食' } }, 403);
    }

    // Zod 校验
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return c.json(
        { error: { code: 400, message: firstError.message } },
        400
      );
    }

    const data = parsed.data;
    const now = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    db.run(
      `UPDATE food_posts SET
         dish_name = ?, store_name = ?, category = ?, address = ?,
         image_url = ?, latitude = ?, longitude = ?, note = ?,
         updated_at = ?
       WHERE id = ?`,
      [
        data.dish_name,
        data.store_name,
        data.category,
        data.address,
        data.image_url,
        data.latitude,
        data.longitude,
        data.note || '',
        now,
        id,
      ]
    );

    const updated = db.query('SELECT * FROM food_posts WHERE id = ?').get(id);

    return c.json({ data: updated });
  } catch (err) {
    console.error('更新记录失败:', err);
    return c.json({ error: { code: 500, message: '更新失败，请重试' } }, 500);
  }
});

// ── DELETE /api/posts/:id — 删除记录（仅 owner）─────────────

router.delete('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const db = getDb();
    const id = c.req.param('id');

    // 查找记录（获取图片路径 + 所有权）
    const post = db
      .query('SELECT * FROM food_posts WHERE id = ?')
      .get(id) as Record<string, unknown> | null;

    if (!post) {
      return c.json({ error: { code: 404, message: '记录不存在' } }, 404);
    }

    if (post.user_id && post.user_id !== userId) {
      return c.json({ error: { code: 403, message: '只能删除自己上传的美食' } }, 403);
    }

    // 删除关联图片文件
    try {
      const imagePath = `.${post.image_url}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('已删除图片文件:', imagePath);
      }
    } catch (imgErr) {
      console.error('删除图片文件失败:', imgErr);
    }

    // 删除数据库记录
    db.run('DELETE FROM food_posts WHERE id = ?', [id]);

    return c.json({ data: { success: true } });
  } catch (err) {
    console.error('删除记录失败:', err);
    return c.json({ error: { code: 500, message: '删除失败，请重试' } }, 500);
  }
});

export default router;
