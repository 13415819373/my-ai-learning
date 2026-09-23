package com.aitrain.platform.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("train_stage")
public class TrainStage {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 阶段名称，如：阶段1：路线规划实训 */
    private String stageName;

    /** 排序 */
    private Integer sort;

    /** 阶段简介 */
    private String description;
}
