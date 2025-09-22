package com.poen.berieas.back.domain.approval.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.approval.dto.MyApprovalResponseDto;
import com.poen.berieas.back.domain.approval.dto.ProgressListResponseDto;
import com.poen.berieas.back.domain.approval.service.ApprovalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ApprovalController {
    
    private final ApprovalService approvalService;

    // 대시보드(전체)
    @GetMapping(value = "/approval/total", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Integer> totalApprovalCountApi() {

        int total = approvalService.totalApprovalCount();

        return ResponseEntity.ok(total);
    }

    // 대시보드(진행중)
    @GetMapping(value = "/approval/inProgress", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Integer> inProgressCountApi() {

        int inProgress = approvalService.inProgressCount();

        return ResponseEntity.ok(inProgress);
    }

    // 대시보드(완료)
    @GetMapping(value = "/approval/completed", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Integer> completedCountApi() {

        int completed = approvalService.completedCount();

        return ResponseEntity.ok(completed);
    }
    
    // 대시보드(내가 상신한 문서) + 진행목록(진행중)
    @GetMapping(value = "/approval/mySubmitted", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<MyApprovalResponseDto>> getMySubmittedApi() {
        
        List<MyApprovalResponseDto> mySubmittedDocs = approvalService.getMySubmitted();
        return ResponseEntity.ok(mySubmittedDocs);
    }

    // 대시보드(내가 결재할 문서)
    @GetMapping(value = "/approval/mypending", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<MyApprovalResponseDto>> getPendingApprovalsApi() {

        List<MyApprovalResponseDto> pendingApprovals = approvalService.getPendingApprovals();
        return ResponseEntity.ok(pendingApprovals);
    }

    // 진행목록(전체)
    @GetMapping(value = "/approval/allAprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProgressListResponseDto>> getAllApprovalsApi() {

        List<ProgressListResponseDto> approvals = approvalService.getAllApprovals();
        return ResponseEntity.ok(approvals);
    }

    // 진행목록(기안중)
    @GetMapping(value = "/approval/temporarySavedApprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProgressListResponseDto>> getTemporarySavedApprovalsApi() {

        List<ProgressListResponseDto> approvals = approvalService.getTemporarySavedApprovals();
        return ResponseEntity.ok(approvals);
    }

    // 진행목록(반려)
    @GetMapping(value = "/approval/returnedApprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProgressListResponseDto>> getReturnedApprovalsApi() {

        List<ProgressListResponseDto> approvals = approvalService.getReturnedApprovals();
        return ResponseEntity.ok(approvals);
    }

    // 진행목록(결재)
    @GetMapping(value = "/approval/completedApprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProgressListResponseDto>> getCompletedApprovalsApi() {

        List<ProgressListResponseDto> approvals = approvalService.getCompletedApprovals();
        return ResponseEntity.ok(approvals);
    }
}
