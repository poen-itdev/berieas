package com.poen.berieas.back.domain.approval.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ApprovalSettingResponseDto {
    
    private int formNo;
    private String formType;
    private String formTitle;
    private String formDocument;
    
    // 결재라인 정보 (memberId, memberName 포함)
    private List<ApproverInfo> approvers;
    
    @Getter
    @AllArgsConstructor
    public static class ApproverInfo {
        private String memberId;
        private String memberName;
        private String memberDepartment;
        private String memberPosition;
    }
}
