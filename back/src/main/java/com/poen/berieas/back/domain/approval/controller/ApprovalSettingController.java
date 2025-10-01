package com.poen.berieas.back.domain.approval.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; // 이거 몬지 모는데 수정함
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
    @GetMapping(value = "/form/list")
    public ResponseEntity<List<ApprovalSettingListResponseDto>> formListApi() {

        List<ApprovalSettingListResponseDto> forms = approvalSettingService.getForms();
        return ResponseEntity.ok(forms);
    }

    // 양식 등록
    @PostMapping(value = "/form/addForm", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> addFormApi(@RequestBody FormRequestDto dto) {
        
        try {
            approvalSettingService.addForm(dto);
            return ResponseEntity.ok("양식 등록 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("양식 등록 실패: " + e.getMessage());
        }
    } // 여기도 수정됨

    // 양식 삭제
    @DeleteMapping(value = "/form/delete/{formNo}")
    public ResponseEntity<String> deleteFormApi(@PathVariable int formNo) {

        try {
            approvalSettingService.deleteForm(formNo);
            return ResponseEntity.ok("해당 양식이 삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("양식 삭제 실패: " + e.getMessage());
        }
    }

    // 양식 조회
    @GetMapping(value = "/form/{formNo}")
    public ResponseEntity<?> getformApi(@PathVariable int formNo) {

        try {
            ApprovalSettingResponseDto form = approvalSettingService.getForm(formNo);
            return ResponseEntity.ok(form);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("양식 조회 실패: " + e.getMessage());
        }
    }
}
