package com.aitrain.platform.service;

import com.aitrain.platform.entity.User;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.Map;

public interface UserService extends IService<User> {

    /**
     * 登录，返回 token 及用户信息
     */
    Map<String, Object> login(String username, String password);

    /**
     * 注册（默认学生角色）
     */
    User register(String username, String password, String nickname);

    /**
     * 根据 token 获取当前用户
     */
    User currentUser(String token);
}
