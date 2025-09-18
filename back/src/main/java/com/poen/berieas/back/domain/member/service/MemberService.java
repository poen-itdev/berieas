package com.poen.berieas.back.domain.member.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.email.entity.PasswordResetRequest;
import com.poen.berieas.back.domain.email.repository.PasswordResetRequestRepository;
import com.poen.berieas.back.domain.email.service.EmailService;
import com.poen.berieas.back.domain.jwt.service.JwtService;
import com.poen.berieas.back.domain.member.dto.MemberListResponseDto;
import com.poen.berieas.back.domain.member.dto.MemberRequestDto;
import com.poen.berieas.back.domain.member.dto.MemberResponseDto;
import com.poen.berieas.back.domain.member.dto.PasswordResetRequestDto;
import com.poen.berieas.back.domain.member.dto.VerifyCodeRequestDto;
import com.poen.berieas.back.domain.member.entity.Member;
import com.poen.berieas.back.domain.member.entity.RoleType;
import com.poen.berieas.back.domain.member.repository.MemberRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService implements UserDetailsService{
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final EmailService emailService;

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

        System.out.println("회원 비밀번호=============" + dto.getMemberPw());

        Member member = Member.builder()
            .memberId(dto.getMemberId())
            .memberPw(passwordEncoder.encode(dto.getMemberPw()))
            .memberName(dto.getMemberName())
            .memberEmail(dto.getMemberEmail())
            .memberDepartment(dto.getMemberDepartment())
            .memberPosition(dto.getMemberPosition())
            .useYn("Y")
            .regId("admin")
            .regDate(LocalDateTime.now())
            .updateId("admin")
            .updateDate(LocalDateTime.now())
            .role(RoleType.USER)
            .isFirstLogin("Y")
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

        System.out.println("===== loadUserByUsername 호출 =====");
        System.out.println("memberId: " + member.getMemberId());
        System.out.println("memberPw (DB): " + member.getMemberPw());
        System.out.println("role: " + member.getRole());
        System.out.println("isFirstLogin: " + member.getIsFirstLogin());

        boolean matches = passwordEncoder.matches("1234", member.getMemberPw());
        System.out.println("비번 매칭 결과: " + matches);

        // 조회한 entity를 기반으로 UserDetails를 만들어서 반환
        UserDetails userDetails = User.builder()
        .username(member.getMemberId())
        .password(member.getMemberPw())
        .authorities(member.getRole().name())
        .build();

        System.out.println("UserDetails password: " + userDetails.getPassword());

        return userDetails;
    }

    //== 회원 탈퇴 ==// 
    @Transactional
    public void deleteMember(MemberRequestDto dto) throws AccessDeniedException {

        // 관리자만 삭제 가능 검증
        SecurityContext context = SecurityContextHolder.getContext();
        String sessionRole = context.getAuthentication().getAuthorities().iterator().next().getAuthority();

        boolean isAdmin = sessionRole.equals(RoleType.ADMIN.name());
        // boolean isAdmin = sessionRole.equals("ROLE" + RoleType.ADMIN.name());

        if(!isAdmin) {
            throw new AccessDeniedException("관리자만 삭제할 수 있습니다.");
        }

        // 멤버 제거 
        memberRepository.deleteByMemberId(dto.getMemberId());

        // Refresh 토큰 제거
        jwtService.removeRefreshMember(dto.getMemberId());
    }

    //== 멤버 본인 정보 조회 ==//
    public MemberResponseDto readMember() {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new UsernameNotFoundException("해당 멤버를 찾을 수 없습니다." + memberId));

        return new MemberResponseDto(memberId, member.getMemberName(), member.getMemberEmail());
    }

    // 최초 로그인 시 비밀번호 변경
    @Transactional
    public void changePasswordAtFirstLogin(String memberId, MemberRequestDto dto) {

        Member member = memberRepository.findByMemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if ("N".equals(member.getIsFirstLogin())) {
            throw new IllegalStateException("이미 비밀번호를 변경한 사용자입니다.");
        }

        // 비밀번호 업데이트
        String encoded = passwordEncoder.encode(dto.getMemberPw());
        System.out.println("newPassword: " + dto.getMemberPw());
        System.out.println("encodedPassword: " + encoded);
        member.setMemberPw(encoded);

        boolean matches = passwordEncoder.matches(dto.getMemberPw(), encoded);
        System.out.println("바로 매칭 결과: " + matches);
        member.setIsFirstLogin("N"); // 첫 로그인 완료 처리
        memberRepository.save(member);
    }

    // 인증 코드 생성 후 이메일 전송
    @Transactional
    public void sendEmail(PasswordResetRequestDto dto) {

        // 이메일 존재 확인
        if(!memberRepository.existsByMemberEmail(dto.getEmail())) {
            
            throw new IllegalArgumentException("해당 이메일을 찾을 수 없습니다. 다시 입력해주세요.");
        }

        // 6자리 인증 코드 생성
        String code = String.format("%06d", new Random().nextInt(900000) + 100000);
        
        // 인증코드와 유효시간 저장
        PasswordResetRequest request = new PasswordResetRequest();
        request.setEmail(dto.getEmail());
        request.setCode(code);
        request.setExpireTime(LocalDateTime.now().plusMinutes(3)); // 3분 유효

        passwordResetRequestRepository.save(request);

        // 이메일 전송
        String subject = "비밀번호 재설정 인증 코드";
        String body = "인증 코드: " + code + "\n유효기간: 3분";
        emailService.sendEmail(dto.getEmail(), subject, body);
    }

    // 이메일 인증 코드 검증
    @Transactional
    public boolean verifyCode(VerifyCodeRequestDto dto) {

        PasswordResetRequest request = passwordResetRequestRepository.findTopByEmailAndCodeAndUsedOrderByCreatedAtDesc(dto.getEmail(), dto.getCode(), false)
            .orElseThrow(() -> new IllegalArgumentException("인증 코드가 없습니다."));

        // 유효기간 확인
        if (request.getExpireTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 코드가 만료되었습니다.");
        }

        // 성공하면 사용 처리
        request.setUsed(true);
        passwordResetRequestRepository.save(request);
        return true;
    }

    // 비밀번호 재설정
    @Transactional
    public void resetPassword(MemberRequestDto dto) {

        // 인증된 기록 확인
        PasswordResetRequest request = passwordResetRequestRepository
            .findTopByEmailAndUsedOrderByCreatedAtDesc(dto.getMemberEmail(), true)
            .orElseThrow(() -> new IllegalArgumentException("이메일 인증이 완료되지 않았습니다."));

        Member member = memberRepository.findByMemberEmail(dto.getMemberEmail())
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        // 새 비밀번호 해싱 후 저장
        member.setMemberPw(passwordEncoder.encode(dto.getMemberPw()));
        memberRepository.save(member);
    }

    // 전체 멤버 리스트
    public List<MemberListResponseDto> getAllMembers() {

        List<Member> members = memberRepository.findAll();

        return members.stream()
                .map(member -> new MemberListResponseDto(
                    member.getMemberName(),
                    member.getMemberDepartment(),
                    member.getMemberPosition(),
                    member.getMemberId(),
                    member.getMemberEmail(),
                    member.getUseYn()
                )).collect(Collectors.toList());
    }

    // 재직자 리스트
    public List<MemberListResponseDto> getActiveMembers() {

        List<Member> activeMembers = memberRepository.findActiveMembers();

        return activeMembers.stream()
                .map(activeMember -> new MemberListResponseDto(
                    activeMember.getMemberName(),
                    activeMember.getMemberDepartment(),
                    activeMember.getMemberPosition(),
                    activeMember.getMemberId(),
                    activeMember.getMemberEmail(),
                    activeMember.getUseYn()
                )).collect(Collectors.toList());
    }

    // 퇴사자 리스트
    public List<MemberListResponseDto> getRetiredMembers() {

        List<Member> retiredMembers = memberRepository.findRetiredMembers();

        return retiredMembers.stream()
                .map(retiredMember -> new MemberListResponseDto(
                    retiredMember.getMemberName(),
                    retiredMember.getMemberDepartment(),
                    retiredMember.getMemberPosition(),
                    retiredMember.getMemberId(),
                    retiredMember.getMemberEmail(),
                    retiredMember.getUseYn()
                )).collect(Collectors.toList());
    }

    // 멤버 수정
    @Transactional
    public String updateMember(String memberId, MemberRequestDto dto) throws AccessDeniedException{

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException("관리자만 수정할 수 있습니다.");
        }

        Member member = memberRepository.findByMemberId(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 존재하지 않습니다. id=" + memberId));

        member.updateMember(dto);
        memberRepository.save(member);

        return member.getMemberId();
    }

    // 멤버 비활성화
    @Transactional
    public void deactivateMember(String memberId) throws AccessDeniedException{

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException("관리자만 수정할 수 있습니다.");
        }

        Member member = memberRepository.findByMemberId(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 존재하지 않습니다. id=" + memberId));

        if ("N".equals(member.getUseYn())) {
            member.setUseYn("Y");
        } else {
            member.setUseYn("N");
        }

        memberRepository.save(member);
    }
}