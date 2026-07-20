/**
 * Vercel Serverless 入口 — 处理所有 /api/* 请求
 * vercel.json 将 /api/(.*) 重写到 /api/[[route]]
 */
import { handle } from 'hono/vercel';
import app from '../server/app';

// 复用 server/app.ts 中定义的 Hono 实例
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
