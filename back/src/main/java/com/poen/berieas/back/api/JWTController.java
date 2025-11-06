package com.poen.berieas.back.api;

import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.jwt.dto.JWTResponseDto;
import com.poen.berieas.back.domain.jwt.dto.RefreshRequestDto;
import com.poen.berieas.back.domain.jwt.service.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class JWTController {
    
    private final JwtService jwtService;

    // Refresh 토큰으로 Access 토큰 재발급 (Rotate 포함)
    @PostMapping(value = "/jwt/refresh", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JWTResponseDto jwtRefreshApi(
            @Validated @RequestBody RefreshRequestDto dto
    ) {
        return jwtService.refreshRotate(dto);
    }

}
