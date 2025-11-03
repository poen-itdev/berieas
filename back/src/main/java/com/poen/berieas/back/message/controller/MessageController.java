package com.poen.berieas.back.message.controller;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class MessageController {
    
    private final MessageSource messageSource;

    @GetMapping("/greet")
    public String greet(Locale locale) {

        return messageSource.getMessage("greeting", null, locale);
    }

    
}
