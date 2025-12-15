package com.poen.berieas.back.domain.member.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.poen.berieas.back.domain.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String>{
 
    Boolean existsByMemberId(String memberId);

    Optional<Member> findByMemberId(String memberId);

    // 회원 삭제
    void deleteByMemberId(String memberId);

    // 비밀번호 재설정 //
    Boolean existsByMemberEmail(String memberEmail);

    Optional<Member> findByMemberEmail(String memberEmail);

    // 재직자 리스트
    @Query("select m from Member m where m.useYn = 'Y'")
    List<Member> findActiveMembers();

    // 퇴사자 리스트
    @Query("select m from Member m where m.useYn = 'N'")
    List<Member> findRetiredMembers();

    @Query("select m from Member m where m.memberName like concat('%', :keyword, '%') " +
       "or m.memberId like concat('%', :keyword, '%') " +
       "or m.memberEmail like concat('%', :keyword, '%')")
    List<Member> findAllByKeyword(@Param("keyword") String keyword);

    // 이름으로 멤버 조회
    Optional<Member> findByMemberName(String memberName);

}
