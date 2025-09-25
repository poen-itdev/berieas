package com.poen.berieas.back.domain.approval.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyApprovalResponseDto {

    private int approvalNo;
    private String approvalStatus;
    private String aprovalType;
    private String approvalTitle;
    private String signId; // 내가 상신한 문서 : 현재 결재자 | 내가 결제할 문서 : 기안자 
    private LocalDateTime regDate;
}
