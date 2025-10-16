package com.poen.berieas.back.domain.member.dto;

import com.poen.berieas.back.domain.member.entity.RoleType;

public record MemberResponseDto(String memberId, String memberName, String memberEmail, String memberDepartment, String memberPosition, RoleType role) {
    
}
