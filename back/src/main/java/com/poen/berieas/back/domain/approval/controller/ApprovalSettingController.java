package com.poen.berieas.back.domain.approval.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.approval.dto.ApprovalSettingListResponseDto;
import com.poen.berieas.back.domain.approval.dto.ApprovalSettingResponseDto;
import com.poen.berieas.back.domain.approval.dto.FormRequestDto;
import com.poen.berieas.back.domain.approval.service.ApprovalSettingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ApprovalSettingController {

    private final ApprovalSettingService approvalSettingService;
    
    // 양식 리스트
    @GetMapping(value = "/form/list", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ApprovalSettingListResponseDto>> formListApi() {

        List<ApprovalSettingListResponseDto> forms = approvalSettingService.getForms();
        return ResponseEntity.ok(forms);
    }

    // 양식 등록
    @PostMapping(value = "/form/addForm", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> addFormApi(FormRequestDto dto) {

        approvalSettingService.addForm(dto);
        return ResponseEntity.ok("양식 등록 완료");
    }

    // 양식 삭제
    @DeleteMapping(value = "/form/delete/{formNo}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteFormApi(@PathVariable int formNo) {

        approvalSettingService.deleteForm(formNo);
        return ResponseEntity.ok("해당 양식이 삭제되었습니다.");
    }

    // 양식 조회
    @GetMapping(value = "/form/{formNo}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApprovalSettingResponseDto> getformApi(@PathVariable int formNo) {

        ApprovalSettingResponseDto form = approvalSettingService.getForm(formNo);
        return ResponseEntity.ok(form);
    }
}
