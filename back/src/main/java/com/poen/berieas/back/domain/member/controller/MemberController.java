package com.poen.berieas.back.domain.member.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.member.dto.MemberRequestDto;
import com.poen.berieas.back.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 멤버 존재 확인
    @PostMapping(value = "/member/exist", consumes = MediaType.APPLICATION_JSON_VALUE) // consumes = MediaType.APPLICATION_JSON_VALUE를 지정하는 이유: Json body만 받으려고. 
    public ResponseEntity<Boolean> existMemberApi(@Validated(MemberRequestDto.existGroup.class) @RequestBody MemberRequestDto dto) {

        return ResponseEntity.ok(memberService.existMember(dto));
    }

    // 회원가입
    @PostMapping(value = "/member/join", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> joinApi(@Validated(MemberRequestDto.addGroup.class) @RequestBody MemberRequestDto dto) {

        // 서비스 호출하여 회원가입 처리
        String memberId = memberService.addMember(dto);

        // 응답 바디를 Json형태로 만들기
        Map<String, String> responseBody = Collections.singletonMap("memberId", memberId);

        return ResponseEntity.status(201).body(responseBody);
    }

    // 로그인 
    
}
