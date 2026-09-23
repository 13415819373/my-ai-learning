package com.aitrain.platform.controller;

import com.aitrain.platform.common.Result;
import com.aitrain.platform.common.UserContext;
import com.aitrain.platform.dto.LoginRequest;
import com.aitrain.platform.entity.User;
import com.aitrain.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return Result.ok(userService.login(request.getUsername(), request.getPassword()));
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody LoginRequest request) {
        return Result.ok(userService.register(request.getUsername(), request.getPassword(), request.getUsername()));
    }

    @GetMapping("/me")
    public Result<User> me() {
        User user = userService.getById(UserContext.getUserId());
        if (user != null) {
            user.setPassword(null);
        }
        return Result.ok(user);
    }
}
