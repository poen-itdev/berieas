package com.poen.berieas.back.domain.approval.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.poen.berieas.back.domain.approval.entity.Approval;

public interface ApprovalRepository extends JpaRepository<Approval, Integer>{
    
    // 대시보드(진행중)
    @Query("select count(a) from Approval a where a.approvalStatus = '진행중'")
    int inProressCount();

    // 대시보드(완료)
    @Query("select count(a) from Approval a where a.approvalStatus = '완료'")
    int completedCount();
}
