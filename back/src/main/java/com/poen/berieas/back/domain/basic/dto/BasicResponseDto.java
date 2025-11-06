package com.poen.berieas.back.domain.basic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BasicResponseDto {
        
    private Integer idx;
    private String name;           // 한글명 (예: "개발팀")
    private String codeKey;        // 영어 키 (예: "development")
    private String codeValue;      // 영어 표시명 (예: "Development Team")
}
