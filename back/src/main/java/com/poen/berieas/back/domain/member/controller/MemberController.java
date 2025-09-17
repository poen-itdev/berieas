package com.poen.berieas.back.domain.member.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.member.dto.MemberListResponseDto;
import com.poen.berieas.back.domain.member.dto.MemberRequestDto;
import com.poen.berieas.back.domain.member.dto.MemberResponseDto;
import com.poen.berieas.back.domain.member.dto.PasswordResetRequestDto;
import com.poen.berieas.back.domain.member.dto.VerifyCodeRequestDto;
import com.poen.berieas.back.domain.member.service.MemberService;

import jakarta.validation.Valid;
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

    // 멤버 정보
    @GetMapping("/member/info")
    public MemberResponseDto memberMeApi() {

        return memberService.readMember();
    }
    
    // 멤버 제거
    @DeleteMapping(value = "/member/delete", consumes = MediaType.APPLICATION_JSON_VALUE) 
    public ResponseEntity<Boolean> deleteMemberApi(
        @Validated(MemberRequestDto.deleteGroup.class) @RequestBody MemberRequestDto dto) throws AccessDeniedException {

            memberService.deleteMember(dto);
            return ResponseEntity.status(200).body(true);
    }
    
    // 비밀번호 변경
    @PostMapping(value = "/member/changepassword", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> changePasswordAtFirstLoginApi(
            @Validated(MemberRequestDto.passwordGroup.class) @RequestBody MemberRequestDto dto,
            Authentication authentication) {

        
        String memberId = authentication.getName();

        memberService.changePasswordAtFirstLogin(memberId, dto);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
    }

    // 인증코드 전송
    @PostMapping(value = "/member/send-code", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> sendCodeApi(@Valid @RequestBody PasswordResetRequestDto dto) {

        memberService.sendEmail(dto);
        return ResponseEntity.ok("인증 코드 전송 완료");
    }

    // 인증 코드 검증
    @PostMapping(value = "/member/verify-code", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> verifyCodeApi(@RequestBody VerifyCodeRequestDto dto) {

        boolean ok = memberService.verifyCode(dto);
        if(ok) return ResponseEntity.ok("인증 성공");
        
        return ResponseEntity.status(400).body("인증 코드 불일치");
    }

    // 새 비밀번호 재설정
    @PostMapping(value = "/member/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> resetPasswordApi(
            @Validated(MemberRequestDto.passwordGroup.class) @RequestBody MemberRequestDto dto,
            Authentication authentication) {

        String memberId = authentication.getName();

        memberService.resetPassword(memberId, dto);
        return ResponseEntity.ok("비밀번호 재설정 완료");
    }

    // 전체 회원 리스트
    @GetMapping(value = "/member/members", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<MemberListResponseDto>> getAllMembersApi() {

        List<MemberListResponseDto> members = memberService.getAllMembers();
        return ResponseEntity.ok(members);
    }

    // 재직자 리스트
    @GetMapping(value = "/member/active-members", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<MemberListResponseDto>> getActiveMembersApi() {

        List<MemberListResponseDto> activeMembers = memberService.getActiveMembers();
        return ResponseEntity.ok(activeMembers);
    }

    // 퇴사자 리스트
    @GetMapping(value = "/member/retired-members", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<MemberListResponseDto>> getRetiredMembersApi() {

        List<MemberListResponseDto> retiredMembers = memberService.getRetiredMembers();
        return ResponseEntity.ok(retiredMembers);
    }

    // 멤버 수정
    @PutMapping(value = "/member/update/{memberId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateMemberApi(
        @PathVariable String memberId,
        @Validated @RequestBody MemberRequestDto dto
    ) {

        String updatedId = memberService.updateMember(memberId, dto);
        return ResponseEntity.ok(updatedId);
    }

    // 멤버 비활성화
    @PostMapping(value = "/member/deactivate/{memberId}")
    public ResponseEntity<String> deactivateMemberApi(@PathVariable String memberId) {

        memberService.deactivateMember(memberId);
        return ResponseEntity.ok("변경되었습니다.");
    }
}
