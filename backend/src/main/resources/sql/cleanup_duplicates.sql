-- ============================================================
-- AI 自学实训平台 · 清理重复种子数据脚本
-- 作用：删掉因多次启动重复插入的种子数据，恢复到每张表只有一套标准数据
-- 用法：用 MySQL Workbench 打开本文件，整段执行即可
-- 说明：重复的特征是「同名字段出现多条」，这里保留每组里 id 最小的那一条
-- ============================================================

USE ai_train_platform;

-- 1. 实训阶段表：按 stage_name 去重
DELETE t1 FROM train_stage t1
INNER JOIN train_stage t2
  ON t1.stage_name = t2.stage_name AND t1.id > t2.id;

-- 2. 任务表：按 (stage_id, task_title) 去重
DELETE t1 FROM task t1
INNER JOIN task t2
  ON t1.stage_id = t2.stage_id AND t1.task_title = t2.task_title AND t1.id > t2.id;

-- 3. 用户表：按 username 去重（保留 id 最小的一条）
DELETE t1 FROM `user` t1
INNER JOIN `user` t2
  ON t1.username = t2.username AND t1.id > t2.id;

-- 4. 微课资源表：按 (task_id, title) 去重
DELETE t1 FROM resource t1
INNER JOIN resource t2
  ON IFNULL(t1.task_id,0) = IFNULL(t2.task_id,0) AND t1.title = t2.title AND t1.id > t2.id;

-- 5. 作业表：重复的作业记录按 (user_id, task_id, submit_time) 去重（保留最早一条）
DELETE t1 FROM homework t1
INNER JOIN homework t2
  ON t1.user_id = t2.user_id AND t1.task_id = t2.task_id
 AND t1.submit_time = t2.submit_time AND t1.id > t2.id;

-- ============================================================
-- 验证：执行完后，以下各表应为标准条数
--   train_stage   = 4
--   task          = 8
--   user          = 3
--   resource      = 6
--   homework      = 你自己提交的数量（无重复即可）
-- ============================================================
SELECT 'train_stage' AS tbl, COUNT(*) AS cnt FROM train_stage
UNION ALL SELECT 'task', COUNT(*) FROM task
UNION ALL SELECT 'user', COUNT(*) FROM `user`
UNION ALL SELECT 'resource', COUNT(*) FROM resource
UNION ALL SELECT 'homework', COUNT(*) FROM homework;
