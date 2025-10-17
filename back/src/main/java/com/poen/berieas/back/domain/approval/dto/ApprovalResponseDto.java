package com.poen.berieas.back.domain.approval.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApprovalResponseDto {
    
    private int formNo;
    private String formTitle;
    private String approvalTitle;
    private LocalDateTime startDate;
    private String approvalName;
    private String approvalStatus;
    private String signId1;
    private String signId2;
    private String signId3;
    private String signId4;
    private String signId5;
    private LocalDateTime signDate1;
    private LocalDateTime signDate2;
    private LocalDateTime signDate3;
    private LocalDateTime signDate4;
    private LocalDateTime signDate5;
    private String referenceId;
    private String nextId;

    private String approvalAttachFile1;
    private String approvalAttachFile2;
    private String approvalAttachFile3;
    private String approvalAttachFile4;
    private String approvalAttachFile5;
    
    private String approvalDocument;
}
