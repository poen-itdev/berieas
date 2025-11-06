package com.poen.berieas.back.filter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.poen.berieas.back.util.JWTUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JWTFilter extends OncePerRequestFilter{
    
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // 헤더에서 access키에 담긴 토큰을 꺼냄 
        String authorization = request.getHeader("Authorization");

        // 토큰이 없다면 다음 필터로 넘김
        if (authorization == null) {

            filterChain.doFilter(request, response);
            return;
        }

        // Bearer가 없을 경우 
        if (!authorization.startsWith("Bearer ")) {

            throw new ServletException("Invalid JWT token");
        }

        // 토큰 파싱
        String accessToken = authorization.split(" ")[1];

        if (JWTUtil.isValid(accessToken, true)) {

            String memberId = JWTUtil.getMemberId(accessToken);
            String role = JWTUtil.getRole(accessToken);

            List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));

            Authentication auth = new UsernamePasswordAuthenticationToken(memberId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

            log.info("JWT Valid. MemberId: {}", memberId);
            log.info("JWT Valid. role: {}", role);

            filterChain.doFilter(request, response);

        } else {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"토큰 만료 또는 유효하지 않은 토큰\"}");
            return;
        }

        // log.info("Authorization Header: {}", authorization);
        // log.info("AccessToken: {}", accessToken);
        // log.info("JWT Valid: {}", JWTUtil.isValid(accessToken, true));

    }
}
