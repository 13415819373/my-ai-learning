package com.aitrain.platform.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("homework_review")
public class HomeworkReview {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long homeworkId;

    private Long teacherId;

    private Integer score;

    private String comment;

    private LocalDateTime reviewTime;
}
