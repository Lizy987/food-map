# 美食地图 — Docker 镜像
# 基于 Bun 官方镜像，单进程运行 API + SPA 静态文件
FROM oven/bun:1-alpine

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production

# 复制依赖文件并安装（利用 Docker 缓存层加速构建）
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 复制全部源码
COPY . .

# 构建前端 SPA → dist/
RUN bun run build

# 确保持久化目录存在
RUN mkdir -p /app/data /app/uploads

# 暴露端口
EXPOSE 3000

# 启动：Bun 运行 Hono 服务器，同时提供 API + 静态文件
CMD ["bun", "run", "start"]
