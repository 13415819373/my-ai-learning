package com.aitrain.platform.dto;

import lombok.Data;

import java.util.List;

@Data
public class HomeworkSubmitRequest {

    private Long taskId;

    /** 粘贴的 AI 对话文本 */
    private String aiDialog;

    /** 文件地址列表 */
    private List<String> fileUrls;
}
