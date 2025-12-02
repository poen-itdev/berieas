package com.poen.berieas.back.config;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import com.poen.berieas.back.domain.basic.entity.Basic;
import com.poen.berieas.back.domain.basic.repository.BasicRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class MvcConfig implements WebMvcConfigurer {

    private final BasicRepository basicRepository;

    
    @Override
    public void addCorsMappings(CorsRegistry corsRegistry) {

        String domain = basicRepository.findByTypeAndName("domain", "도메인")
            .map(Basic::getCode)
            .orElse("localhost"); // 기본값: localhost

        corsRegistry.addMapping("/**")
                .allowedOrigins("http://localhost", "http://127.0.0.1", "http://" + domain)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true)
                .allowedHeaders("*")
                .exposedHeaders("Set-Cookie", "Authorization");
    }

    // MessageSource 등록
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages/messages");
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }

    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver resolver = new SessionLocaleResolver();
        resolver.setDefaultLocale(Locale.KOREAN);
        return resolver;
    }

     @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        // 요청 파라미터로 언어 변경 허용 (?lang=en)
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");  // ?lang=ko, ?lang=en 등으로 설정 가능
        return interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }

}
