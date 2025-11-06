package com.poen.berieas.back.domain.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApprovalSettingListResponseDto {
    
    private int formNo;
    private String formType;
    private String formTitle;
}
