package com.poen.berieas.back.domain.approval.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.poen.berieas.back.domain.approval.entity.Approval;

public interface ApprovalRepository extends JpaRepository<Approval, Integer>{

    // 대시보드(전체)
    @Query("select count(a) from Approval a where a.approvalId = :approvalId")
    int totalCount(@Param("approvalId") String approvalId);
    
    // 대시보드(진행중)
    @Query("select count(a) from Approval a where a.approvalId = :approvalId and a.approvalStatus = '진행중'")
    int inProressCount(@Param("approvalId") String approvalId);

    // 대시보드(완료)
    @Query("select count(a) from Approval a where a.approvalId = :approvalId and a.approvalStatus = '완료'")
    int completedCount(@Param("approvalId") String approvalId);

    // 대시보드(내가 상신한 문서)
    List<Approval> findByApprovalId(String approvalId);

    // 대시보드(내가 결재할 문서)
    @Query("select a from Approval a " +
            "where (a.signId1 = :memberId and a.signDate1 is null) or " +
            "(a.signId2 = :memberId and a.signDate1 is not null and a.signDate2 is null) or " +
            "(a.signId3 = :memberId and a.signDate2 is not null and a.signDate3 is null) or " +
            "(a.signId4 = :memberId and a.signDate3 is not null and a.signDate4 is null) or " +
            "(a.signId5 = :memberId and a.signDate4 is not null and a.signDate5 is null)")
    List<Approval> findPendingApprovalsForUser(@Param("memberId") String memberId);

    // 진행목록(전체)
    @Query("select a from Approval a " +
            "where a.approvalId = :memberId " +
            "or a.referenceId = :memberId " +
            "or (a.signId1 = :memberId and a.signDate1 is null) " +
            "or (a.signId2 = :memberId and a.signDate1 is not null and a.signDate2 is null) " +
            "or (a.signId3 = :memberId and a.signDate2 is not null and a.signDate3 is null) " +
            "or (a.signId4 = :memberId and a.signDate3 is not null and a.signDate4 is null) " +
            "or (a.signId5 = :memberId and a.signDate4 is not null and a.signDate5 is null) " +
            "order by a.regDate desc")
    List<Approval> findAllRelatedApprovals(@Param("memberId") String memberId);

    // 진행목록(기안중)

    // 진행목록(반려)
    @Query("select a from Approval a where a.approvalId = :approvalId and a.approvalStatus = '반려'")
    List<Approval> findReturendApprovals(@Param("approvalId") String approvalId);

    // 진행목록(완료)
    @Query("select a from Approval a where a.approvalId = :approvalId and a.approvalStatus = '완료'")
    List<Approval> findCompletedApprovals(@Param("approvalId") String approvalId);


}
