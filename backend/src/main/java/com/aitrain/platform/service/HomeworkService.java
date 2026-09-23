package com.aitrain.platform.service;

import com.aitrain.platform.dto.HomeworkSubmitRequest;
import com.aitrain.platform.dto.HomeworkVO;

import java.util.List;

public interface HomeworkService {

    /**
     * 学生提交作业
     */
    void submit(Long userId, HomeworkSubmitRequest request);

    /**
     * 查询某学生的作业列表（含批改结果）
     */
    List<HomeworkVO> myHomeworks(Long userId);

    /**
     * 导师/管理员：查询全部作业（可按状态筛选）
     */
    List<HomeworkVO> listAll(String status);

    /**
     * 导师批改
     */
    void review(Long teacherId, Long homeworkId, Integer score, String comment);
}
