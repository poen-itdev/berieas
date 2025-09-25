package com.poen.berieas.back.domain.approval.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProgressListResponseDto {
    
    private int approvalNo;
    private LocalDateTime regDate;
    private String approvalTitle;
    private String approvalType;
    private String approvalPostion;
    private String approvalId;
    private String approvalSigner;
    private String approvalStatus;
}
