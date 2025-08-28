package com.poen.berieas.back.handler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.poen.berieas.back.domain.jwt.service.JwtService;
import com.poen.berieas.back.util.JWTUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class RefreshTokenLogoutHandler implements LogoutHandler{
    
    private final JwtService jwtService;

    public RefreshTokenLogoutHandler(JwtService jwtService) {
        
        this.jwtService = jwtService;
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {

        try {
            String body = new BufferedReader(new InputStreamReader(request.getInputStream()))
                    .lines().reduce("", String::concat);

            if (!StringUtils.hasText(body)) return;

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(body);
            String refreshToken = jsonNode.has("refreshToken") ? jsonNode.get("refreshToken").asText() : null;

            // 유효성 검증
            if (refreshToken == null) {
                return;
            }

            Boolean isValid = JWTUtil.isValid(refreshToken, false);
            if (!isValid) {
                return;
            }

            // Refresh 토큰 삭제
            jwtService.removeRefresh(refreshToken);

        } catch (IOException e) {

            throw new RuntimeException("Failed to read refresh token", e);
        }
    }
}
