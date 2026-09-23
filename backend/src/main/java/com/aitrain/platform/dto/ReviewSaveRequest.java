package com.aitrain.platform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewSaveRequest {

    @NotNull(message = "作业ID不能为空")
    private Long homeworkId;

    @Min(value = 0, message = "分数不能小于0")
    @Max(value = 100, message = "分数不能大于100")
    private Integer score;

    private String comment;
}
