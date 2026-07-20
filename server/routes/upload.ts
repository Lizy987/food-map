/**
 * POST /api/upload — 图片上传
 * 校验文件类型和大小，保存到 uploads/ 目录
 */
import { Hono } from 'hono';
import path from 'path';
import fs from 'fs';
import { generateId } from '../lib/uuid';

const router = new Hono();

// 允许的 MIME 类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 1 * 1024 * 1024; // 1MB

// POST /api/upload
router.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File | undefined;

    // 校验：文件必须存在
    if (!file) {
      return c.json({ error: { code: 400, message: '请选择图片文件' } }, 400);
    }

    // 校验：文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json(
        { error: { code: 400, message: '仅支持 JPG、PNG、WebP 格式的图片' } },
        400
      );
    }

    // 校验：文件大小 ≤ 1MB
    if (file.size > MAX_SIZE) {
      return c.json(
        { error: { code: 400, message: '图片大小不能超过 1MB' } },
        400
      );
    }

    // 生成唯一文件名
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `${generateId()}.${ext}`;

    // 确保 uploads 目录存在
    const uploadsDir = path.join(import.meta.dir, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 写入文件
    const filepath = path.join(uploadsDir, filename);
    const buffer = await file.arrayBuffer();
    await Bun.write(filepath, new Uint8Array(buffer));

    // 返回访问 URL
    const url = `/uploads/${filename}`;
    return c.json({ data: { url } }, 201);
  } catch (err) {
    console.error('上传失败:', err);
    return c.json({ error: { code: 500, message: '图片上传失败，请重试' } }, 500);
  }
});

export default router;
