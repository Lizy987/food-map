/**
 * 数据库层 — Turso (serverless SQLite)
 * 开发/生产共用，通过环境变量切换连接
 */
import { createClient, type Client } from '@libsql/client';

// Turso 连接配置（优先使用环境变量，fallback 到本地 SQLite 文件用于开发）
const TURSO_URL = process.env.TURSO_URL || 'file:data/food-map.db';
const TURSO_TOKEN = process.env.TURSO_TOKEN || '';

let client: Client;

/** 获取数据库客户端（单例） */
export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN || undefined,
    });
    initSchema();
    console.log('📦 数据库已连接:', TURSO_URL.startsWith('file:') ? '本地 SQLite' : 'Turso');
  }
  return client;
}

/** 建表 + 索引 */
function initSchema() {
  client.execute(`
    CREATE TABLE IF NOT EXISTS food_posts (
      id         TEXT PRIMARY KEY,
      dish_name  TEXT NOT NULL,
      store_name TEXT NOT NULL,
      category   TEXT NOT NULL,
      address    TEXT NOT NULL,
      image_url  TEXT NOT NULL,
      latitude   REAL NOT NULL,
      longitude  REAL NOT NULL,
      note       TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  client.execute(`
    CREATE INDEX IF NOT EXISTS idx_posts_category
    ON food_posts(category)
  `);

  client.execute(`
    CREATE INDEX IF NOT EXISTS idx_posts_created
    ON food_posts(created_at DESC)
  `);

  client.execute(`
    CREATE INDEX IF NOT EXISTS idx_posts_coords
    ON food_posts(latitude, longitude)
  `);
}

// ── 辅助查询函数（简化 Turso API 调用）──

/** 查询多行 */
export async function getRows(
  sql: string,
  params?: unknown[]
): Promise<Record<string, unknown>[]> {
  const rs = await getDb().execute({
    sql,
    args: params as any[] | undefined,
  });
  return rs.rows as Record<string, unknown>[];
}

/** 查询单行 */
export async function getRow(
  sql: string,
  params?: unknown[]
): Promise<Record<string, unknown> | null> {
  const rows = await getRows(sql, params);
  return rows[0] ?? null;
}

/** 执行写入（INSERT/UPDATE/DELETE） */
export async function run(
  sql: string,
  params?: unknown[]
): Promise<void> {
  await getDb().execute({ sql, args: params as any[] | undefined });
}

/** 关闭数据库连接 */
export function closeDb() {
  if (client) {
    client.close();
  }
}
