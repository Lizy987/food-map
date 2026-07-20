/**
 * /api/posts — 美食记录 CRUD + CSV 导出
 */
import { Hono } from 'hono';
import { z } from 'zod';
import { del } from '@vercel/blob';
import { getRows, getRow, run } from '../db';
import { generateId } from '../lib/uuid';
import { toCsv } from '../lib/csv';
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

// ── GET /api/posts — 列表查询（支持 ?category= 筛选）─────────

router.get('/', async (c) => {
  try {
    const category = c.req.query('category');

    let rows;
    if (category && CATEGORIES.includes(category as any)) {
      rows = await getRows(
        'SELECT * FROM food_posts WHERE category = ? ORDER BY created_at DESC',
        [category]
      );
    } else {
      rows = await getRows(
        'SELECT * FROM food_posts ORDER BY created_at DESC'
      );
    }

    return c.json({ data: rows });
  } catch (err) {
    console.error('查询列表失败:', err);
    return c.json({ error: { code: 500, message: '查询失败' } }, 500);
  }
});

// ── GET /api/posts/export/csv — CSV 导出 ─────────────────────
// 注意：此路由必须在 /:id 之前注册

router.get('/export/csv', async (c) => {
  try {
    const rows = await getRows(
      'SELECT * FROM food_posts ORDER BY created_at DESC'
    );

    const csvContent = toCsv(rows);

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

// ── GET /api/posts/:id — 单条详情 ────────────────────────────

router.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const post = await getRow('SELECT * FROM food_posts WHERE id = ?', [id]);

    if (!post) {
      return c.json({ error: { code: 404, message: '记录不存在' } }, 404);
    }

    return c.json({ data: post });
  } catch (err) {
    console.error('查询详情失败:', err);
    return c.json({ error: { code: 500, message: '查询失败' } }, 500);
  }
});

// ── POST /api/posts — 创建记录 ───────────────────────────────

router.post('/', async (c) => {
  try {
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
    const id = generateId();
    const now = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    await run(
      `INSERT INTO food_posts
        (id, dish_name, store_name, category, address, image_url, latitude, longitude, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        now,
        now,
      ]
    );

    // 返回刚创建的记录
    const post = await getRow('SELECT * FROM food_posts WHERE id = ?', [id]);

    return c.json({ data: post }, 201);
  } catch (err) {
    console.error('创建记录失败:', err);
    return c.json(
      { error: { code: 500, message: '创建失败，请重试' } },
      500
    );
  }
});

// ── PUT /api/posts/:id — 更新记录 ────────────────────────────

router.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    // Zod 校验
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return c.json(
        { error: { code: 400, message: firstError.message } },
        400
      );
    }

    // 检查记录是否存在
    const existing = await getRow(
      'SELECT * FROM food_posts WHERE id = ?',
      [id]
    );
    if (!existing) {
      return c.json({ error: { code: 404, message: '记录不存在' } }, 404);
    }

    const data = parsed.data;
    const now = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    await run(
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

    const updated = await getRow(
      'SELECT * FROM food_posts WHERE id = ?',
      [id]
    );

    return c.json({ data: updated });
  } catch (err) {
    console.error('更新记录失败:', err);
    return c.json(
      { error: { code: 500, message: '更新失败，请重试' } },
      500
    );
  }
});

// ── DELETE /api/posts/:id — 删除记录（含 Blob 图片）──────────

router.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // 查找记录（获取图片 URL）
    const post = await getRow(
      'SELECT * FROM food_posts WHERE id = ?',
      [id]
    );

    if (!post) {
      return c.json({ error: { code: 404, message: '记录不存在' } }, 404);
    }

    // 删除 Vercel Blob 上的图片
    try {
      const imageUrl = post.image_url as string;
      if (imageUrl) {
        await del(imageUrl);
        console.log('已删除 Blob 图片:', imageUrl);
      }
    } catch (imgErr) {
      console.error('删除 Blob 图片失败:', imgErr);
    }

    // 删除数据库记录
    await run('DELETE FROM food_posts WHERE id = ?', [id]);

    return c.json({ data: { success: true } });
  } catch (err) {
    console.error('删除记录失败:', err);
    return c.json(
      { error: { code: 500, message: '删除失败，请重试' } },
      500
    );
  }
});

export default router;
