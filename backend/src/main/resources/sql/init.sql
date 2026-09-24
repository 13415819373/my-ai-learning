-- =============================================
-- AI 自学实训平台 数据库初始化脚本
-- Spring Boot 启动时自动执行（spring.sql.init）
-- =============================================

-- ---------------- 用户表 ----------------
CREATE TABLE IF NOT EXISTS `user` (
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
CREATE TABLE IF NOT EXISTS `train_stage` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `stage_name`  VARCHAR(100) NOT NULL COMMENT '阶段名称',
  `sort`        INT          NOT NULL DEFAULT 0 COMMENT '排序',
  `description` TEXT         COMMENT '阶段简介',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`stage_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实训阶段表';

-- ---------------- 任务卡片表 ----------------
CREATE TABLE IF NOT EXISTS `task` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT,
  `stage_id`       BIGINT       NOT NULL,
  `task_title`     VARCHAR(200) NOT NULL COMMENT '任务标题',
  `task_content`   TEXT         NOT NULL COMMENT '任务描述/约束规则',
  `submit_require` TEXT         COMMENT '提交物清单',
  `score_rule`     TEXT         COMMENT '评分标准',
  `sort`           INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_stage` (`stage_id`),
  UNIQUE KEY `uk_stage_sort` (`stage_id`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务卡片表';

-- ---------------- 微课资源表（参考帮助文档） ----------------
CREATE TABLE IF NOT EXISTS `resource` (
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
CREATE TABLE IF NOT EXISTS `homework` (
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
CREATE TABLE IF NOT EXISTS `homework_review` (
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
-- 种子数据
-- =============================================

-- 示例账号（密码均为 123456，MD5）
INSERT IGNORE INTO `user` (`username`, `password`, `nickname`, `role`) VALUES
('admin',  'e10adc3949ba59abbe56e057f20f883e', '管理员', 'admin'),
('teacher','e10adc3949ba59abbe56e057f20f883e', '张导师', 'teacher'),
('student','e10adc3949ba59abbe56e057f20f883e', '学员小明', 'student');

-- 清理历史重复行 + 补建唯一键（老库幂等；键已存在时 ALTER 报错会被 continue-on-error 忽略）
DELETE t1 FROM `train_stage` t1
  INNER JOIN `train_stage` t2
  WHERE t1.id > t2.id AND t1.stage_name = t2.stage_name;
ALTER TABLE `train_stage` ADD UNIQUE KEY `uk_name` (`stage_name`);

-- 四个实训阶段
INSERT IGNORE INTO `train_stage` (`stage_name`, `sort`, `description`) VALUES
('阶段1：目标拆解与学习路线规划实训', 1, '训练给 AI 提目标需求、识别 AI 输出冗余/错误、裁剪定制学习计划的能力'),
('阶段2：分模块自学实训', 2, '用固定自学流程模板 + 微型挑战任务，训练借助 AI 自学新知识的能力'),
('阶段3：端到端项目实战实训', 3, '以真实小项目为载体，训练需求拆解、架构设计、AI 辅助开发与代码评审能力'),
('阶段4：求职与持续自学复盘实训', 4, '用 AI 做简历、模拟面试，并沉淀一套可持续复用的 AI 自学方法论');

-- 清理历史重复行 + 补建唯一键（老库幂等；键已存在时 ALTER 报错会被 continue-on-error 忽略）
DELETE t1 FROM `task` t1
  INNER JOIN `task` t2
  WHERE t1.id > t2.id AND t1.stage_id = t2.stage_id AND t1.sort = t2.sort;
ALTER TABLE `task` ADD UNIQUE KEY `uk_stage_sort` (`stage_id`, `sort`);

-- 阶段1 任务
INSERT IGNORE INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(1, '生成并定稿你的专属全栈学习路线', '为自己制定一份靠谱的全栈学习路线。\n约束规则：\n1. 提示词里必须写明你的现有基础、每周可投入时长、目标；\n2. AI 输出的初稿一定有坑，必须找出至少 3 处问题并写批注说明；\n3. 修改提示词迭代至少 2 次，产出定稿路线。', 'AI 原始回答 + 迭代对话记录 + 定稿路线 + 3 处缺陷批注', '提示词清晰度 30 / AI缺陷识别 40 / 路线合理性 30', 1),
(1, '识别 AI 生成学习路线的常见陷阱（交互练习）', '平台给出 2 份 AI 生成的学习路线样例，请拖拽标记出其中的错误：技术过时、难度跳级、知识点冗余。', '标记结果截图 + 一句说明为什么这样标记', '识别准确度 100', 2);

-- 阶段2 任务（微型挑战）
INSERT IGNORE INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(2, '微型挑战：写一个带表单的静态页面', '利用 AI，完成一个最小可运行的表单静态页面（HTML+CSS+JS），并能解释核心逻辑。\n规则：\n1. 先自己写下要实现什么功能、猜会用哪些概念（不许问 AI）；\n2. 再向 AI 提问获取解释和代码片段；\n3. 运行代码，遇到报错和 AI 协作排查；\n4. 找出 AI 代码至少 1 处隐患/可优化点，写批注。', '猜想笔记 + AI对话记录 + Demo源码 + AI代码缺陷批注', '先思考再问AI 30 / 提示词精准 30 / 识别AI缺陷 25 / Demo可运行 15', 1),
(2, '微型挑战：做一个待办清单 Demo（Vue）', '利用 AI 完成一个 Vue 待办清单小 Demo，能增删待办。\n规则：先自己思考实现思路，再借助 AI 完成并排查报错，找出 AI 代码至少 1 处可优化点。', 'AI对话记录 + Demo源码 + 缺陷批注', '先思考再问AI 30 / 提示词精准 30 / 识别AI缺陷 25 / Demo可运行 15', 2),
(2, '微型挑战：写一个返回 JSON 的后端接口', '利用 AI 完成一个简单后端接口（Spring Boot / Node 任选），返回 JSON 数据。\n规则：同上，必须包含排查报错的 AI 对话。', 'AI对话记录 + 接口源码 + 缺陷批注', '先思考再问AI 30 / 提示词精准 30 / 识别AI缺陷 25 / 接口可用 15', 3),
(2, '微型挑战：MySQL 建表并实现增删改查', '利用 AI 建一张表，并用代码实现增删改查。\n规则：先自己设计表字段，再借助 AI 校验和完善。', 'AI对话记录 + 建表SQL + CRUD代码', '字段设计 40 / 识别AI缺陷 30 / 可运行 30', 4),
(2, '微型挑战：把 Demo 部署到免费静态服务', '利用 AI 把前面的静态页面/前端 Demo 部署到免费静态托管（如 GitHub Pages / Vercel）。\n规则：遇到部署报错和 AI 协作排查。', 'AI对话记录 + 访问链接 + 部署排错记录', '独立排错 50 / 部署成功 50', 5);

-- 阶段3 任务
INSERT IGNORE INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(3, '端到端项目：简易学习记录平台', '借助 AI 独立完成一个前后端小项目（需求、架构、开发、评审全程）。\n固定流程：\n1. 写需求文档，交给 AI 生成架构方案，审核并修改不合理设计；\n2. 拆成多个小开发任务，逐个迭代；\n3. 每个小任务让 AI 生成代码片段，阅读、修改、本地调试；\n4. 项目完成后调用 AI 做代码评审，评估哪些建议采纳/拒绝并写理由；\n5. 完整跑通项目。', '需求文档(AI初稿+修改版) + 架构文档 + 完整源码 + 开发对话记录 + 代码评审结论', '需求架构拆解 30 / AI协作过程规范 30 / 甄别AI代码与评审 25 / 项目可运行 15', 1);

-- 阶段3 扩展项目：AI 答疑智能体（RAG 校本知识库）
INSERT IGNORE INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(3, '端到端项目：AI 答疑智能体（RAG 校本知识库）', '做一个能回答本校/本课程知识库问题的智能体：把课程资料、FAQ、老师讲义灌进向量库，学生提问后检索相关片段喂给 LLM，生成带引用的回答。\n固定流程：\n1. 先自己写需求文档和架构草图（不许问 AI），列出：支持哪些知识来源、回答是否带引用、是否多轮对话；\n2. 把需求交给 AI 生成架构方案，审核并修改至少 2 处不合理设计（如检索召回策略、chunk 切分大小、是否做 rerank）；\n3. 拆成小任务逐个迭代：文档切分 → embedding → 向量库建表 → 检索 → 拼 prompt → 调 LLM → 前端问答界面；\n4. 每个 chunk 让 AI 生成代码片段，阅读、修改、本地调试，报错和 AI 协作排查；\n5. 重点测试三类 AI 翻车场景：a) 问库里没有的（看会不会胡编）b) 问跨多文档的（看引用对不对）c) 问需要推理的（看幻觉），写出至少 3 处缺陷批注和修复；\n6. 项目完成后调用 AI 做代码评审，评估哪些建议采纳/拒绝并写理由；\n7. 完整跑通项目。', '需求文档(AI初稿+修改版) + 架构文档 + 完整源码 + 开发对话记录 + 3类翻车测试记录 + 缺陷批注 + 代码评审结论 + 可访问演示链接或本地运行截图', '需求架构拆解 20 / RAG流程完整可运行 25 / 识别AI缺陷与翻车测试 25 / 提示词与引用质量 15 / AI协作过程规范 15', 2);

-- 阶段4 任务
INSERT IGNORE INTO `task` (`stage_id`, `task_title`, `task_content`, `submit_require`, `score_rule`, `sort`) VALUES
(4, '用 AI 生成简历并打磨', '使用 AI 生成简历初稿，自己修改打磨，并说明哪些地方 AI 编造/不准确。', '简历(AI原版+修改版) + 甄别说明', '甄别AI编造 50 / 简历质量 50', 1),
(4, 'AI 模拟面试 + 持续自学复盘', '让 AI 模拟面试官进行问答，校验 AI 给出的参考答案；最后输出完整复盘文档，沉淀一套以后可复用的 AI 自学方法论。', '面试对话记录 + 复盘报告', '方法论沉淀 60 / 复盘质量 40', 2);

-- 清理历史重复行 + 补建唯一键（老库幂等；键已存在时 ALTER 报错会被 continue-on-error 忽略）
DELETE t1 FROM `resource` t1
  INNER JOIN `resource` t2
  WHERE t1.id > t2.id AND t1.task_id <=> t2.task_id AND t1.title = t2.title;
ALTER TABLE `resource` ADD UNIQUE KEY `uk_task_title` (`task_id`, `title`);

-- 参考微课资源（作为按需查阅的帮助文档，不是主课程）
INSERT IGNORE INTO `resource` (`task_id`, `title`, `video_url`, `description`) VALUES
(1, '怎么写提示词描述自身基础与目标', '/api/files/placeholder.mp4', '卡住不知道怎么描述时再看'),
(1, 'AI 生成学习路线常见坑清单', NULL, '找不到缺陷时再看'),
(2, '如何判断一条学习路线靠不靠谱', NULL, '识别难度跳级/过时技术'),
(3, '向 AI 提问的标准姿势', NULL, '遇到卡点时的参考'),
(4, 'Vue 待办清单思路讲解', NULL, '写不出思路时再看'),
(8, '如何向 AI 描述报错信息', NULL, '遇到报错时的参考');
