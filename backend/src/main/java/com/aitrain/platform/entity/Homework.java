package com.aitrain.platform.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("homework")
public class Homework {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long taskId;

    /** 粘贴的 AI 对话文本 */
    private String aiDialog;

    /** 上传文件地址，可多个用逗号分隔 */
    private String fileUrls;

    /** pending / reviewed */
    private String status;

    private LocalDateTime submitTime;

    /** 逻辑删除 */
    @TableLogic
    private Integer deleted;
}
