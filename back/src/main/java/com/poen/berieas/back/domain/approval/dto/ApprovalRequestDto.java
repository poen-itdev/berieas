package com.poen.berieas.back.domain.approval.dto;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class ApprovalRequestDto {
    
    private int formNo;
    private String formTitle;
    private String approvalTitle;
    private String signId1;
    private String signId2;
    private String signId3;
    private String signId4;
    private String signId5;
    private String referenceId;
    
    private String approvalDocument;
}
