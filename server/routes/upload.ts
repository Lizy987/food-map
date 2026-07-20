/**
 * POST /api/upload — 图片上传
 * 校验文件类型和大小，上传到 Vercel Blob
 */
import { Hono } from 'hono';
import { put } from '@vercel/blob';

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
    const filename = `${crypto.randomUUID()}.${ext}`;

    // 上传到 Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return c.json({ data: { url: blob.url } }, 201);
  } catch (err) {
    console.error('上传失败:', err);
    return c.json(
      { error: { code: 500, message: '图片上传失败，请重试' } },
      500
    );
  }
});

export default router;
