package com.aitrain.platform.service;

import com.aitrain.platform.entity.Task;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;
import java.util.Map;

public interface TaskService extends IService<Task> {

    /**
     * 获取全部阶段（含阶段下的任务数量）
     */
    List<Map<String, Object>> stageList();

    /**
     * 获取某阶段下的所有任务
     */
    List<Task> listByStage(Long stageId);

    /**
     * 获取任务详情（含关联的参考微课资源）
     */
    Map<String, Object> detail(Long taskId);
}
