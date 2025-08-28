package com.poen.berieas.back.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.http.HttpMethod;
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
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.poen.berieas.back.domain.jwt.service.JwtService;
import com.poen.berieas.back.domain.member.entity.RoleType;
import com.poen.berieas.back.filter.JWTFilter;
import com.poen.berieas.back.filter.LoginFilter;
import com.poen.berieas.back.handler.RefreshTokenLogoutHandler;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final AuthenticationSuccessHandler loginSuccessHandler;
    private final JwtService jwtService;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, @Qualifier("LoginSuccessHandler")AuthenticationSuccessHandler loginSuccessHandler,
        JwtService jwtService) {

        this.authenticationConfiguration = authenticationConfiguration;
        this.loginSuccessHandler = loginSuccessHandler;
        this.jwtService = jwtService;
    }

    // 커스텀 자체 로그인 필터를 위한 AuthenticationManager Bean 등록
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    // 권한 계층 
    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.withRolePrefix("ROLE_")
                .role(RoleType.ADMIN.name()).implies(RoleType.USER.name())
                .build();
    }
    
    // 비밀번호 단방향 암호화용
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // CORS Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Security FilterChain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // csrf 보안 필터 disable
        http
                .csrf(AbstractHttpConfigurer::disable);

        //=================================== CORS 설정 ===================================//

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http    
                .logout(logout -> logout
                    .addLogoutHandler(new RefreshTokenLogoutHandler(jwtService)));

        // 기본 Form 기반 인증 필터 disable
        http
                .formLogin(AbstractHttpConfigurer::disable);

        // 기본 Basic 인증 필터 disable
        http
                .httpBasic(AbstractHttpConfigurer::disable);

        //=================================== 인가 ===================================//
        http
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/jwt/refresh").permitAll()
                    // .requestMatchers("/member/exist", "/member").permitAll() // POST/GET/PUT/DELETE 전부 허용
                    // .requestMatchers("/member/info").hasRole(RoleType.USER.name()) // info는 USER 권한 필요
                    // .requestMatchers(HttpMethod.POST, "/member/exist", "/member").permitAll()
                    // .requestMatchers(HttpMethod.GET, "/member", "/member/info").hasRole(RoleType.USER.name())
                    // .requestMatchers(HttpMethod.PUT, "/member").hasRole(RoleType.USER.name())
                    // .requestMatchers(HttpMethod.DELETE, "/member").hasRole(RoleType.USER.name())
                    .anyRequest().permitAll()
                );

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
                .addFilterBefore(new JWTFilter(), LogoutFilter.class);
        
        http
                .addFilterBefore(new LoginFilter(authenticationManager(authenticationConfiguration), loginSuccessHandler), UsernamePasswordAuthenticationFilter.class);

        //=================================== 세션 필터 설정 ===================================//
        http
                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        return http.build();
    }
}
