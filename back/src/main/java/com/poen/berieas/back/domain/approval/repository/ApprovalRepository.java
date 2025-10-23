package com.poen.berieas.back.domain.approval.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    List<Approval> findTop5ByApprovalIdOrderByRegDateDesc(@Param("approvalId") String approvalId);

    // 대시보드(내가 결재할 문서)
    @Query("select a from Approval a " +
            "where a.nextId = :memberId and a.approvalStatus = '진행중' " +
            "order by a.regDate desc")
    List<Approval> findPendingApprovals(@Param("memberId") String memberId);

    // 진행목록(전체)
@Query("""
select a from Approval a
where
      ( a.approvalId = :memberId )   
   or ( a.approvalStatus <> '기안중' and    
            a.nextId = :memberName
         or a.signId1 = :memberName
         or a.signId2 = :memberName 
         or a.signId3 = :memberName
         or a.signId4 = :memberName
         or a.signId5 = :memberName
         or a.referenceId like concat('%', :memberName, '%')
      )
order by a.regDate desc
""")
Page<Approval> findAllForOverallList(
    @Param("memberId") String memberId,
    @Param("memberName") String memberName,
    Pageable pageable
);

    // 진행목록(진행중)
    @Query("select a from Approval a where a.approvalId = :approvalId and a.approvalStatus = '진행중'")
    Page<Approval> findInprogressApprovals(@Param("approvalId") String approvalId, Pageable pageable);

    // 진행목록(기안중)
//     @Query("select a from Approval a where a.approvalId = :memberId and a.approvalStartDate is null")
//     Page<Approval> findTemporarySavedApprovals(@Param("memberId") String memberId, Pageable pageable);
    @Query("""
            select a from Approval a
            where a.approvalStatus = '기안중'
            and a.regId = :memberId
            order by a.regDate desc
            """)
    Page<Approval> findTemporarySavedApprovals(@Param("memberId") String memberId, Pageable pageable);

    // 진행목록(반려)
@Query("""
  select a from Approval a
  where a.approvalStatus = '반려'
    and (
      a.approvalId = :memberId
      or a.nextId   = :memberName
      or a.signId1  = :memberName
      or a.signId2  = :memberName
      or a.signId3  = :memberName
      or a.signId4  = :memberName
      or a.signId5  = :memberName
      or a.referenceId like concat('%', :memberName, '%')
    )
  order by a.regDate desc
""")
Page<Approval> findReturnedApprovals(
  @Param("memberId") String memberId,
  @Param("memberName") String memberName,
  Pageable pageable
);

    // 진행목록(완료)
    @Query("select a from Approval a where a.approvalId = :memberId and a.approvalStatus = '완료'")
    Page<Approval> findCompletedApprovals(@Param("memberId") String memberId, @Param("memberName") String memberName, Pageable pageable);

    Optional<Approval> findByApprovalNo(int approvalNo);

    Optional<Approval> findByApprovalIdAndApprovalStatus(String approvalId, String approvalStatus);
    
}
