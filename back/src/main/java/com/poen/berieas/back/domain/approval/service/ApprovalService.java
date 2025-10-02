package com.poen.berieas.back.domain.approval.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.poen.berieas.back.domain.approval.dto.CommentRequestDto;
import com.poen.berieas.back.domain.approval.dto.MyApprovalResponseDto;
import com.poen.berieas.back.domain.approval.dto.ProgressListResponseDto;
import com.poen.berieas.back.domain.approval.entity.Approval;
import com.poen.berieas.back.domain.approval.entity.ApprovalDetail;
import com.poen.berieas.back.domain.approval.repository.ApprovalDetailRepository;
import com.poen.berieas.back.domain.approval.repository.ApprovalRepository;
import com.poen.berieas.back.domain.member.entity.Member;
import com.poen.berieas.back.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {

    // 파일 저장
    @Value("${file.upload-dir}")
    private String uploadDir;

    // 파일 임시 저장 
    @Value("${file.upload-temp-dir}")
    private String tempDir;
    
    private final ApprovalRepository approvalRepository;
    private final ApprovalDetailRepository approvalDetailRepository;
    private final MemberRepository memberRepository;
    
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

    // 대시보드(내가 상신한 문서)
    public List<MyApprovalResponseDto> getMySubmitted() {

        // 로그인한 유저의 memberId 
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Approval> approvals = approvalRepository.findTop5ByApprovalIdOrderByRegDateDesc(memberId);
        return approvals.stream()
            .map(approval -> {
                
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()). orElse(null);
                String currentSigner = getCurrentSigner(approval);
                
                return new MyApprovalResponseDto(
                    approval.getApprovalNo(),
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

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Member member = memberRepository.findByMemberId(memberId).orElseThrow(() -> new IllegalArgumentException("해당 유저가 없다."));

        List<Approval> approvals = approvalRepository.findPendingApprovals(member.getMemberName());
        return approvals.stream()
            .map(approval -> {
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);

                return new MyApprovalResponseDto(
                    approval.getApprovalNo(),
                    approval.getApprovalStatus(),
                    detail != null ? detail.getApprovalType() : null,
                    detail != null ? detail.getApprovalTitle() : null,
                    approval.getApprovalName(),
                    approval.getRegDate()
                );
        }).collect(Collectors.toList());
    }

    // 진행목록(전체)  전체는 내가 기안 올린 문서 + 결재할 문서 
    public Page<ProgressListResponseDto> getAllApprovals(Pageable pageable) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        Page<Approval> approvals = approvalRepository.findAllRelatedApprovals(member.getMemberName(), pageable);

        return approvals.map(approval -> {

            ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
            String currentSigner = getCurrentSigner(approval);

            return new ProgressListResponseDto(
                approval.getApprovalNo(),
                approval.getRegDate(),
                detail != null ? detail.getApprovalTitle() : null,
                detail != null ? detail.getApprovalType() : null,
                approval.getApprovalDepartment(),
                member.getMemberName(),
                currentSigner,
                approval.getApprovalStatus()
            );
        });
    }

    // 진행목록(진행중)
    public Page<MyApprovalResponseDto> getInProgressApprovals(Pageable pageable) {

        // 로그인한 유저의 memberId 
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Page<Approval> approvals = approvalRepository.findInprogressApprovals(memberId, pageable);

        return approvals.map(approval -> {
                
            ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()). orElse(null);
            String currentSigner = getCurrentSigner(approval);
            
            return new MyApprovalResponseDto(
                approval.getApprovalNo(),
                approval.getApprovalStatus(),
                detail != null ? detail.getApprovalType() : null,
                detail != null ? detail.getApprovalTitle() : null,
                currentSigner,
                approval.getRegDate()
            );
        });
    }

    // 진행목록(기안중)
    public Page<ProgressListResponseDto> getTemporarySavedApprovals(Pageable pageable) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        Page<Approval> approvals = approvalRepository.findTemporarySavedApprovals(memberId, pageable);

        return approvals.map(approval -> {
            ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
            String currentSigner = getCurrentSigner(approval);

            return new ProgressListResponseDto(
                approval.getApprovalNo(),
                approval.getRegDate(), 
                detail != null ? detail.getApprovalTitle() : null,
                detail != null ? detail.getApprovalType() : null,
                approval.getApprovalDepartment(),
                member.getMemberName(),
                currentSigner,
                "기안중"
            );
        });
    }

    // 진행목록(반려)
    public Page<ProgressListResponseDto> getReturnedApprovals(Pageable pageable) {
     
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        Page<Approval> approvals = approvalRepository.findReturendApprovals(memberId, pageable);
        return approvals.map(approval -> {
            ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
            String currentSigner = getCurrentSigner(approval);

            return new ProgressListResponseDto(
                approval.getApprovalNo(),
                approval.getRegDate(),
                detail != null ? detail.getApprovalTitle() : null,
                detail != null ? detail.getApprovalType() : null,
                approval.getApprovalDepartment(),
                member.getMemberName(),
                currentSigner,
                approval.getApprovalStatus()
            );
        });
    }

    // 진행목록(완료)
    public Page<ProgressListResponseDto> getCompletedApprovals(Pageable pageable) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        Page<Approval> approvals = approvalRepository.findCompletedApprovals(memberId, pageable);
        return approvals.map(approval -> {
            ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approval.getApprovalNo()).orElse(null);
            String currentSigner = getCurrentSigner(approval);

            return new ProgressListResponseDto(
                approval.getApprovalNo(),
                approval.getRegDate(),
                detail != null ? detail.getApprovalTitle() : null,
                detail != null ? detail.getApprovalType() : null,
                approval.getApprovalDepartment(),
                member.getMemberName(),
                currentSigner,
                approval.getApprovalStatus()
            );
        });
    }

    // 결재자 첨언
    @Transactional
    public void comments(int approvalNo, CommentRequestDto dto) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));

        System.out.println(memberId + "==================================");

        // 현재 결재 차례인지 확인
        if (!member.getMemberName().equals(approval.getNextId())) {
            throw new IllegalStateException("현재 결재 차례가 아닙니다.");
        }

        if (member.getMemberName().equals(approval.getSignId1())) {

            approval.setSignRemark1(dto.getComment());
        } else if (member.getMemberName().equals(approval.getSignId2())) {

            approval.setSignRemark2(dto.getComment());
        } else if (member.getMemberName().equals(approval.getSignId3())) {

            approval.setSignRemark3(dto.getComment());
        } else if (member.getMemberName().equals(approval.getSignId4())) {

            approval.setSignRemark4(dto.getComment());
        } else if (member.getMemberName().equals(approval.getSignId5())) {

            approval.setSignRemark5(dto.getComment());
        } else {

            throw new IllegalStateException("해당 사용자는 결재자가 아닙니다.");
        }

        approval.setUpdateDate(LocalDateTime.now());

        approvalRepository.save(approval);
    }

    // 본인 첨언
    @Transactional
    public void updateComments(int approvalNo, List<MultipartFile> files) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));

        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("문서가 존재하지 않습니다."));

        if (!memberId.equals(approval.getApprovalId())) {

            throw new IllegalArgumentException("기안자만 첨언 파일을 추가할 수 있습니다.");
        }
        
        if (files == null || files.isEmpty()) return;

        // 기존 파일 정보 리스트
        List<String> attachFiles = Arrays.asList(
                detail.getApprovalAttachFile1(),
                detail.getApprovalAttachFile2(),
                detail.getApprovalAttachFile3(),
                detail.getApprovalAttachFile4(),
                detail.getApprovalAttachFile5()
        );

        for (MultipartFile file : files) {

            if (file.isEmpty()) continue;

            // 빈 슬롯 찾기
            int slotIndex = -1;
            for (int j = 0; j < attachFiles.size(); j++) {
                if (attachFiles.get(j) == null) {
                    slotIndex = j;
                    break;
                }
            }

            if (slotIndex == -1) {
                throw new RuntimeException("첨부파일 최대 개수(5개)를 초과했습니다.");
            }

            try {
                // 파일 저장
                String savedFileName = file.getOriginalFilename();
                Path savePath = Paths.get(uploadDir, savedFileName);
                Files.createDirectories(savePath.getParent());
                file.transferTo(savePath.toFile());

                // 빈 슬롯에 파일 정보 저장
                switch (slotIndex) {
                    case 0 -> { detail.setApprovalAttachFile1(savedFileName); detail.setApprovalAttachPath1(uploadDir); detail.setApprovalAttachInfo1("첨언"); }
                    case 1 -> { detail.setApprovalAttachFile2(savedFileName); detail.setApprovalAttachPath2(uploadDir); detail.setApprovalAttachInfo2("첨언"); }
                    case 2 -> { detail.setApprovalAttachFile3(savedFileName); detail.setApprovalAttachPath3(uploadDir); detail.setApprovalAttachInfo3("첨언"); }
                    case 3 -> { detail.setApprovalAttachFile4(savedFileName); detail.setApprovalAttachPath4(uploadDir); detail.setApprovalAttachInfo4("첨언"); }
                    case 4 -> { detail.setApprovalAttachFile5(savedFileName); detail.setApprovalAttachPath5(uploadDir); detail.setApprovalAttachInfo5("첨언"); }
                }

                // attachFiles 리스트 업데이트 (다음 반복에서 빈 슬롯 체크용)
                attachFiles.set(slotIndex, savedFileName);

            } catch (IOException e) {
                throw new RuntimeException("파일 저장 실패: " + file.getOriginalFilename(), e);
            }
        }
        detail.setUpdateId(memberId);
        detail.setUpdateDate(LocalDateTime.now());

        approvalDetailRepository.save(detail);
    }

    // 승인
    @Transactional
    public void doApproval(int approvalNo) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));

        if (!member.getMemberName().equals(approval.getNextId())) {
            throw new IllegalArgumentException("현재 결재권자가 아니면 승인할 수 없습니다.");
        }

        // 결재 1
        if (member.getMemberName().equals(approval.getSignId1()) && approval.getSignDate1() == null) {
            approval.setSignDate1(LocalDateTime.now());
            if (approval.getSignId2() != null && !approval.getSignId2().isBlank()) {
                approval.setNextId(approval.getSignId2());
            } else {
                approval.setNextId(null);
                approval.setApprovalStatus("완료");
            }
        }
        // 결재 2
        else if (member.getMemberName().equals(approval.getSignId2()) && approval.getSignDate2() == null) {
            approval.setSignDate2(LocalDateTime.now());
            if (approval.getSignId3() != null && !approval.getSignId3().isBlank()) {
                approval.setNextId(approval.getSignId3());
            } else {
                approval.setNextId(null);
                approval.setApprovalStatus("완료");
            }
        }
        // 결재 3
        else if (member.getMemberName().equals(approval.getSignId3()) && approval.getSignDate3() == null) {
            approval.setSignDate3(LocalDateTime.now());
            if (approval.getSignId4() != null && !approval.getSignId4().isBlank()) {
                approval.setNextId(approval.getSignId4());
            } else {
                approval.setNextId(null);
                approval.setApprovalStatus("완료");
            }
        }
        // 결재 4
        else if (member.getMemberName().equals(approval.getSignId4()) && approval.getSignDate4() == null) {
            approval.setSignDate4(LocalDateTime.now());
            if (approval.getSignId5() != null && !approval.getSignId5().isBlank()) {
                approval.setNextId(approval.getSignId5());
            } else {
                approval.setNextId(null);
                approval.setApprovalStatus("완료");
            }
        }
        // 결재 5 (무조건 완료 처리)
        else if (member.getMemberName().equals(approval.getSignId5()) && approval.getSignDate5() == null) {
            approval.setSignDate5(LocalDateTime.now());
            approval.setNextId(null);
            approval.setApprovalStatus("완료");
        }
        else {
            throw new IllegalArgumentException("이미 결재한 사용자이거나 승인할 수 없는 단계입니다.");
        }

        System.out.println(approval.getApprovalStatus());
        approval.setUpdateId(memberId);
        approval.setUpdateDate(LocalDateTime.now());
        approvalRepository.save(approval);
    }


    // 반려
    @Transactional
    public void doReject(int approvalNo) {
        
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));

        if (!member.getMemberName().equals(approval.getNextId())) {
            throw new IllegalArgumentException("현재 결재권자가 아니면 반려할 수 없습니다.");
        }

        if (member.getMemberName().equals(approval.getSignId1()) && approval.getSignDate1() == null) {

            approval.setSignDate1(LocalDateTime.now());
        } else if (member.getMemberName().equals(approval.getSignId2()) && approval.getSignDate2() == null) {

            approval.setSignDate2(LocalDateTime.now());
        } else if (member.getMemberName().equals(approval.getSignId3()) && approval.getSignDate3() == null) {

            approval.setSignDate3(LocalDateTime.now());
        } else if (member.getMemberName().equals(approval.getSignId4()) && approval.getSignDate4() == null) {

            approval.setSignDate4(LocalDateTime.now());
        } else if (member.getMemberName().equals(approval.getSignId5()) && approval.getSignDate5() == null) {

            approval.setSignDate5(LocalDateTime.now());
        }

        // 문서 상태를 반려로 변경
        approval.setApprovalStatus("반려");
        approval.setNextId(null);
        approval.setUpdateId(memberId);
        approval.setUpdateDate(LocalDateTime.now());

        approvalRepository.save(approval);
    }
}
