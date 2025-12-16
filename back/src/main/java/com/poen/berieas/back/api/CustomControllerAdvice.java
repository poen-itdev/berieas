package com.poen.berieas.back.api;

import java.nio.file.AccessDeniedException;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.poen.berieas.back.util.MessageUtil;

import org.springframework.beans.factory.annotation.Autowired;

@RestControllerAdvice
public class CustomControllerAdvice extends ResponseEntityExceptionHandler {
    
    @Autowired
    private MessageUtil messageUtil;

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        
        String responseMessage = messageUtil.getMessage("error.validation.failed") + " - " + errorMessage;
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(responseMessage);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(messageUtil.getMessage("error.access.denied"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        // IllegalArgumentException의 원래 메시지를 반환 (이미 다국어 처리됨)
        String message = ex.getMessage();
        if (message == null || message.isEmpty()) {
            message = messageUtil.getMessage("error.invalid.request");
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(message);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        // RuntimeException 메시지가 있으면 그대로 사용 (이미 다국어 처리됨)
        String message = ex.getMessage();
        if (message == null || message.isEmpty()) {
            message = messageUtil.getMessage("error.invalid.request");
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(message);
    }
}
