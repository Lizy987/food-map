/**
 * GET /api/categories — 返回所有美食分类列表
 */
import { Hono } from 'hono';

// 分类枚举（11 种）
export const CATEGORIES = [
  '火锅',
  '川菜',
  '粤菜',
  '日料',
  '韩餐',
  '西餐',
  '烧烤',
  '小吃',
  '甜品',
  '咖啡',
  '其他',
] as const;

export type Category = (typeof CATEGORIES)[number];

const router = new Hono();

// GET /api/categories
router.get('/', (c) => {
  return c.json({ data: CATEGORIES });
});

export { CATEGORIES as categories };
export default router;
