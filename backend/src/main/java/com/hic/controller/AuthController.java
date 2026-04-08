package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.LoginRequest;
import com.hic.dto.LoginResponse;
import com.hic.dto.UserDTO;
import com.hic.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        UserDTO user = authService.getUserFromToken(token);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyToken(
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        boolean valid = authService.verifyToken(token);
        return ResponseEntity.ok(ApiResponse.success(valid));
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
}
