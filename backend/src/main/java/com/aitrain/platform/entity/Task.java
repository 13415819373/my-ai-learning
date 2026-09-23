package com.aitrain.platform.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("task")
public class Task {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long stageId;

    private String taskTitle;

    /** 任务描述、约束规则 */
    private String taskContent;

    /** 提交物清单 */
    private String submitRequire;

    /** 评分标准 */
    private String scoreRule;

    /** 排序 */
    private Integer sort;
}
