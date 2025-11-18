package com.poen.berieas.back.domain.approval.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FormRequestDto {
    
    private String formType;
    private String formTitle;
    private String formDocument;
}
