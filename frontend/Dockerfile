# ===== 阶段1：Node 构建 dist =====
FROM node:20-alpine AS builder

WORKDIR /build
# 先拷依赖清单，利用缓存
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# 再拷源码构建
COPY . .
RUN npm run build

# ===== 阶段2：nginx 托管静态文件 =====
FROM nginx:alpine

# 清空默认配置，拷自己的
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 拷 dist 进 nginx 默认目录
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80
