package com.poen.berieas.back.domain.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FormRequestDto {
    
    private String formType;
    private String formTitle;
    private String formDocument;
}
