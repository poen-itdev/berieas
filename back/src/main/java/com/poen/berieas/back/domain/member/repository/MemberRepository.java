package com.poen.berieas.back.domain.member.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poen.berieas.back.domain.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String>{
 
    Boolean existsByMemberId(String memberId);

    Optional<Member> findByMemberId(String memberId);

    // 회원 삭제
    void deleteByMemberId(String memberId);

    // 비밀번호 재설정 //
    Boolean existsByMemberEmail(String memberEmail);

    Optional<Member> findByMemberEmail(String memberEmail);
}
