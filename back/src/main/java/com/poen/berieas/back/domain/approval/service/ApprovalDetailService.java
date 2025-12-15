package com.poen.berieas.back.domain.approval.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.poen.berieas.back.domain.approval.dto.ApprovalRequestDto;
import com.poen.berieas.back.domain.approval.dto.ApprovalResponseDto;
import com.poen.berieas.back.domain.approval.entity.Approval;
import com.poen.berieas.back.domain.approval.entity.ApprovalDetail;
import com.poen.berieas.back.domain.approval.entity.ApprovalSetting;
import com.poen.berieas.back.domain.approval.repository.ApprovalDetailRepository;
import com.poen.berieas.back.domain.approval.repository.ApprovalRepository;
import com.poen.berieas.back.domain.approval.repository.ApprovalSettingRepository;
import com.poen.berieas.back.domain.member.entity.Member;
import com.poen.berieas.back.domain.member.repository.MemberRepository;
import com.poen.berieas.back.util.MessageUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalDetailService {
    
    private final ApprovalDetailRepository approvalDetailRepository;
    private final ApprovalSettingRepository approvalSettingRepository;
    private final MemberRepository memberRepository;
    private final ApprovalRepository approvalRepository;
    private final MessageUtil messageUtil;

    // 파일 저장
    @Value("${file.upload-dir}")
    private String uploadDir;

    // 파일 임시 저장 
    @Value("${file.upload-temp-dir}")
    private String tempDir;

    // 기안서 등록
    @Transactional
    public void addDraft(ApprovalRequestDto dto, List<MultipartFile> files) {

        ApprovalSetting form = approvalSettingRepository.findByFormNo(dto.getFormNo())
            .orElseThrow(() ->  new IllegalArgumentException(messageUtil.getMessage("error.approval.form.not.found")));

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.exists")));

        Approval approval;
        
        // approvalNo가 있으면 기존 문서 수정, 없으면 새로 생성
        if (dto.getApprovalNo() != null && dto.getApprovalNo() > 0) {
            approval = approvalRepository.findByApprovalNo(dto.getApprovalNo())
                .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.draft.not.found")));
        } else {
            // 새로 생성
            approval = new Approval();
            approval.setApprovalId(memberId);
            approval.setApprovalName(member.getMemberName());
            approval.setApprovalDepartment(member.getMemberDepartment());
            approval.setApprovalPosition(member.getMemberPosition());
            approval.setRegId(memberId);
        }

        // 상태 및 필드 업데이트
        approval.setApprovalStartDate(LocalDateTime.now());
        approval.setApprovalStatus("진행중");
        
        // 양식에 결재자가 지정되어 있으면 양식의 결재자 사용, 없으면 dto의 결재자 사용
        String signId1 = (form.getFormSignId1() != null && !form.getFormSignId1().isBlank()) 
            ? form.getFormSignId1() : dto.getSignId1();
        String signId2 = (form.getFormSignId2() != null && !form.getFormSignId2().isBlank()) 
            ? form.getFormSignId2() : dto.getSignId2();
        String signId3 = (form.getFormSignId3() != null && !form.getFormSignId3().isBlank()) 
            ? form.getFormSignId3() : dto.getSignId3();
        String signId4 = (form.getFormSignId4() != null && !form.getFormSignId4().isBlank()) 
            ? form.getFormSignId4() : dto.getSignId4();
        String signId5 = (form.getFormSignId5() != null && !form.getFormSignId5().isBlank()) 
            ? form.getFormSignId5() : dto.getSignId5();
        
        approval.setSignId1(signId1);
        approval.setSignId2(signId2);
        approval.setSignId3(signId3);
        approval.setSignId4(signId4);
        approval.setSignId5(signId5);
        approval.setReferenceId(dto.getReferenceId());
        approval.setNextId(signId1);
        approval.setUpdateId(memberId);

        approvalRepository.save(approval);

        // ApprovalDetail 가져오기 (없으면 생성)
        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo())
            .orElseGet(() -> {
                ApprovalDetail newDetail = new ApprovalDetail();
                newDetail.setApprovalNo(approval.getApprovalNo());
                newDetail.setFormNo(dto.getFormNo());
                newDetail.setApprovalType(form.getFormType());
                newDetail.setRegId(memberId);
                return newDetail;
            });

        detail.setApprovalTitle(dto.getApprovalTitle());
        detail.setApprovalDocument(dto.getApprovalDocument());
        detail.setUpdateId(memberId);

        // 파일 처리 (최대 5개)
        if (files != null) {

            for (int i = 0; i < files.size() && i < 5; i++) {
                MultipartFile file = files.get(i);
                if (file.isEmpty()) continue;

                try {
                    // 저장할 경로
                    String savedFileName = file.getOriginalFilename();
                    Path savePath = Paths.get(uploadDir, savedFileName);

                    Files.createDirectories(savePath.getParent());
                    file.transferTo(savePath.toFile());

                    switch (i) {
                        case 0 -> {
                            detail.setApprovalAttachPath1(uploadDir);
                            detail.setApprovalAttachFile1(savedFileName);
                            detail.setApprovalAttachInfo1("기안");
                        }
                        case 1 -> {
                            detail.setApprovalAttachPath2(uploadDir);
                            detail.setApprovalAttachFile2(savedFileName);
                            detail.setApprovalAttachInfo2("기안");
                        }
                        case 2 -> {
                            detail.setApprovalAttachPath3(uploadDir);
                            detail.setApprovalAttachFile3(savedFileName);
                            detail.setApprovalAttachInfo3("기안");
                        }
                        case 3 -> {
                            detail.setApprovalAttachPath4(uploadDir);
                            detail.setApprovalAttachFile4(savedFileName);
                            detail.setApprovalAttachInfo4("기안");
                        }
                        case 4 -> {
                            detail.setApprovalAttachPath5(uploadDir);
                            detail.setApprovalAttachFile5(savedFileName);

                            detail.setApprovalAttachInfo5("기안");
                        }
                    }
                } catch (IOException e) {
                    throw new RuntimeException(messageUtil.getMessage("error.file.save.failed") + ": " + file.getOriginalFilename(), e);
                }
            }
        }
        approvalDetailRepository.save(detail);
    }

    // 임시저장
    @Transactional
    public void temporaryDraft(ApprovalRequestDto dto, List<MultipartFile> files) {

        ApprovalSetting form = approvalSettingRepository.findByFormNo(dto.getFormNo())
            .orElseThrow(() ->  new IllegalArgumentException(messageUtil.getMessage("error.approval.form.not.found")));

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.exists")));

        Approval approval;
        
        // approvalNo가 있으면 기존 문서 수정, 없으면 새로 생성
        if (dto.getApprovalNo() != null && dto.getApprovalNo() > 0) {
            approval = approvalRepository.findByApprovalNo(dto.getApprovalNo())
                .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.draft.not.found")));
        } else {
            // 새로 생성
            approval = new Approval();
            approval.setApprovalStartDate(null);
            approval.setApprovalId(memberId);
            approval.setApprovalName(member.getMemberName());
            approval.setApprovalDepartment(member.getMemberDepartment());
            approval.setApprovalPosition(member.getMemberPosition());
            approval.setApprovalStatus("기안중");
            approval.setRegId(memberId);
        }

        // 양식에 결재자가 지정되어 있으면 양식의 결재자 사용, 없으면 dto의 결재자 사용
        String signId1 = (form.getFormSignId1() != null && !form.getFormSignId1().isBlank()) 
            ? form.getFormSignId1() : dto.getSignId1();
        String signId2 = (form.getFormSignId2() != null && !form.getFormSignId2().isBlank()) 
            ? form.getFormSignId2() : dto.getSignId2();
        String signId3 = (form.getFormSignId3() != null && !form.getFormSignId3().isBlank()) 
            ? form.getFormSignId3() : dto.getSignId3();
        String signId4 = (form.getFormSignId4() != null && !form.getFormSignId4().isBlank()) 
            ? form.getFormSignId4() : dto.getSignId4();
        String signId5 = (form.getFormSignId5() != null && !form.getFormSignId5().isBlank()) 
            ? form.getFormSignId5() : dto.getSignId5();
        
        approval.setSignId1(signId1);
        approval.setSignId2(signId2);
        approval.setSignId3(signId3);
        approval.setSignId4(signId4);
        approval.setSignId5(signId5);
        approval.setReferenceId(dto.getReferenceId());
        approval.setNextId(signId1);
        approval.setUpdateId(memberId);

        approvalRepository.save(approval);

        // ApprovalDetail
        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo())
            .orElseGet(() -> {
                ApprovalDetail newDetail = new ApprovalDetail();
                newDetail.setApprovalNo(approval.getApprovalNo());
                newDetail.setFormNo(dto.getFormNo());
                newDetail.setApprovalType(form.getFormType());
                newDetail.setRegId(memberId);
                return newDetail;
            });

        detail.setApprovalTitle(dto.getApprovalTitle());
        detail.setApprovalDocument(dto.getApprovalDocument());
        detail.setUpdateId(memberId);


        // 파일 처리 (최대 5개)
        if (files != null) {

            for (int i = 0; i < files.size() && i < 5; i++) {
                MultipartFile file = files.get(i);
                if (file.isEmpty()) continue;

                try {
                    // 저장할 경로
                    String savedFileName = file.getOriginalFilename();
                    Path savePath = Paths.get(tempDir, savedFileName);

                    Files.createDirectories(savePath.getParent());
                    file.transferTo(savePath.toFile());

                    switch (i) {
                        case 0 -> {
                            detail.setApprovalAttachPath1(tempDir);
                            detail.setApprovalAttachFile1(savedFileName);
                            detail.setApprovalAttachInfo1("기안");
                        }
                        case 1 -> {
                            detail.setApprovalAttachPath2(tempDir);
                            detail.setApprovalAttachFile2(savedFileName);
                            detail.setApprovalAttachInfo2("기안");
                        }
                        case 2 -> {
                            detail.setApprovalAttachPath3(tempDir);
                            detail.setApprovalAttachFile3(savedFileName);
                            detail.setApprovalAttachInfo3("기안");
                        }
                        case 3 -> {
                            detail.setApprovalAttachPath4(tempDir);
                            detail.setApprovalAttachFile4(savedFileName);
                            detail.setApprovalAttachInfo4("기안");
                        }
                        case 4 -> {
                            detail.setApprovalAttachPath5(tempDir);
                            detail.setApprovalAttachFile5(savedFileName);
                            detail.setApprovalAttachInfo5("기안");
                        }
                    }
                } catch (IOException e) {
                    throw new RuntimeException(messageUtil.getMessage("error.file.save.failed") + ": " + file.getOriginalFilename(), e);
                }
            }
        }
        approvalDetailRepository.save(detail);
    }

    // 기안서 가져오기
    public ApprovalResponseDto getDraft(int approvalNo) {

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.not.found")));
        
        ApprovalDetail approvalDetail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.not.found")));

        ApprovalSetting form = approvalSettingRepository.findByFormNo(approvalDetail.getFormNo())
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.form.not.found")));

        ApprovalResponseDto dto = new ApprovalResponseDto(
            approvalDetail.getFormNo(),
            form.getFormTitle(),
            approvalDetail.getApprovalTitle(),
            approval.getApprovalStartDate(),
            approval.getApprovalName(),
            approval.getApprovalStatus(),
            approval.getSignId1(),
            approval.getSignId2(),
            approval.getSignId3(),
            approval.getSignId4(),
            approval.getSignId5(),
            approval.getSignDate1(),
            approval.getSignDate2(),
            approval.getSignDate3(),
            approval.getSignDate4(),
            approval.getSignDate5(),
            approval.getReferenceId(),
            approval.getNextId(),
            approvalDetail.getApprovalAttachFile1(),
            approvalDetail.getApprovalAttachFile2(),
            approvalDetail.getApprovalAttachFile3(),
            approvalDetail.getApprovalAttachFile4(),
            approvalDetail.getApprovalAttachFile5(),
            approvalDetail.getApprovalDocument(),
            approval.getSignRemark1(),
            approval.getSignRemark2(),
            approval.getSignRemark3(),
            approval.getSignRemark4(),
            approval.getSignRemark5(),
            approvalDetail.getDrafterRemark(),
            approvalDetail.getReferenceRemark(),
            approval.getUpdateDate(),
            approval.getRegDate(),
            approvalDetail.getSignerAttachPath(),
            approvalDetail.getSignerAttachFile(),
            approvalDetail.getSignerAttachInfo(),
            approvalDetail.getReferenceAttachFile(),
            approvalDetail.getReferenceAttachPath(),
            approvalDetail.getReferenceAttachInfo()
        );
        return dto;
    }

    // 파일 다운로드
    public Resource loadFile(int approvalNo, String file) throws IOException {

        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.document.not.exists")));

        String filePath = switch (file) {

            case "approvalAttachFile1" -> detail.getApprovalAttachPath1() + "/" + detail.getApprovalAttachFile1();
            case "approvalAttachFile2" -> detail.getApprovalAttachPath2() + "/" + detail.getApprovalAttachFile2();
            case "approvalAttachFile3" -> detail.getApprovalAttachPath3() + "/" + detail.getApprovalAttachFile3();
            case "approvalAttachFile4" -> detail.getApprovalAttachPath4() + "/" + detail.getApprovalAttachFile4();
            case "approvalAttachFile5" -> detail.getApprovalAttachPath5() + "/" + detail.getApprovalAttachFile5();
            case "signerAttachFile" -> detail.getSignerAttachPath() + "/" + detail.getSignerAttachFile();
            case "referenceAttachFile" -> detail.getReferenceAttachPath() + "/" + detail.getReferenceAttachFile();
            default -> throw new IllegalArgumentException(messageUtil.getMessage("error.file.parameter.invalid"));
        };

        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.file.not.found"));
        }

        return new FileSystemResource(path);
    }

    // 파일 삭제
    @Transactional
    public void deleteFile(int approvalNo, String file) throws IOException {

        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.document.not.exists")));

        String filePath = null;

        switch (file) {
            case "approvalAttachFile1" -> {
                filePath = detail.getApprovalAttachPath1() + "/" + detail.getApprovalAttachFile1();
                detail.setApprovalAttachFile1(null);
                detail.setApprovalAttachPath1(null);
                detail.setApprovalAttachInfo1(null);
            }
            case "approvalAttachFile2" -> {
                filePath = detail.getApprovalAttachPath2() + "/" + detail.getApprovalAttachFile2();
                detail.setApprovalAttachFile2(null);
                detail.setApprovalAttachPath2(null);
                detail.setApprovalAttachInfo2(null);
            }
            case "approvalAttachFile3" -> {
                filePath = detail.getApprovalAttachPath2() + "/" + detail.getApprovalAttachFile2();
                detail.setApprovalAttachFile3(null);
                detail.setApprovalAttachPath3(null);
                detail.setApprovalAttachInfo3(null);
            }
            case "approvalAttachFile4" -> {
                filePath = detail.getApprovalAttachPath2() + "/" + detail.getApprovalAttachFile2();
                detail.setApprovalAttachFile4(null);
                detail.setApprovalAttachPath4(null);
                detail.setApprovalAttachInfo4(null);
            }
            case "approvalAttachFile5" -> {
                filePath = detail.getApprovalAttachPath2() + "/" + detail.getApprovalAttachFile2();
                detail.setApprovalAttachFile5(null);
                detail.setApprovalAttachPath5(null);
                detail.setApprovalAttachInfo5(null);
            }

            default -> throw new IllegalArgumentException(messageUtil.getMessage("error.file.parameter.invalid"));
        }

        if (filePath != null) {
            Files.deleteIfExists(Paths.get(filePath)); // 실제 파일 삭제
        }

        approvalDetailRepository.save(detail); // DB 반영
    }

    // 기안서 삭제 
    @Transactional
    public void deleteApproval(int approvalNo) {
        
        // ApprovalDetail 삭제
        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.document.not.exists")));
        
        // 첨부파일들도 함께 삭제
        try {
            if (detail.getApprovalAttachFile1() != null) {
                deleteFile(approvalNo, "approvalAttachFile1");
            }
            if (detail.getApprovalAttachFile2() != null) {
                deleteFile(approvalNo, "approvalAttachFile2");
            }
            if (detail.getApprovalAttachFile3() != null) {
                deleteFile(approvalNo, "approvalAttachFile3");
            }
            if (detail.getApprovalAttachFile4() != null) {
                deleteFile(approvalNo, "approvalAttachFile4");
            }
            if (detail.getApprovalAttachFile5() != null) {
                deleteFile(approvalNo, "approvalAttachFile5");
            }
        } catch (IOException e) {
            // 파일 삭제 실패는 무시하고 계속 진행
        }
        
        approvalDetailRepository.delete(detail);
        
        // Approval 삭제
        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.draft.not.found")));
        
        approvalRepository.delete(approval);
    }

    // 기안취소 (진행중 -> 기안중으로 되돌리기)
    @Transactional
    public void cancelApproval(int approvalNo) {
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Approval 조회
        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.draft.not.found")));
        
        // 권한 확인: 기안자만 취소 가능
        if (!approval.getApprovalId().equals(memberId)) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.cancel.drafter.only"));
        }
        
        // 상태 확인: 진행중 상태만 취소 가능
        if (!"진행중".equals(approval.getApprovalStatus())) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.cancel.only.inprogress"));
        }
        
        // 취소 가능 조건 확인: 첫 번째 결재자(signId1)가 결재했으면 취소 불가
        if (approval.getSignDate1() != null) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.cancel.first.signer.approved"));
        }
        
        // 취소 가능 조건 확인: signId2부터는 아무도 결재하지 않아야 함
        if (approval.getSignDate2() != null || 
            approval.getSignDate3() != null || 
            approval.getSignDate4() != null || 
            approval.getSignDate5() != null) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.cancel.second.signer.approved"));
        }
        
        // 상태를 기안중으로 변경
        approval.setApprovalStatus("기안중");
        approval.setApprovalEndDate(null);
        approval.setNextId(null);
        
        approval.setUpdateId(memberId);
        approvalRepository.save(approval);
    }
}
