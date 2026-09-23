package com.aitrain.platform.controller;

import com.aitrain.platform.common.Result;
import com.aitrain.platform.common.UserContext;
import com.aitrain.platform.dto.HomeworkSubmitRequest;
import com.aitrain.platform.dto.HomeworkVO;
import com.aitrain.platform.dto.ReviewSaveRequest;
import com.aitrain.platform.entity.User;
import com.aitrain.platform.service.HomeworkService;
import com.aitrain.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/homework")
public class HomeworkController {

    private final HomeworkService homeworkService;
    private final UserService userService;

    public HomeworkController(HomeworkService homeworkService, UserService userService) {
        this.homeworkService = homeworkService;
        this.userService = userService;
    }

    /**
     * 学生提交作业
     */
    @PostMapping("/submit")
    public Result<Void> submit(@Valid @RequestBody HomeworkSubmitRequest request) {
        homeworkService.submit(UserContext.getUserId(), request);
        return Result.ok();
    }

    /**
     * 我的作业列表
     */
    @GetMapping("/my")
    public Result<List<HomeworkVO>> my() {
        return Result.ok(homeworkService.myHomeworks(UserContext.getUserId()));
    }

    /**
     * 全部作业（仅导师/管理员）
     */
    @GetMapping("/list")
    public Result<List<HomeworkVO>> list(@RequestParam(required = false) String status) {
        checkTeacher();
        return Result.ok(homeworkService.listAll(status));
    }

    /**
     * 导师批改
     */
    @PostMapping("/review")
    public Result<Void> review(@Valid @RequestBody ReviewSaveRequest request) {
        checkTeacher();
        homeworkService.review(UserContext.getUserId(), request.getHomeworkId(), request.getScore(), request.getComment());
        return Result.ok();
    }

    private void checkTeacher() {
        User user = userService.getById(UserContext.getUserId());
        if (user == null || !("teacher".equals(user.getRole()) || "admin".equals(user.getRole()))) {
            throw new com.aitrain.platform.common.BusinessException(403, "无权限：仅导师或管理员可操作");
        }
    }
}
