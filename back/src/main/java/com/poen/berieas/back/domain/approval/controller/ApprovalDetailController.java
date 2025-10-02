package com.poen.berieas.back.domain.approval.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;
import org.springframework.web.bind.annotation.PathVariable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.poen.berieas.back.domain.approval.dto.ApprovalRequestDto;
import com.poen.berieas.back.domain.approval.dto.ApprovalResponseDto;
import com.poen.berieas.back.domain.approval.service.ApprovalDetailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ApprovalDetailController {

    private final ApprovalDetailService approvalDetailService;

    // 기안 등록
    @PostMapping(value = "/approvalDetail/addDraft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> addDraftApi(
            @RequestParam("approvalDto") String approvalDtoStr, // JSON 데이터
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {

        try {
            
            ObjectMapper objectMapper = new ObjectMapper();
            ApprovalRequestDto dto = objectMapper.readValue(approvalDtoStr, ApprovalRequestDto.class);

            approvalDetailService.addDraft(dto, files);
            return ResponseEntity.ok("기안서 등록 성공");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("기안서 등록 실패: " + e.getMessage());
        }
    }

    // 임시 저장
    @PostMapping(value = "/approvalDetail/temporaryDraft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> temporaryDraftApi(
            @RequestParam("approvalDto") String approvalDtoStr, // JSON 데이터
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        
        try {
            
            ObjectMapper objectMapper = new ObjectMapper();
            ApprovalRequestDto dto = objectMapper.readValue(approvalDtoStr, ApprovalRequestDto.class);

            approvalDetailService.temporaryDraft(dto, files);
            return ResponseEntity.ok("임시저장 성공");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("임시저장 실패: " + e.getMessage());
        }
    }

    // 기안서 가져오기
    @GetMapping(value = "/approvalDetail/getDraft/{approvalNo}")
    public ResponseEntity<?> getDraftApi(@PathVariable int approvalNo) {
        
        try {
            ApprovalResponseDto dto = approvalDetailService.getDraft(approvalNo);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("기안서 조회 실패: " + e.getMessage());
        }
    }

    // 파일 다운로드
    @GetMapping("/approvalDetail/file/download/{approvalNo}/{file}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable int approvalNo,
            @PathVariable String file) throws IOException {

        Resource resource = approvalDetailService.loadFile(approvalNo, file);
        Path path = resource.getFile().toPath();

        String fileName = path.getFileName().toString();
        String encodedFileName = UriUtils.encode(fileName, StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedFileName)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    // 파일 삭제
    @DeleteMapping("/approvalDetail/file/delete/{approvalNo}/{file}")
    public ResponseEntity<String> deleteFile(
            @PathVariable int approvalNo,
            @PathVariable String file) {

        try {
            approvalDetailService.deleteFile(approvalNo, file);
            return ResponseEntity.ok("파일 삭제 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 삭제 실패: " + e.getMessage());
        }
    }

    // 기안서 삭제
    @DeleteMapping(value = "/approvalDetail/delete/{approvalNo}")
    public ResponseEntity<String> deleteApproval(@PathVariable int approvalNo) {
        try {
            approvalDetailService.deleteApproval(approvalNo);
            return ResponseEntity.ok("기안서 삭제 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("기안서 삭제 실패: " + e.getMessage());
        }
    }

    // 기안취소 (진행중 -> 기안중으로 되돌리기)
    @PostMapping("/approvalDetail/cancel/{approvalNo}")
    public ResponseEntity<String> cancelApproval(@PathVariable int approvalNo) {
        try {
            approvalDetailService.cancelApproval(approvalNo);
            return ResponseEntity.ok("기안이 취소되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("기안취소 실패: " + e.getMessage());
        }
    }

}