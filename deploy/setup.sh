#!/bin/bash
# ═══════════════════════════════════════════════
# 美食地图 — ECS 服务器一键部署脚本
# 在 Ubuntu 22.04 / Debian 12 上执行
# ═══════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
NC='\033[0m'
APP_DIR="/opt/food-map"

echo "=========================================="
echo "  美食地图 — 服务器部署"
echo "=========================================="

# ── 1. 安装系统依赖 ──
echo -e "${GREEN}[1/6] 安装系统依赖...${NC}"
apt update -y
apt install -y git unzip curl

# ── 2. 安装 Bun ──
if ! command -v bun &> /dev/null; then
  echo -e "${GREEN}[2/6] 安装 Bun 运行时...${NC}"
  curl -fsSL https://bun.sh/install | bash
  # 添加到当前 shell
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  # 持久化到 profile
  echo 'export BUN_INSTALL="$HOME/.bun"' >> /root/.bashrc
  echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /root/.bashrc
else
  echo -e "${GREEN}[2/6] Bun 已安装，跳过。${NC}"
fi

# ── 3. 克隆/更新项目 ──
echo -e "${GREEN}[3/6] 部署项目代码...${NC}"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git pull
else
  # 替换为你的仓库地址！
  echo "请先将项目推送到 GitHub，然后在此脚本中设置仓库地址"
  echo "编辑 $0，修改 GIT_REPO 变量"
  exit 1
fi

# ── 4. 安装依赖 + 构建前端 ──
echo -e "${GREEN}[4/6] 安装依赖并构建...${NC}"
cd "$APP_DIR"
bun install
bun run build

# ── 5. 创建数据目录 ──
echo -e "${GREEN}[5/6] 创建数据目录...${NC}"
mkdir -p "$APP_DIR/data" "$APP_DIR/uploads"

# ── 6. 用 PM2 启动服务 ──
echo -e "${GREEN}[6/6] 启动服务...${NC}"
cd "$APP_DIR"

# 首次安装 PM2
if ! command -v pm2 &> /dev/null; then
  bun add -g pm2
fi

# 停止旧进程（如果存在）
pm2 delete food-map 2>/dev/null || true

# 启动
NODE_ENV=production pm2 start server/index.ts \
  --interpreter bun \
  --name food-map \
  --log "$APP_DIR/logs/pm2.log"

# 保存 PM2 进程列表（开机自启）
pm2 save

# 设置 PM2 开机自启（首次需要）
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "=========================================="
echo -e "  ${GREEN}✅ 部署完成！${NC}"
echo "  访问: http://$(curl -s ifconfig.me):3000"
echo "  日志: pm2 logs food-map"
echo "  状态: pm2 status"
echo "=========================================="
