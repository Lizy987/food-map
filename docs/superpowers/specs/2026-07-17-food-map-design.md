# 美食地图 — 设计规格说明

> 日期：2026-07-17 | 版本：v2.1 | 关联 PRD：`docs/PRD-美食地图-v1.md`

## 1. 产品概述

个人使用的移动端 H5 美食地图。拍照 → 手动选点 → 上传，所有记录在地图上可视化。本地运行，无需任何外部服务依赖。

- **用户**：仅自己，无登录
- **定位**：手动地图选点 + 手动输入地址
- **上传**：上传即展示，无需审核
- **运行**：本地 `bun run`，无需云服务

## 2. 技术方案

| 层 | 选型 |
|---|---|
| 前端 | React 18 + Vite + TypeScript + Tailwind CSS |
| 地图 | Leaflet + OpenStreetMap（免费，无需 API Key） |
| 后端 | Bun + Hono + TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| 图片存储 | 本地 `uploads/` |
| 运行 | `bun run dev` 本地进程 |

## 3. 数据模型

### food_posts

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | TEXT | PK, UUID | — |
| dish_name | TEXT | NOT NULL | 菜名 |
| store_name | TEXT | NOT NULL | 店名 |
| category | TEXT | NOT NULL | 11 种分类枚举 |
| address | TEXT | NOT NULL | 手动填写 |
| image_url | TEXT | NOT NULL | 图片路径 |
| latitude | REAL | NOT NULL | 地图选点 |
| longitude | REAL | NOT NULL | 地图选点 |
| note | TEXT | — | 备注 |
| created_at | TEXT | DEFAULT NOW | — |
| updated_at | TEXT | DEFAULT NOW | — |

分类：火锅 | 川菜 | 粤菜 | 日料 | 韩餐 | 西餐 | 烧烤 | 小吃 | 甜品 | 咖啡 | 其他

## 4. 页面与路由

| 路由 | 页面 |
|---|---|
| `/` | 首页（地图 + 列表 + 分类筛选 + 导出按钮） |
| `/upload` | 上传美食 |
| `/food/:id` | 美食详情（含编辑/删除操作） |
| `/food/:id/edit` | 编辑美食（复用上传表单） |

## 5. API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/posts` | 列表查询 |
| GET | `/api/posts/:id` | 单条详情 |
| POST | `/api/posts` | 创建记录 |
| PUT | `/api/posts/:id` | 编辑记录 |
| DELETE | `/api/posts/:id` | 删除记录（含图片文件） |
| POST | `/api/upload` | 上传图片 |
| GET | `/api/posts/export/csv` | CSV 导出 |
| GET | `/api/categories` | 分类列表 |

共 8 个端点，无需认证。

## 6. 核心流程

### 上传
拍照/选图 → 前端压缩 ≤ 1MB → 填菜名/店名/分类/地址 → 地图手动选点 → 提交

### 编辑
详情页点编辑 → 表单预填所有字段 → 修改 → 提交（图片可换/可不换）

### 删除
详情页点删除 → 确认框 → 删记录 + 删图片文件 → 回首页

### 导出
首页点导出 → 服务端生成 CSV → 浏览器下载

### 浏览
地图 + 列表联动，分类筛选两端同步

## 7. 边界情况

| 场景 | 处理 |
|---|---|
| 图片过大 | 前端压缩 ≤ 1MB，后端二次校验 |
| 地图选点未操作 | 提交校验，提示"请在地图上选择位置" |
| 必填为空 | 前端 + Zod 双重校验 |
| 网络异常 | toast + 重试 |
| 空数据 | "还没有美食记录，去上传第一个吧！" |
| 编辑未换图 | 保留原 image_url |
| 删除确认 | 确认对话框，防止误操作 |
| OSM 瓦片失败 | 重试按钮 |

## 8. 错误处理

| 层 | 策略 |
|---|---|
| 前端 | API 统一封装，toast 错误 + 重试，全状态覆盖 |
| 后端 | Hono 错误中间件，`{ error: { code, message } }`，Zod 校验 |
| 数据库 | 写失败 500，读异常空数组降级 |

## 9. 测试

| 类型 | 范围 | 工具 |
|---|---|---|
| API 测试 | 全端点正常/异常 | Bun test + fetch |
| 前端 | 手工验证 | — |
