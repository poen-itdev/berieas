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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalDetailService {
    
    private final ApprovalDetailRepository approvalDetailRepository;
    private final ApprovalSettingRepository approvalSettingRepository;
    private final MemberRepository memberRepository;
    private final ApprovalRepository approvalRepository;

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
            .orElseThrow(() ->  new IllegalArgumentException("양식이 존재하지 않습니다."));

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버가 존재하지 않습니다."));

        Approval approval = approvalRepository.findByApprovalIdAndApprovalStatus(memberId, "기안중")
            .orElseGet(() -> {
                // 없으면 새로 생성
                Approval newApproval = new Approval();
                newApproval.setApprovalId(memberId);
                newApproval.setApprovalName(member.getMemberName());
                newApproval.setApprovalDepartment(member.getMemberDepartment());
                newApproval.setApprovalPosition(member.getMemberPosition());
                newApproval.setRegId(memberId);
                return newApproval;
            });

        // 2. 상태 및 필드 업데이트
        approval.setApprovalStartDate(LocalDateTime.now());
        approval.setApprovalStatus("진행중");
        approval.setSignId1(dto.getSignId1());
        approval.setSignId2(dto.getSignId2());
        approval.setSignId3(dto.getSignId3());
        approval.setSignId4(dto.getSignId4());
        approval.setSignId5(dto.getSignId5());
        approval.setReferenceId(dto.getReferenceId());
        approval.setNextId(dto.getSignId1());
        approval.setUpdateId(memberId);

        approvalRepository.save(approval);

        // 3. ApprovalDetail 가져오기 (없으면 생성)
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
                    throw new RuntimeException("파일 저장 실패: " + file.getOriginalFilename(), e);
                }
            }
        }
        approvalDetailRepository.save(detail);
    }

    // 임시저장
    @Transactional
    public void temporaryDraft(ApprovalRequestDto dto, List<MultipartFile> files) {

        ApprovalSetting form = approvalSettingRepository.findByFormNo(dto.getFormNo())
            .orElseThrow(() ->  new IllegalArgumentException("양식이 존재하지 않습니다."));

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버가 존재하지 않습니다."));

        Approval approval = approvalRepository.findByApprovalIdAndApprovalStatus(memberId, "기안중")
            .orElseGet(() -> {
                Approval newApproval = new Approval();
                newApproval.setApprovalStartDate(null);
                newApproval.setApprovalId(memberId);
                newApproval.setApprovalName(member.getMemberName());
                newApproval.setApprovalDepartment(member.getMemberDepartment());
                newApproval.setApprovalPosition(member.getMemberPosition());
                newApproval.setApprovalStatus("기안중");
                newApproval.setRegId(memberId);
                return newApproval;
            });

        approval.setSignId1(dto.getSignId1());
        approval.setSignId2(dto.getSignId2());
        approval.setSignId3(dto.getSignId3());
        approval.setSignId4(dto.getSignId4());
        approval.setSignId5(dto.getSignId5());
        approval.setReferenceId(dto.getReferenceId());
        approval.setNextId(dto.getSignId1());
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
                    throw new RuntimeException("파일 저장 실패: " + file.getOriginalFilename(), e);
                }
            }
        }
        approvalDetailRepository.save(detail);
    }

    // 기안서 가져오기
    public ApprovalResponseDto getDraft(int approvalNo) {

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));
        
        ApprovalDetail approvalDetail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));

        ApprovalSetting form = approvalSettingRepository.findByFormNo(approvalDetail.getFormNo())
            .orElseThrow(() -> new IllegalArgumentException("해당 양식을 찾을 수 없습니다."));

        ApprovalResponseDto dto = new ApprovalResponseDto(
            approvalDetail.getFormNo(),
            form.getFormTitle(),
            approvalDetail.getApprovalTitle(),
            approval.getApprovalStartDate(),
            approval.getApprovalName(),
            approval.getSignId1(),
            approval.getSignId2(),
            approval.getSignId3(),
            approval.getSignId4(),
            approval.getSignId5(),
            approval.getReferenceId(),
            approvalDetail.getApprovalAttachFile1(),
            approvalDetail.getApprovalAttachFile2(),
            approvalDetail.getApprovalAttachFile3(),
            approvalDetail.getApprovalAttachFile4(),
            approvalDetail.getApprovalAttachFile5(),
            approvalDetail.getApprovalDocument()
        );
        return dto;
    }

    // 파일 다운로드
    public Resource loadFile(int approvalNo, String file) throws IOException {

        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("문서가 존재하지 않습니다."));

        String filePath = switch (file) {

            case "approvalAttachFile1" -> detail.getApprovalAttachPath1() + "/" + detail.getApprovalAttachFile1();
            case "approvalAttachFile2" -> detail.getApprovalAttachPath2() + "/" + detail.getApprovalAttachFile2();
            case "approvalAttachFile3" -> detail.getApprovalAttachPath3() + "/" + detail.getApprovalAttachFile3();
            case "approvalAttachFile4" -> detail.getApprovalAttachPath4() + "/" + detail.getApprovalAttachFile4();
            case "approvalAttachFile5" -> detail.getApprovalAttachPath5() + "/" + detail.getApprovalAttachFile5();
            default -> throw new IllegalArgumentException("잘못된 파일 파라미터입니다.");
        };

        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("파일이 존재하지 않습니다.");
        }

        return new FileSystemResource(path);
    }

    // 파일 삭제
    @Transactional
    public void deleteFile(int approvalNo, String file) throws IOException {

        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("문서가 존재하지 않습니다."));

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

            default -> throw new IllegalArgumentException("잘못된 파일 파라미터입니다.");
        }

        if (filePath != null) {
            Files.deleteIfExists(Paths.get(filePath)); // 실제 파일 삭제
        }

        approvalDetailRepository.save(detail); // DB 반영
    }
}
