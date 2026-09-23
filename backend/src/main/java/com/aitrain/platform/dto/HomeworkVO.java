package com.aitrain.platform.dto;

import com.aitrain.platform.entity.Homework;
import com.aitrain.platform.entity.HomeworkReview;
import lombok.Data;

@Data
public class HomeworkVO {

    private Homework homework;

    /** 学生昵称 */
    private String studentName;

    /** 任务标题 */
    private String taskTitle;

    /** 阶段名称 */
    private String stageName;

    /** 批改结果 */
    private HomeworkReview review;
}
