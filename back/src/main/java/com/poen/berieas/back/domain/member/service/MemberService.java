package com.poen.berieas.back.domain.member.service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.jwt.service.JwtService;
import com.poen.berieas.back.domain.member.dto.MemberRequestDto;
import com.poen.berieas.back.domain.member.entity.Member;
import com.poen.berieas.back.domain.member.entity.RoleType;
import com.poen.berieas.back.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService implements UserDetailsService{
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    //== 존재 여부 ==//
    public Boolean existMember(MemberRequestDto dto) {

        return memberRepository.existsByMemberId(dto.getMemberId());
    }

    //== 회원가입 ==//
    @Transactional
    public String addMember(MemberRequestDto dto) {

        // 존재 여부 확인
        if(memberRepository.existsByMemberId(dto.getMemberId())) {

            throw new IllegalArgumentException("이미 존재하는 멤버입니다.");
        }

        Member member = Member.builder()
            .memberId(dto.getMemberId())
            .memberPw(passwordEncoder.encode(dto.getMemberPw()))
            .memberName(dto.getMemberName())
            .memberEmail(dto.getMemberEmail())
            .useYn("Y")
            .regId("admin")
            .regDate(LocalDateTime.now())
            .updateId("admin")
            .updateDate(LocalDateTime.now())
            .role(RoleType.USER)
            .build();

        // db에 저장하고 id값 반환 
        return memberRepository.save(member).getMemberId();
    }

    //== 로그인 ==//
    @Override
    public UserDetails loadUserByUsername(String memberId) throws UsernameNotFoundException {

        // 테이블이 Member이고, MemberId 와 MemberPw로 로그인하기 때문에 memberId로 파라미터를 받음. 
        Member member = memberRepository.findByMemberId(memberId)
                .orElseThrow(() -> new UsernameNotFoundException(memberId));

        System.out.println(passwordEncoder.matches("로그인시입력한패스워드", member.getMemberPw()));
        System.out.println(member.getMemberId());

        // 조회한 entity를 기반으로 UserDetails를 만들어서 반환
        return User.builder()
            .username(member.getMemberId())
            .password(member.getMemberPw())
            .authorities(member.getRole().name())
            .build();


    }

    //== 로그인 회원 정보 수정 ==//
    @Transactional
    public String updateMember(MemberRequestDto dto) throws AccessDeniedException {

        String sessionMemberName = SecurityContextHolder.getContext().getAuthentication().getName();
        if(!sessionMemberName.equals(dto.getMemberId())) {

            throw new AccessDeniedException("본인 계정만 수정 가능");
        }

        Member member = memberRepository.findByMemberId(dto.getMemberId())
                .orElseThrow(() -> new UsernameNotFoundException(dto.getMemberId()));

        member.updateMember(dto);

        return memberRepository.save(member).getMemberId();
    }

    //== 회원 탈퇴 ==//  
}
