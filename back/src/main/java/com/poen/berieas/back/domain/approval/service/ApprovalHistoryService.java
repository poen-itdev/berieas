package com.poen.berieas.back.domain.approval.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.approval.dto.ApprovalHistoryResponseDto;
import com.poen.berieas.back.domain.approval.entity.ApprovalHistory;
import com.poen.berieas.back.domain.approval.repository.ApprovalHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalHistoryService {
    
    private final ApprovalHistoryRepository approvalHistoryRepository;

    // 이력 리스트
    public List<ApprovalHistoryResponseDto> getHistorys() {

        List<ApprovalHistory> approvalHistorys = approvalHistoryRepository.findAll();

        return approvalHistorys.stream()
            .map(approvalHistory -> new ApprovalHistoryResponseDto(
                approvalHistory.getApprovalNo()
            )).collect(Collectors.toList());
    }
}
