package com.poen.berieas.back.domain.approval.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.approval.repository.ApprovalRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {
    
    private final ApprovalRepository approvalRepository;

    // 대시보드(전체)
    public int totalApprovalCount() {

        int total = (int) approvalRepository.count();
        return total;
    }

    public int inProgressCount() {

        int inProgress = approvalRepository.inProressCount();
        return inProgress;
    }

    public int completedCount() {

        int completed = approvalRepository.completedCount();
        return completed;
    }
}
