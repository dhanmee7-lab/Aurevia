package com.examly.springapp.service;

import com.examly.springapp.dto.AuthResponse;
import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.dto.UserResponse;

import java.util.List;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String token);

    UserResponse verifyToken(String token);

    List<UserResponse> getAllUsers();

    UserResponse updateUserStatus(Long id, String status);

    UserResponse createUserByAdmin(RegisterRequest request);

    void deleteUser(Long id);

    void seedDefaultUsersIfEmpty();
}
