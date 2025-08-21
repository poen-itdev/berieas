package com.poen.berieas.back.domain.member.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberRequestDto {
    
    private String memberId;
    private String memberPw;
    private String memberName;
    private String memberEmail;
}
