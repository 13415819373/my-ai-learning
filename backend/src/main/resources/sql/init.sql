-- =============================================
-- AI 自学实训平台 数据库初始化脚本
-- 开发期模式：每次启动 DROP 重建表 + 灌种子
-- 改了本文件，重启后端立即生效（pom.xml 已配 resources overwrite=true）
-- 上线前请改为幂等模式（CREATE IF NOT EXISTS + INSERT IGNORE）或关闭 spring.sql.init
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 按依赖反序删除旧表
DROP TABLE IF EXISTS `homework_review`;
DROP TABLE IF EXISTS `homework`;
DROP TABLE IF EXISTS `resource`;
DROP TABLE IF EXISTS `task`;
DROP TABLE IF EXISTS `train_stage`;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------- 用户表 ----------------
CREATE TABLE `user` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `username`    VARCHAR(50)  NOT NULL COMMENT '账号',
  `password`    VARCHAR(100) NOT NULL COMMENT 'MD5密码',
  `nickname`    VARCHAR(50)  DEFAULT NULL COMMENT '昵称',
  `role`        VARCHAR(20)  NOT NULL DEFAULT 'student' COMMENT 'student/teacher/admin',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ---------------- 实训阶段表 ----------------
CREATE TABLE `train_stage` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `stage_name`  VARCHAR(100) NOT NULL COMMENT '阶段名称',
  `sort`        INT          NOT NULL DEFAULT 0 COMMENT '排序',
  `description` TEXT         COMMENT '阶段简介',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`stage_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实训阶段表';

-- ---------------- 任务卡片表 ----------------
CREATE TABLE `task` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT,
  `stage_id`       BIGINT       NOT NULL,
  `task_title`     VARCHAR(200) NOT NULL COMMENT '任务标题',
  `task_content`   TEXT         NOT NULL COMMENT '任务描述/带教步骤（编号行会被前端解析成可勾选步骤）',
  `submit_require` TEXT         COMMENT '提交物清单',
  `score_rule`     TEXT         COMMENT '评分标准',
  `sort`           INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_stage` (`stage_id`),
  UNIQUE KEY `uk_stage_sort` (`stage_id`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务卡片表';

-- ---------------- 微课资源表（按需查阅的帮助文档） ----------------
CREATE TABLE `resource` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `task_id`     BIGINT       DEFAULT NULL,
  `title`       VARCHAR(200) NOT NULL,
  `video_url`   VARCHAR(500) DEFAULT NULL,
  `description` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  UNIQUE KEY `uk_task_title` (`task_id`, `title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微课资源表';

-- ---------------- 作业表 ----------------
CREATE TABLE `homework` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT       NOT NULL,
  `task_id`     BIGINT       NOT NULL,
  `ai_dialog`   TEXT         COMMENT '粘贴的AI对话文本',
  `file_urls`   VARCHAR(2000) DEFAULT NULL COMMENT '上传文件地址，逗号分隔',
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending/reviewed',
  `submit_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `deleted`     INT          NOT NULL DEFAULT 0 COMMENT '逻辑删除 0/1',
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_task` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业表';

-- ---------------- 作业批改表 ----------------
CREATE TABLE `homework_review` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `homework_id` BIGINT       NOT NULL,
  `teacher_id`  BIGINT       NOT NULL,
  `score`       INT          NOT NULL COMMENT '0-100',
  `comment`     TEXT,
  `review_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_homework` (`homework_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业批改表';

-- =============================================
-- 种子数据（表是新建的，直接 INSERT）
-- =============================================

-- 示例账号（密码均为 123456，MD5）
INSERT INTO `user` (`username`, `password`, `nickname`, `role`) VALUES
('admin',  'e10adc3949ba59abbe56e057f20f883e', '管理员', 'admin'),
('teacher','e10adc3949ba59abbe56e057f20f883e', '张导师', 'teacher'),
('student','e10adc3949ba59abbe56e057f20f883e', '学员小明', 'student');

-- =============================================
-- 课程主线：奔着「造一个 AI 答疑机器人」去
-- 5 步倒推，每步直接动手 + 做完有可见成果 + 缺的概念当场补
-- =============================================
INSERT INTO `train_stage` (`stage_name`, `sort`, `description`) VALUES
('第1步·让机器人会说话', 1, '跑通一个大模型，命令行里就能跟机器人聊天——先把成果拿到手'),
('第2步·让机器人懂本校知识', 2, '把课程文档灌进向量库做 RAG 检索，机器人回答带本校内容'),
('第3步·让机器人不胡编', 3, '测三类翻车场景 + 加兜底，不知道就说不知道'),
('第4步·给机器人一个界面', 4, '套个网页，浏览器里直接跟机器人对话'),
('第5步·把机器人上线', 5, '部署出去，老师同学都能访问你的机器人');

-- 第1步任务
INSERT INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(1, '让机器人先会说话：跑通一个大模型', '目标：让机器人先会说话——跑通一个大模型，在命令行里就能跟它聊天，第一版机器人今天就活起来。\n怎么动手：\n1. 注册智谱 GLM 开放平台（或 DeepSeek），拿到一个 API 密钥；\n2. 装好 Python，pip install zhipuai；\n3. 写 10 行代码：把你的问题发给大模型，把回答打印出来；\n4. 运行，在终端里跟机器人聊几句。\n做完你会看到：你打字、机器人回话，第一版机器人活了。\n不懂的概念当场补：什么是 API、什么是密钥、pip 是什么、大模型怎么收费。\nAI 协作训练点：先自己猜「调大模型的代码大概长啥样」（不许先问 AI），再让 AI 给你代码，报错了和 AI 一起排查，最后找出 AI 给的代码至少 1 处可优化。', 'API 密钥（脱敏）+ 对话代码 + 终端聊天截图 + AI 代码缺陷批注', '先猜再问 AI 30 / 提示词精准 30 / 识别 AI 缺陷 25 / 机器人能聊 15', 1);

-- 第2步任务
INSERT INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(2, '让机器人懂本校知识：灌文档做 RAG 检索', '目标：让机器人懂本校知识——把课程文档灌进向量库，机器人回答能引用本校内容。\n怎么动手：\n1. 准备 1-2 份课程文档（讲义 / FAQ / PDF 都行）；\n2. 把文档切成小段（chunk）；\n3. 用 embedding 模型把每段转成向量，存进 Chroma 向量库；\n4. 学生提问时：先检索相关段落，再把段落 + 问题一起发给大模型；\n5. 让机器人回答时带上引用来源。\n做完你会看到：问「这门课讲什么」它能答出文档里的内容，还标了引用。\n不懂的概念当场补：什么是 embedding、什么是向量库、chunk 切多大、为什么要先检索。\nAI 协作训练点：先自己画 RAG 流程草图（不许问 AI），再让 AI 生成代码，重点审 AI 给的「检索召回策略」和「chunk 大小」合不合理，找出至少 2 处可改。', '课程文档 + RAG 代码 + 问答截图（带引用）+ AI 架构缺陷批注', '流程草图 25 / RAG 可运行 30 / 识别 AI 缺陷 25 / 带引用 20', 1);

-- 第3步任务
INSERT INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(3, '让机器人不胡编：主动找茬 + 加兜底', '目标：让机器人不胡编——主动找它的茬，加上兜底让它老实。\n怎么动手：\n1. 测三类翻车：a) 问库里没有的（看它编不编）b) 问跨多文档的（看引用对不对）c) 问需要推理的（看幻觉）；\n2. 给每类翻车写批注：它怎么翻的、为什么；\n3. 加兜底：检索不到相关内容时，让机器人直接说「我不知道」，不要硬编；\n4. 重测，确认翻车被修住。\n做完你会看到：问它不知道的，它会老实说不知道，不再瞎编。\n不懂的概念当场补：什么是幻觉、召回率、rerank。\nAI 协作训练点：翻车场景你自己设计，让 AI 帮你写兜底逻辑，审 AI 的兜底方案有没有漏洞。', '3 类翻车测试记录 + 缺陷批注 + 兜底代码 + 修复前后对比', '翻车场景设计 30 / 缺陷识别 30 / 兜底有效 25 / 对比清晰 15', 1);

-- 第4步任务
INSERT INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(4, '给机器人一个界面：套个网页', '目标：给机器人一个界面——套个网页，浏览器里直接聊。\n怎么动手：\n1. 用 Gradio（pip install gradio），10 行代码把你的机器人套个网页界面；\n2. 加个输入框 + 对话区，能多轮聊天；\n3. 本地跑起来，浏览器打开就能用。\n做完你会看到：浏览器里有个聊天框，你跟机器人一来一回。\n不懂的概念当场补：什么是前端组件、Gradio 怎么跑、多轮对话怎么存上下文。\nAI 协作训练点：先自己想界面长啥样，让 AI 生成 Gradio 代码，报错和 AI 排查，找出 AI 代码至少 1 处可优化。', '界面代码 + 浏览器对话截图 + AI 代码缺陷批注', '先想再问 AI 30 / 界面可用 30 / 识别 AI 缺陷 25 / 多轮对话 15', 1);

-- 第5步任务
INSERT INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(5, '把机器人上线：部署出去', '目标：把机器人上线——部署出去，老师同学都能访问，你的作品能写进简历了。\n怎么动手：\n1. 选个免费托管（如 Hugging Face Spaces / Streamlit Cloud）；\n2. 把代码推上去，配置好密钥；\n3. 拿到一个公开链接；\n4. 发给同学试玩，收集反馈。\n做完你会看到：一个别人也能打开的机器人链接。\n不懂的概念当场补：什么是部署、环境变量、免费托管的限制。\nAI 协作训练点：部署报错和 AI 一起排查，独立解决至少 1 个部署坑。', '部署链接 + 同学试玩反馈 + 部署排错记录', '独立排错 50 / 部署成功 50', 1);

-- 参考微课（按需查阅，不是主课程）
INSERT INTO `resource` (`task_id`, `title`, `video_url`, `description`) VALUES
(1, '怎么注册智谱 GLM 拿 API 密钥', NULL, '不知道去哪拿 key 时再看'),
(1, 'Python 环境和 pip 怎么装', NULL, '没装过 Python 时看'),
(2, 'RAG 原理一句话讲清', NULL, '不懂检索增强时看'),
(2, 'Chroma 向量库怎么用', NULL, '向量库卡住时看'),
(3, '大模型幻觉是什么', NULL, '不懂翻车原理时看'),
(4, 'Gradio 怎么快速出界面', NULL, '界面写不出时看'),
(5, '免费托管平台对比', NULL, '不知道部署到哪时看');
