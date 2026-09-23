package com.aitrain.platform.controller;

import com.aitrain.platform.common.Result;
import com.aitrain.platform.entity.Task;
import com.aitrain.platform.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/stage/list")
    public Result<List<Map<String, Object>>> stageList() {
        return Result.ok(taskService.stageList());
    }

    @GetMapping("/task/list")
    public Result<List<Task>> taskList(@RequestParam Long stageId) {
        return Result.ok(taskService.listByStage(stageId));
    }

    @GetMapping("/task/{id}")
    public Result<Map<String, Object>> taskDetail(@PathVariable Long id) {
        return Result.ok(taskService.detail(id));
    }
}
