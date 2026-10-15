package com.aitrain.platform.controller;

import com.aitrain.platform.common.Result;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * 读取公开 GitHub 仓库：返回仓库信息 + 文件树（只读，不需要 token）
     */
    @PostMapping("/repo")
    public Result<Map<String, Object>> repo(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return Result.error("缺少仓库地址");
        }
        // 从 https://github.com/owner/repo 里拆出 owner 和 repo
        String clean = url.replace("https://github.com/", "").replace("http://github.com/", "").replaceAll("/$", "");
        String[] parts = clean.split("/");
        if (parts.length < 2) {
            return Result.error("地址格式应为 https://github.com/用户名/仓库名");
        }
        String owner = parts[0];
        String repo = parts[1];
        try {
            // 1. 拿仓库信息（确认存在、拿默认分支）
            HttpResponse<String> info = httpClient.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create("https://api.github.com/repos/" + owner + "/" + repo))
                            .header("Accept", "application/vnd.github+json")
                            .GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (info.statusCode() == 404) {
                return Result.error("仓库不存在或不是公开仓库");
            }
            if (info.statusCode() != 200) {
                return Result.error("GitHub 返回状态码 " + info.statusCode());
            }
            // 取默认分支（main 或 master）
            JsonNode infoJson = new ObjectMapper().readTree(info.body());
            String branch = infoJson.path("default_branch").asText("main");

            // 2. 拿整个文件树（一次返回所有文件路径）
            HttpResponse<String> tree = httpClient.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create("https://api.github.com/repos/" + owner + "/" + repo
                                    + "/git/trees/" + branch + "?recursive=1"))
                            .header("Accept", "application/vnd.github+json")
                            .GET().build(),
                    HttpResponse.BodyHandlers.ofString());

            Map<String, Object> result = new HashMap<>();
            result.put("branch", branch);
            result.put("repoInfo", info.body());
            result.put("tree", tree.body());
            return Result.ok(result);
        } catch (Exception e) {
            return Result.error("读取失败：" + e.getMessage());
        }
    }

    /**
     * 读取仓库里某个文件的内容（按路径，base64 返回）
     */
    @PostMapping("/file")
    public Result<Map<String, Object>> file(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        String path = body.get("path");
        if (url == null || url.isBlank() || path == null || path.isBlank()) {
            return Result.error("缺少参数");
        }
        String clean = url.replace("https://github.com/", "").replace("http://github.com/", "").replaceAll("/$", "");
        String[] parts = clean.split("/");
        if (parts.length < 2) {
            return Result.error("地址格式应为 https://github.com/用户名/仓库名");
        }
        String owner = parts[0];
        String repo = parts[1];
        try {
            HttpResponse<String> resp = httpClient.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create("https://api.github.com/repos/" + owner + "/" + repo
                                    + "/contents/" + path))
                            .header("Accept", "application/vnd.github+json")
                            .GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                return Result.error("读取文件失败：GitHub 返回 " + resp.statusCode());
            }
            JsonNode json = new ObjectMapper().readTree(resp.body());
            Map<String, Object> result = new HashMap<>();
            result.put("name", json.path("name").asText());
            result.put("content", json.path("content").asText()); // base64 内容
            result.put("size", json.path("size").asLong());
            return Result.ok(result);
        } catch (Exception e) {
            return Result.error("读取失败：" + e.getMessage());
        }
    }
}
