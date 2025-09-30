package com.poen.berieas.back.domain.approval.controller;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.poen.berieas.back.domain.approval.dto.CommentRequestDto;
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
    
    // 대시보드(내가 상신한 문서)
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
    public ResponseEntity<Page<ProgressListResponseDto>> getAllApprovalsApi(
        @PageableDefault(size = 15, sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {

        Page<ProgressListResponseDto> approvals = approvalService.getAllApprovals(pageable);
        return ResponseEntity.ok(approvals);
    }

    // 진행목록(진행중)
    @GetMapping(value = "/approval/inProgressApprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<MyApprovalResponseDto>> getInprogressApprovalsApi(
        @PageableDefault(size = 15, sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        
        Page<MyApprovalResponseDto> mySubmittedDocs = approvalService.getInProgressApprovals(pageable);
        return ResponseEntity.ok(mySubmittedDocs);
    }

    // 진행목록(기안중)
    @GetMapping(value = "/approval/temporarySavedApprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<ProgressListResponseDto>> getTemporarySavedApprovalsApi(
        @PageableDefault(size = 15, sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {

        Page<ProgressListResponseDto> approvals = approvalService.getTemporarySavedApprovals(pageable);
        return ResponseEntity.ok(approvals);
    }

    // 진행목록(반려)
    @GetMapping(value = "/approval/returnedApprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<ProgressListResponseDto>> getReturnedApprovalsApi(
        @PageableDefault(size = 15, sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {

        Page<ProgressListResponseDto> approvals = approvalService.getReturnedApprovals(pageable);
        return ResponseEntity.ok(approvals);
    }

    // 진행목록(결재)
    @GetMapping(value = "/approval/completedApprovals", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<ProgressListResponseDto>> getCompletedApprovalsApi(
        @PageableDefault(size = 15, sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {

        Page<ProgressListResponseDto> approvals = approvalService.getCompletedApprovals(pageable);
        return ResponseEntity.ok(approvals);
    }

    // 결재자 첨언
    @PostMapping(value = "/approval/comments/{approvalNo}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> commentsApi(@PathVariable int approvalNo, CommentRequestDto dto) {

        approvalService.comments(approvalNo, dto);
        return ResponseEntity.ok("첨언 등록 완료");
    }

    // 본인 첨언
    @PostMapping(value = "/approval/updateComments/{approvalNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateCommentsApi(
            @PathVariable int approvalNo,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        
        try {
            
            approvalService.updateComments(approvalNo, files);
            return ResponseEntity.ok("첨언 등록 완료");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("첨언 실패: " + e.getMessage());
        }
    }

    // 승인
    @PostMapping(value = "/approval/doApproval/{approvalNo}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> doApprovalApi(@PathVariable int approvalNo) {

        approvalService.doApproval(approvalNo);
        return ResponseEntity.ok("승인 완료");
    }

    // 반려
    @PostMapping(value = "/approval/doReject/{approvalNo}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> doRejectApi(@PathVariable int approvalNo) {

        approvalService.doReject(approvalNo);
        return ResponseEntity.ok("반려 완료");
    }
    
}
