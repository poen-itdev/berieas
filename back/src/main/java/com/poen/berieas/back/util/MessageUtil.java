package com.poen.berieas.back.util;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class MessageUtil {
    
    private final MessageSource messageSource;
    
    public MessageUtil(MessageSource messageSource) {
        this.messageSource = messageSource;
    }
    
    public String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }
    
    public String getMessage(String code, Object... args) {
        return messageSource.getMessage(code, args, LocaleContextHolder.getLocale());
    }
    
    public String getMessage(String code, Locale locale) {
        return messageSource.getMessage(code, null, locale);
    }
    
    public String getMessage(String code, Locale locale, Object... args) {
        return messageSource.getMessage(code, args, locale);
    }
}