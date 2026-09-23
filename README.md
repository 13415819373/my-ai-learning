# AI 自学实训平台

> 不是教知识的平台，而是训练用户**「借助 AI 自学新领域」能力**的实训平台。
> 以「借助 AI 自学全栈工程师」为练习载体，任务驱动，微课仅作为按需查阅的帮助文档。

## 技术栈

| 端 | 技术 |
|---|---|
| 前端 | React 18 + Vite + React Router + Axios |
| 后端 | Spring Boot 3.3 + MyBatis-Plus + JWT |
| 数据库 | MySQL 8 |

## 目录结构

```
0923 AI 自学实训平台/
├── backend/                 # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/aitrain/platform/
│       │   ├── PlatformApplication.java
│       │   ├── common/       # 统一返回、异常、JWT、认证拦截器
│       │   ├── config/       # 跨域、拦截器、静态资源
│       │   ├── controller/   # 认证、任务、作业、文件上传
│       │   ├── service/      # 业务逻辑
│       │   ├── mapper/       # MyBatis-Plus Mapper
│       │   ├── entity/       # 实体
│       │   └── dto/          # 请求/返回对象
│       └── resources/
│           ├── application.yml
│           └── sql/init.sql  # 建库建表 + 种子数据
└── frontend/                # React 前端
    └── src/
        ├── api/              # Axios 封装与接口
        ├── context/          # 登录态
        ├── components/       # 布局
        └── pages/            # 登录/实训中心/任务/提交/批改
```

## 启动步骤

### 1. 数据库

1. 本地安装并启动 MySQL 8。
2. 用任意 MySQL 客户端（如 Navicat / 命令行）执行：

```sql
source D:/张燕南的生涯文件/工作/2026/09/0923 AI 自学实训平台/backend/src/main/resources/sql/init.sql
```

> 脚本会创建 `ai_train_platform` 库、5 张表，并写入种子数据（4 个阶段、8 个任务、示例账号）。

### 2. 后端（Spring Boot）

1. 打开 `backend/src/main/resources/application.yml`，把 `spring.datasource` 的 `username` / `password` 改成你自己的 MySQL 账号密码。
2. 确认本机已安装 JDK 17 + Maven。
3. 启动：

```bash
cd backend
mvn spring-boot:run
```

后端默认运行在 `http://localhost:6001`。上传的文件存到运行目录下的 `./upload`。

### 3. 前端（React）

1. 确认本机已安装 Node.js 18+。
2. 启动：

```bash
cd frontend
npm install
npm run dev
```

浏览器访问 `http://localhost:6000`。Vite 已配置 `/api` 代理转发到后端，无跨域问题。

## 演示账号

| 账号 | 密码 | 角色 |
|---|---|---|
| admin | 123456 | 管理员 |
| teacher | 123456 | 导师（可批改作业） |
| student | 123456 | 学员 |

## 核心接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/login | 登录，返回 token |
| POST | /api/auth/register | 注册（默认学员） |
| GET | /api/stage/list | 实训阶段列表 |
| GET | /api/task/list?stageId= | 某阶段下的任务 |
| GET | /api/task/{id} | 任务详情（含参考微课） |
| POST | /api/homework/submit | 学生提交作业 |
| GET | /api/homework/my | 我的作业（含批改结果） |
| GET | /api/homework/list | 全部作业（导师/管理员） |
| POST | /api/homework/review | 导师批改 |
| POST | /api/file/upload | 文件上传 |

## 教学理念（产品定位）

- **任务驱动**：学员直接接任务动手实操，微课是"帮助文档"，卡住了才按需查阅，不是先看一堆视频。
- **考核的是"驾驭 AI 的能力"**，不是代码水平：重点看学员是否先独立思考再问 AI、提示词是否精准、能否识别 AI 的错误/幻觉。
- **反抄袭规则**：作业强制要求提交"AI 原始输出 + 学员修改后的版本 + 批注"，防止直接复制 AI 成品。
- **MVP 刻意不内置 AI 对话**：学员用外部 AI（豆包等），把对话记录粘贴进平台即可，大幅降低开发与 token 成本，业务跑通后再考虑内嵌。

## 后续可扩展

- 平台内嵌 AI 对话（接入大模型 API）
- 导师管理后台（任务/微课资源 CRUD）
- 优秀作业案例墙、学员互评
- 阶段进度可视化、结业答辩
