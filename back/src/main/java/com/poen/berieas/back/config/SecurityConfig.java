package com.poen.berieas.back.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.poen.berieas.back.filter.LoginFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final AuthenticationSuccessHandler loginSuccessHandler;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, @Qualifier("LoginSuccessHandler")AuthenticationSuccessHandler loginSuccessHandler) {

        this.authenticationConfiguration = authenticationConfiguration;
        this.loginSuccessHandler = loginSuccessHandler;
    }

    // 커스텀 자체 로그인 필터를 위한 AuthenticationManager Bean 등록
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }
    
    // 비밀번호 단방향 암호화용
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // Security FilterChain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // csrf 보안 필터 disable
        http
                .csrf(AbstractHttpConfigurer::disable);

        //=================================== CORS 설정 ===================================//

        // 기본 Form 기반 인증 필터 disable
        http
                .formLogin(AbstractHttpConfigurer::disable);

        // 기본 Basic 인증 필터 disable
        http
                .httpBasic(AbstractHttpConfigurer::disable);

        //=================================== 인가 ===================================//
        http
                .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll());

        //=================================== 에외처리 ===================================//
        http
                // 로그인 하지 않은 상태에서 접근한 경우
                .exceptionHandling(e -> e
                    .authenticationEntryPoint((request, response, authException) -> {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED); // 401응답
                    })
                // 로그인을 했지만 권한 없을 경우 
                    .accessDeniedHandler((request, response, authException) -> {
                        response.sendError(HttpServletResponse.SC_FORBIDDEN); // 403에러
                    })
                );

        //=================================== 커스텀 필터 추가 ===================================//
        http
                .addFilterBefore(new LoginFilter(authenticationManager(authenticationConfiguration), loginSuccessHandler), UsernamePasswordAuthenticationFilter.class);

        //=================================== 세션 필터 설정 ===================================//
        http
                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        return http.build();
    }
}
