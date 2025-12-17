package com.poen.berieas.back.domain.approval.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FormRequestDto {
    
    private String formType;
    private String formTitle;
    private String formDocument;
    
    // 양식에 미리 정의된 결재자 (선택사항)
    private String signId1;
    private String signId2;
    private String signId3;
    private String signId4;
    private String signId5;
    
    // 기안서 작성 시 결재자 수정 허용 여부 (기본값: false)
    private Boolean signModifyYn;
}
