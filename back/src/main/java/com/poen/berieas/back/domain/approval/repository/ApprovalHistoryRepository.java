package com.poen.berieas.back.domain.approval.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poen.berieas.back.domain.approval.entity.ApprovalHistory;

public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Integer> {
    
    Optional<ApprovalHistory> findByApprovalNo(int approvalNo);
}
