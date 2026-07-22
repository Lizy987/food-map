/**
 * SQLite 数据库初始化与管理
 * 使用 bun:sqlite 内置模块，无需额外依赖
 */
import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';

// 数据库文件路径（项目根目录下的 data/ 目录）
const DB_PATH = path.join(import.meta.dir, '..', 'data', 'food-map.db');

let db: Database;

/** 获取数据库实例（单例模式，首次调用时初始化） */
export function getDb(): Database {
  if (!db) {
    // 确保 data 目录存在
    const dataDir = path.join(import.meta.dir, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH, { create: true, strict: true });

    // 性能优化
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA synchronous = NORMAL');

    initSchema();
    console.log('📦 SQLite 数据库已初始化:', DB_PATH);
  }
  return db;
}

/** 建表 + 索引 + 兼容迁移 */
function initSchema() {
  // ── 用户表 ──
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // ── 帖子表 ──
  db.run(`
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
      user_id    TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 兼容迁移：旧表没有 user_id 列
  try {
    db.run('ALTER TABLE food_posts ADD COLUMN user_id TEXT');
  } catch {
    // 列已存在则忽略
  }

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_posts_category
    ON food_posts(category)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_posts_created
    ON food_posts(created_at DESC)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_posts_coords
    ON food_posts(latitude, longitude)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_posts_user
    ON food_posts(user_id)
  `);
}

/** 关闭数据库连接 */
export function closeDb() {
  if (db) {
    db.close();
  }
}
