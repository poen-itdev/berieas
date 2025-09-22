package com.poen.berieas.back.domain.approval.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poen.berieas.back.domain.approval.entity.ApprovalDetail;

public interface ApprovalDetailRepository extends JpaRepository<ApprovalDetail, Integer>{
    
    Optional<ApprovalDetail> findByApprovalNo(int approvalNo);
}
