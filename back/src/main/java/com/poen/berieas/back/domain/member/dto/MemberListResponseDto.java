package com.poen.berieas.back.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberListResponseDto {

    private String memberName;
    private String memberDepartment;
    private String memberPosition;
    private String memberId;
    private String memberEmail;
    private String useYn;
}
