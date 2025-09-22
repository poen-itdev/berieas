package com.poen.berieas.back.domain.approval.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.approval.dto.MyApprovalResponseDto;
import com.poen.berieas.back.domain.approval.dto.ProgressListResponseDto;
import com.poen.berieas.back.domain.approval.entity.Approval;
import com.poen.berieas.back.domain.approval.entity.ApprovalDetail;
import com.poen.berieas.back.domain.approval.repository.ApprovalDetailRepository;
import com.poen.berieas.back.domain.approval.repository.ApprovalRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {
    
    private final ApprovalRepository approvalRepository;
    private final ApprovalDetailRepository approvalDetailRepository;
    
    // 대시보드(전체)
    public int totalApprovalCount() {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        int total = approvalRepository.totalCount(memberId);
        return total;
    }

    // 대시보드(진행중)
    public int inProgressCount() {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        int inProgress = approvalRepository.inProressCount(memberId);
        return inProgress;
    }

    // 대시보드(완료)
    public int completedCount() {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        int completed = approvalRepository.completedCount(memberId);
        return completed;
    }

    // 대시보드(내가 상신한 문서) + 진행목록(진행중)
    public List<MyApprovalResponseDto> getMySubmitted() {

        // 로그인한 유저의 memberId 
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("AUTH==========" + memberId);

        List<Approval> approvals = approvalRepository.findByApprovalId(memberId);
        return approvals.stream()
            .map(approval -> {
                
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()). orElse(null);
                String currentSigner = getCurrentSigner(approval);
                
                return new MyApprovalResponseDto(
                    approval.getApprovalStatus(),
                    detail != null ? detail.getApprovalType() : null,
                    detail != null ? detail.getApprovalTitle() : null,
                    currentSigner,
                    approval.getRegDate()
                );
            }).collect(Collectors.toList());
    }

    // 현재 결재자
    private String getCurrentSigner(Approval approval) {

        if (approval.getSignDate1() == null) return approval.getSignId1();
        if (approval.getSignDate2() == null) return approval.getSignId2();
        if (approval.getSignDate3() == null) return approval.getSignId3();
        if (approval.getSignDate4() == null) return approval.getSignId4();
        if (approval.getSignDate5() == null) return approval.getSignId5();
        return " "; // 다 승인했을 경우 공백 
    }

    // 대시보드(내가 결재할 문서)
    public List<MyApprovalResponseDto> getPendingApprovals() {

        String memeberId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Approval> approvals = approvalRepository.findPendingApprovals(memeberId);
        return approvals.stream()
            .map(approval -> {
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);

                return new MyApprovalResponseDto(
                    approval.getApprovalStatus(),
                    detail != null ? detail.getApprovalType() : null,
                    detail != null ? detail.getApprovalTitle() : null,
                    approval.getApprovalId(),
                    approval.getRegDate()
                );
        }).collect(Collectors.toList());
    }

    // 진행목록(전체)  전체는 내가 기안 올린 문서 + 결재할 문서 
    public List<ProgressListResponseDto> getAllApprovals() {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Approval> approvals = approvalRepository.findAllRelatedApprovals(memberId);
        return approvals.stream()
            .map(approval -> {
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
                String currentSigner = getCurrentSigner(approval);

                return new ProgressListResponseDto(
                    approval.getRegDate(),
                    detail != null ? detail.getApprovalTitle() : null,
                    detail != null ? detail.getApprovalType() : null,
                    approval.getApprovalDepartment(),
                    approval.getApprovalId(),
                    currentSigner,
                    approval.getApprovalStatus()
                );
        }).collect(Collectors.toList());
    }

    // 진행목록(기안중)
    public List<ProgressListResponseDto> getTemporarySavedApprovals() {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Approval> approvals = approvalRepository.findTemporarySavedApprovals(memberId);
        return approvals.stream()
            .map(approval -> {
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
                String currentSigner = getCurrentSigner(approval);

                return new ProgressListResponseDto(
                    null, 
                    detail != null ? detail.getApprovalTitle() : null,
                    detail != null ? detail.getApprovalType() : null,
                    approval.getApprovalDepartment(),
                    approval.getApprovalId(),
                    currentSigner,
                    "기안중"
                );
            }).collect(Collectors.toList());
    }

    // 진행목록(반려)
    public List<ProgressListResponseDto> getReturnedApprovals() {
     
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Approval> approvals = approvalRepository.findReturendApprovals(memberId);
        return approvals.stream()
            .map(approval -> {
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
                String currentSigner = getCurrentSigner(approval);

                return new ProgressListResponseDto(
                    approval.getRegDate(),
                    detail != null ? detail.getApprovalTitle() : null,
                    detail != null ? detail.getApprovalType() : null,
                    approval.getApprovalDepartment(),
                    approval.getApprovalId(),
                    currentSigner,
                    approval.getApprovalStatus()
                );
        }).collect(Collectors.toList());
    }

    // 진행목록(완료)
    public List<ProgressListResponseDto> getCompletedApprovals() {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Approval> approvals = approvalRepository.findReturendApprovals(memberId);
        return approvals.stream()
            .map(approval -> {
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
                String currentSigner = getCurrentSigner(approval);

                return new ProgressListResponseDto(
                    approval.getRegDate(),
                    detail != null ? detail.getApprovalTitle() : null,
                    detail != null ? detail.getApprovalType() : null,
                    approval.getApprovalDepartment(),
                    approval.getApprovalId(),
                    currentSigner,
                    approval.getApprovalStatus()
                );
        }).collect(Collectors.toList());
    }

    
}
