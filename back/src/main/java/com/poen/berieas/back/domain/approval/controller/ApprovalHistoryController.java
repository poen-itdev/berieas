package com.poen.berieas.back.domain.approval.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.approval.dto.ApprovalHistoryResponseDto;
import com.poen.berieas.back.domain.approval.service.ApprovalHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ApprovalHistoryController {

    private final ApprovalHistoryService approvalHistoryService;
    
    // 이력 리스트
    @GetMapping(value = "/history/list")
    public ResponseEntity<List<ApprovalHistoryResponseDto>> historyListApi() {

        List<ApprovalHistoryResponseDto> historys = approvalHistoryService.getHistorys();
        return ResponseEntity.ok(historys);
    }
}
