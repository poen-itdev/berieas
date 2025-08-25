package com.poen.berieas.back.domain.jwt.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.jwt.entity.RefreshToken;
import com.poen.berieas.back.domain.jwt.repository.RefreshRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JwtService {
    
    private final RefreshRepository refreshRepository;

    // Jwt Refresh 토큰 발급 후 저장 메소드
    @Transactional
    public void addRefresh(String memberId, String refreshToken) {

        RefreshToken token = RefreshToken.builder()
            .memberId(memberId)
            .refresh(refreshToken)
            .build();

        refreshRepository.save(token);
    }

    // Jwt Refresh 토큰 기반 존재 확인 메소드
    public Boolean existsByRefresh(String refreshToken) {

        return refreshRepository.existsByRefresh(refreshToken);
    }

    // JWT Refresh 토큰 기반 삭제 메소드
    @Transactional
    public void removeRefresh(String refreshToken) {

        refreshRepository.deleteByRefresh(refreshToken);
    }

    // JWT 발급 memberId 기반 삭제 메소드 (탈퇴시)
    public void removeRefreshMember(String memberId) {
        
        refreshRepository.deleteByMemberId(memberId);
    }
}
