package com.poen.berieas.back.handler;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.poen.berieas.back.domain.jwt.service.JwtService;
import com.poen.berieas.back.domain.member.entity.Member;
import com.poen.berieas.back.domain.member.repository.MemberRepository;
import com.poen.berieas.back.util.JWTUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@Qualifier("LoginSuccessHandler")
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler{
    
    private final JwtService jwtService;
    private final MemberRepository memberRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        // authentication은 로그인 성공 시 만들어진 객체임 

        // memberId, role
        String memberId = authentication.getName();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        // Jwt(Access/Refresh) 발급
        String accessToken = JWTUtil.createJwt(memberId, role, true);
        String refreshToken = JWTUtil.createJwt(memberId, role, false);

        // 발급한 Refresh DB 테이블 저장
        jwtService.addRefresh(memberId, refreshToken);

        // isFirstLogin 값 조회
        Member member = memberRepository.findByMemberId(memberId)
                .orElseThrow(() -> new UsernameNotFoundException(memberId));
        String isFirstLogin = member.getIsFirstLogin();

        // 응답
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String json = String.format("{\"accessToken\":\"%s\", \"refreshToken\":\"%s\", \"isFirstLogin\":\"%s\"}", accessToken, refreshToken, isFirstLogin);
        response.getWriter().write(json);
        response.getWriter().flush();
    }
}
