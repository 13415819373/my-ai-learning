package com.aitrain.platform.service.impl;

import com.aitrain.platform.common.BusinessException;
import com.aitrain.platform.entity.Resource;
import com.aitrain.platform.entity.Task;
import com.aitrain.platform.entity.TrainStage;
import com.aitrain.platform.mapper.ResourceMapper;
import com.aitrain.platform.mapper.TaskMapper;
import com.aitrain.platform.mapper.TrainStageMapper;
import com.aitrain.platform.service.TaskService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {

    private final TrainStageMapper trainStageMapper;
    private final ResourceMapper resourceMapper;

    public TaskServiceImpl(TrainStageMapper trainStageMapper, ResourceMapper resourceMapper) {
        this.trainStageMapper = trainStageMapper;
        this.resourceMapper = resourceMapper;
    }

    @Override
    public List<Map<String, Object>> stageList() {
        List<TrainStage> stages = trainStageMapper.selectList(
                new LambdaQueryWrapper<TrainStage>().orderByAsc(TrainStage::getSort));
        List<Map<String, Object>> result = new ArrayList<>();
        for (TrainStage stage : stages) {
            Long taskCount = count(new LambdaQueryWrapper<Task>().eq(Task::getStageId, stage.getId()));
            Map<String, Object> item = new HashMap<>();
            item.put("id", stage.getId());
            item.put("stageName", stage.getStageName());
            item.put("description", stage.getDescription());
            item.put("sort", stage.getSort());
            item.put("taskCount", taskCount);
            result.add(item);
        }
        return result;
    }

    @Override
    public List<Task> listByStage(Long stageId) {
        return list(new LambdaQueryWrapper<Task>()
                .eq(Task::getStageId, stageId)
                .orderByAsc(Task::getSort));
    }

    @Override
    public Map<String, Object> detail(Long taskId) {
        Task task = getById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        TrainStage stage = trainStageMapper.selectById(task.getStageId());
        List<Resource> resources = resourceMapper.selectList(
                new LambdaQueryWrapper<Resource>().eq(Resource::getTaskId, taskId));

        Map<String, Object> result = new HashMap<>();
        result.put("task", task);
        result.put("stage", stage == null ? null : stage.getStageName());
        result.put("resources", resources);
        return result;
    }
}
