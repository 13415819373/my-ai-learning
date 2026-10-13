package com.aitrain.platform.controller;

import com.aitrain.platform.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    @Value("${resend.api-key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * 发送验证码邮件（调 Resend API）
     */
    @PostMapping("/send-email")
    public Result<Map<String, String>> sendEmail(@RequestBody Map<String, String> body) {
        String to = body.get("to");
        if (to == null || to.isBlank()) {
            return Result.error("缺少收件邮箱");
        }
        // 生成 6 位验证码
        String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        // 拼 Resend 要的 JSON
        String payload = "{"
                + "\"from\":\"onboarding@resend.dev\","
                + "\"to\":\"" + to + "\","
                + "\"subject\":\"你的验证码\","
                + "\"html\":\"<p>你的验证码是：<strong>" + code + "</strong></p>\""
                + "}";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();
            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                return Result.error("发送失败：" + resp.body());
            }
            return Result.ok(Map.of("ok", "true", "code", code));
        } catch (Exception e) {
            return Result.error("发送失败：" + e.getMessage());
        }
    }
}
