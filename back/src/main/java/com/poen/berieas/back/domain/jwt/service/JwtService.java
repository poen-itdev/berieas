package com.poen.berieas.back.domain.jwt.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.jwt.dto.JWTResponseDto;
import com.poen.berieas.back.domain.jwt.dto.RefreshRequestDto;
import com.poen.berieas.back.domain.jwt.entity.RefreshToken;
import com.poen.berieas.back.domain.jwt.repository.RefreshRepository;
import com.poen.berieas.back.util.JWTUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JwtService {
    
    private final RefreshRepository refreshRepository;

    // Refresh 토큰으로 Access 토큰 재발급 로직(Rotate 포함)
    public JWTResponseDto refreshRotate(RefreshRequestDto dto) {

        String refreshToken = dto.getRefreshToken();

        // Refresh 토큰 검증 
        Boolean isValid = JWTUtil.isValid(refreshToken, false);
        if(!isValid) {

            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }

        // 정보 추출
        String memberId = JWTUtil.getMemberId(refreshToken);
        String role = JWTUtil.getRole(refreshToken);

        // 토큰 생성
        String newAccesstoken = JWTUtil.createJwt(memberId, role, true);
        String newRefreshToken = JWTUtil.createJwt(memberId, role, false);

        // 기존 Refresh 토큰 DB 삭제 후 신규 추가
        RefreshToken refreshToken2 = RefreshToken.builder()
            .memberId(memberId)
            .refresh(refreshToken)
            .build();

        removeRefresh(refreshToken);
        refreshRepository.save(refreshToken2);

        return new JWTResponseDto(newAccesstoken, newRefreshToken);
    }

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
