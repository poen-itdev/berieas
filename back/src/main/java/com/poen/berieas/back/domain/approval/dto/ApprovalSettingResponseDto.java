package com.poen.berieas.back.domain.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApprovalSettingResponseDto {
    
    private String formNo;
    private String formType;
    private String formTitle;
}
