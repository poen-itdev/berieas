package com.poen.berieas.back.domain.approval.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
import com.poen.berieas.back.util.MessageUtil;

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
    private final MessageUtil messageUtil;
    
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

        if("반려".equals(approval.getApprovalStatus())) {
            Map<LocalDateTime, String> signerMap = new HashMap<>();

            if (approval.getSignDate1() != null) signerMap.put(approval.getSignDate1(), approval.getSignId1());
            if (approval.getSignDate2() != null) signerMap.put(approval.getSignDate2(), approval.getSignId2());
            if (approval.getSignDate3() != null) signerMap.put(approval.getSignDate3(), approval.getSignId3());
            if (approval.getSignDate4() != null) signerMap.put(approval.getSignDate4(), approval.getSignId4());
            if (approval.getSignDate5() != null) signerMap.put(approval.getSignDate5(), approval.getSignId5());

            return signerMap.entrySet().stream()
                    .max(Map.Entry.comparingByKey()) // 가장 최근 결재자 찾기
                    .map(Map.Entry::getValue)
                    .orElse(" ");
        }

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
        
        Member member = memberRepository.findByMemberId(memberId).orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

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
   public Page<ProgressListResponseDto> getAllApprovals(
        Pageable pageable, LocalDate from, LocalDate to, String keyword) {

    String loginId = SecurityContextHolder.getContext().getAuthentication().getName();
Member me = memberRepository.findByMemberId(loginId)
        .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

Page<Approval> approvals =
        approvalRepository.findAllForOverallList(me.getMemberId(), me.getMemberName(), pageable);


    // ✅ 혹시라도 이상 케이스가 있으면 여기서 한 번 더 차단 (기안중은 작성자만)
    List<ProgressListResponseDto> filtered = approvals.getContent().stream()
            .filter(a -> !"기안중".equals(a.getApprovalStatus()) || Objects.equals(a.getRegId(), me.getMemberId()))
            // (기존 날짜/키워드 필터 로직 이어서)
            .filter(a -> {
                if (from != null && a.getRegDate().toLocalDate().isBefore(from)) return false;
                if (to != null && a.getRegDate().toLocalDate().isAfter(to)) return false;
                if (keyword == null || keyword.isBlank()) return true;

                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                String title = detail != null ? String.valueOf(detail.getApprovalTitle()) : "";
                String type = detail != null ? String.valueOf(detail.getApprovalType()) : "";
                String drafter = a.getApprovalName() != null ? a.getApprovalName() : "";
                String department = a.getApprovalDepartment() != null ? a.getApprovalDepartment() : "";
                String signerIds = String.join(",",
                        Arrays.asList(a.getSignId1(), a.getSignId2(), a.getSignId3(), a.getSignId4(), a.getSignId5())
                                .stream().filter(Objects::nonNull).toList());
                String lower = keyword.toLowerCase();

                return title.toLowerCase().contains(lower)
                        || type.toLowerCase().contains(lower)
                        || drafter.toLowerCase().contains(lower)
                        || department.toLowerCase().contains(lower)
                        || signerIds.toLowerCase().contains(lower)
                        || (a.getApprovalStatus() != null && a.getApprovalStatus().toLowerCase().contains(lower));
            })
            .map(a -> {
                ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                String currentSigner = getCurrentSigner(a);
                return new ProgressListResponseDto(
                        a.getApprovalNo(),
                        a.getRegDate(),
                        detail != null ? detail.getApprovalTitle() : null,
                        detail != null ? detail.getApprovalType() : null,
                        a.getApprovalDepartment(),
                        a.getApprovalName(),
                        currentSigner,
                        a.getApprovalStatus()
                );
            })
            .toList();

    // 서버에서 받은 전체 개수 사용 (필터링 전 개수이지만, 실제로는 필터링 후에도 비슷할 것으로 예상)
    return new PageImpl<>(filtered, pageable, approvals.getTotalElements());
}


    // 진행목록(진행중) - 내가 기안한 문서 + 결재할 문서
    public Page<ProgressListResponseDto> getInProgressApprovals(Pageable pageable, LocalDate from, LocalDate to, String keyword) {

        // 로그인한 유저의 memberId 
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member me = memberRepository.findByMemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

        Page<Approval> approvals = approvalRepository.findInprogressApprovals(me.getMemberId(), me.getMemberName(), pageable);

        List<ProgressListResponseDto> filtered = approvals.getContent().stream()
                .filter(a -> {
                    // 날짜 필터
                    if (from != null && a.getRegDate().toLocalDate().isBefore(from)) return false;
                    if (to != null && a.getRegDate().toLocalDate().isAfter(to)) return false;

                    // 키워드 필터
                    if (keyword != null && !keyword.isBlank()) {
                        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                        String title = detail != null ? detail.getApprovalTitle() : "";
                        String type = detail != null ? detail.getApprovalType() : "";
                        String drafter = a.getApprovalName() != null ? a.getApprovalName() : "";
                        String department = a.getApprovalDepartment() != null ? a.getApprovalDepartment() : "";
                        String signerIds = String.join(",",
                                Arrays.asList(a.getSignId1(), a.getSignId2(), a.getSignId3(), a.getSignId4(), a.getSignId5())
                                        .stream().filter(Objects::nonNull).toList()
                        );
                        String lowerKeyword = keyword.toLowerCase();
                        boolean matchKeyword = title.toLowerCase().contains(lowerKeyword)
                                || type.toLowerCase().contains(lowerKeyword)
                                || drafter.toLowerCase().contains(lowerKeyword)
                                || department.toLowerCase().contains(lowerKeyword)
                                || signerIds.toLowerCase().contains(lowerKeyword)
                                || (a.getApprovalStatus() != null && a.getApprovalStatus().toLowerCase().contains(lowerKeyword));

                        if (!matchKeyword) return false;
                    }

                    return true;
                })
                .map(a -> {
                    ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                    String currentSigner = getCurrentSigner(a);
                    return new ProgressListResponseDto(
                            a.getApprovalNo(),
                            a.getRegDate(),
                            detail != null ? detail.getApprovalTitle() : null,
                            detail != null ? detail.getApprovalType() : null,
                            a.getApprovalDepartment(),
                            a.getApprovalName(),
                            currentSigner,
                            a.getApprovalStatus()
                    );
                })
                .toList();

        return new PageImpl<>(filtered, pageable, approvals.getTotalElements());
    }

    // 진행목록(기안중)
    public Page<ProgressListResponseDto> getTemporarySavedApprovals(Pageable pageable, LocalDate from, LocalDate to, String keyword) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

        Page<Approval> approvals = approvalRepository.findTemporarySavedApprovals(member.getMemberId(), pageable);

        List<ProgressListResponseDto> filtered = approvals.getContent().stream()
                .filter(a -> {

                    // 날짜 필터
                    if (from != null && a.getRegDate().toLocalDate().isBefore(from)) return false;
                    if (to != null && a.getRegDate().toLocalDate().isAfter(to)) return false;

                    // 키워드 필터
                    if (keyword != null && !keyword.isBlank()) {
                        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                        String title = detail != null ? detail.getApprovalTitle() : "";
                        String type = detail != null ? detail.getApprovalType() : "";
                        String drafter = a.getApprovalName() != null ? a.getApprovalName() : "";
                        String department = a.getApprovalDepartment() != null ? a.getApprovalDepartment() : "";
                        String signerIds = String.join(",",
                                Arrays.asList(a.getSignId1(), a.getSignId2(), a.getSignId3(), a.getSignId4(), a.getSignId5())
                                        .stream().filter(Objects::nonNull).toList()
                        );
                        String lowerKeyword = keyword.toLowerCase();
                        boolean matchKeyword = title.toLowerCase().contains(lowerKeyword)
                                || type.toLowerCase().contains(lowerKeyword)
                                || drafter.toLowerCase().contains(lowerKeyword)
                                || department.toLowerCase().contains(lowerKeyword)
                                || signerIds.toLowerCase().contains(lowerKeyword)
                                || (a.getApprovalStatus() != null && a.getApprovalStatus().toLowerCase().contains(lowerKeyword));

                        if (!matchKeyword) return false;
                    }

                    return true;
                })
                .map(a -> {
                    ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                    String currentSigner = getCurrentSigner(a);
                    return new ProgressListResponseDto(
                            a.getApprovalNo(),
                            a.getRegDate(),
                            detail != null ? detail.getApprovalTitle() : null,
                            detail != null ? detail.getApprovalType() : null,
                            a.getApprovalDepartment(),
                            a.getApprovalName(),
                            currentSigner,
                            a.getApprovalStatus()
                    );
                })
                .toList();

        return new PageImpl<>(filtered, pageable, approvals.getTotalElements());
    }

    // 진행목록(반려)
   public Page<ProgressListResponseDto> getReturnedApprovals(
    Pageable pageable, LocalDate from, LocalDate to, String keyword) {

  String loginId = SecurityContextHolder.getContext().getAuthentication().getName();
  Member member = memberRepository.findByMemberId(loginId)
      .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

  // ✅ 반려 전용 쿼리 호출 (전체 쿼리 호출 금지!)
  Page<Approval> approvals =
      approvalRepository.findReturnedApprovals(member.getMemberId(), member.getMemberName(), pageable);

  List<ProgressListResponseDto> filtered = approvals.getContent().stream()
      // 안전망: 혹시라도 잘못 내려온 데이터 걸러주기
      .filter(a -> "반려".equals(a.getApprovalStatus()))
      // (기존 날짜/키워드 필터 & DTO 매핑 그대로)
      .map(a -> {
        ApprovalDetail d = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
        String currentSigner = getCurrentSigner(a);
        return new ProgressListResponseDto(
            a.getApprovalNo(),
            a.getRegDate(),
            d != null ? d.getApprovalTitle() : null,
            d != null ? d.getApprovalType()  : null,
            a.getApprovalDepartment(),
            a.getApprovalName(),
            currentSigner,
            a.getApprovalStatus()
        );
      })
      .toList();

  // 레포에서 이미 상태로 필터했으면 count는 approvals.getTotalElements() 유지해도 됨
  return new PageImpl<>(filtered, pageable, approvals.getTotalElements());
}


    // 진행목록(완료)
    public Page<ProgressListResponseDto> getCompletedApprovals(Pageable pageable, LocalDate from, LocalDate to, String keyword) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

        Page<Approval> approvals = approvalRepository.findCompletedApprovals(memberId, member.getMemberName(), pageable);
        
        List<ProgressListResponseDto> filtered = approvals.getContent().stream()
                .filter(a -> {

                    // 날짜 필터
                    if (from != null && a.getRegDate().toLocalDate().isBefore(from)) return false;
                    if (to != null && a.getRegDate().toLocalDate().isAfter(to)) return false;

                    // 키워드 필터
                    if (keyword != null && !keyword.isBlank()) {
                        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                        String title = detail != null ? detail.getApprovalTitle() : "";
                        String type = detail != null ? detail.getApprovalType() : "";
                        String drafter = a.getApprovalName() != null ? a.getApprovalName() : "";
                        String department = a.getApprovalDepartment() != null ? a.getApprovalDepartment() : "";
                        String signerIds = String.join(",",
                                Arrays.asList(a.getSignId1(), a.getSignId2(), a.getSignId3(), a.getSignId4(), a.getSignId5())
                                        .stream().filter(Objects::nonNull).toList()
                        );
                        String lowerKeyword = keyword.toLowerCase();
                        boolean matchKeyword = title.toLowerCase().contains(lowerKeyword)
                                || type.toLowerCase().contains(lowerKeyword)
                                || drafter.toLowerCase().contains(lowerKeyword)
                                || department.toLowerCase().contains(lowerKeyword)
                                || signerIds.toLowerCase().contains(lowerKeyword)
                                || (a.getApprovalStatus() != null && a.getApprovalStatus().toLowerCase().contains(lowerKeyword));

                        if (!matchKeyword) return false;
                    }

                    return true;
                })
                .map(a -> {
                    ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(a.getApprovalNo()).orElse(null);
                    String currentSigner = getCurrentSigner(a);
                    return new ProgressListResponseDto(
                            a.getApprovalNo(),
                            a.getRegDate(),
                            detail != null ? detail.getApprovalTitle() : null,
                            detail != null ? detail.getApprovalType() : null,
                            a.getApprovalDepartment(),
                            a.getApprovalName(),
                            currentSigner,
                            a.getApprovalStatus()
                    );
                })
                .toList();

        return new PageImpl<>(filtered, pageable, approvals.getTotalElements());
    }

    // 첨언
    @Transactional
    public void addComment(int approvalNo, CommentRequestDto dto, List<MultipartFile> files) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("[첨언] 로그인 memberId: " + memberId);

        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));
        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.not.found")));
        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.document.not.exists")));

        boolean isDrafter = memberId.equals(approval.getApprovalId()); // 기안자
        System.out.println("[첨언] isDrafter: " + isDrafter + " (memberId=" + memberId + ", approvalId=" + approval.getApprovalId() + ")");
        
        // 결재자 확인 - 결재라인 전체(signId1~5) 확인
        String memberName = member.getMemberName();
        System.out.println("[첨언] memberName: " + memberName);
        System.out.println("[첨언] signId1~5: " + approval.getSignId1() + ", " + approval.getSignId2() + ", " + approval.getSignId3() + ", " + approval.getSignId4() + ", " + approval.getSignId5());
        
        boolean isSigner = memberName.equals(approval.getSignId1()) ||
                          memberName.equals(approval.getSignId2()) ||
                          memberName.equals(approval.getSignId3()) ||
                          memberName.equals(approval.getSignId4()) ||
                          memberName.equals(approval.getSignId5());
        System.out.println("[첨언] isSigner: " + isSigner);
        
        // 참조자 확인 - referenceId는 쉼표로 구분된 여러 사람일 수 있음
        boolean referencer = false;
        if (approval.getReferenceId() != null && !approval.getReferenceId().isEmpty()) {
            String[] referenceIds = approval.getReferenceId().split(",");
            for (String refId : referenceIds) {
                if (memberName.equals(refId.trim())) {
                    referencer = true;
                    break;
                }
            }
        }
        System.out.println("[첨언] referencer: " + referencer);

        if (!isDrafter && !isSigner && !referencer) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.comment.no.permission"));
        }

        // ----- 댓글 저장 -----
        System.out.println("[첨언] 댓글 저장 시작 - comment: " + dto.getComment());
        if(isSigner) {
            System.out.println("[첨언] 결재자로 댓글 저장");
            if (memberName.equals(approval.getSignId1())) { approval.setSignRemark1(dto.getComment()); System.out.println("[첨언] signRemark1에 저장"); }
            else if (memberName.equals(approval.getSignId2())) { approval.setSignRemark2(dto.getComment()); System.out.println("[첨언] signRemark2에 저장"); }
            else if (memberName.equals(approval.getSignId3())) { approval.setSignRemark3(dto.getComment()); System.out.println("[첨언] signRemark3에 저장"); }
            else if (memberName.equals(approval.getSignId4())) { approval.setSignRemark4(dto.getComment()); System.out.println("[첨언] signRemark4에 저장"); }
            else if (memberName.equals(approval.getSignId5())) { approval.setSignRemark5(dto.getComment()); System.out.println("[첨언] signRemark5에 저장"); }
            else throw new IllegalArgumentException(messageUtil.getMessage("error.approval.signer.mismatch"));

        } else if (isDrafter) {
            System.out.println("[첨언] 기안자로 댓글 저장 - drafterRemark");
            detail.setDrafterRemark(dto.getComment());
        } else if (referencer) {
            System.out.println("[첨언] 참조자로 댓글 저장 - referenceRemark");
            detail.setReferenceRemark(dto.getComment());
        }


        // ===== 파일 업로드 =====
        if (files != null && !files.isEmpty()) {

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                try {
                    // 파일명 중복 방지
                    String savedFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path savePath = Paths.get(uploadDir, savedFileName);
                    Files.createDirectories(savePath.getParent());
                    file.transferTo(savePath.toFile());

                    String info = isDrafter ? "기안자첨언" : (isSigner ? memberName + " (결재자)" : memberName + " (참조자)");

                    // ===== 기안자 첨언 =====
                    if (isDrafter) {
                        List<String> attachFiles = new ArrayList<>(Arrays.asList(
                                detail.getApprovalAttachFile1(),
                                detail.getApprovalAttachFile2(),
                                detail.getApprovalAttachFile3(),
                                detail.getApprovalAttachFile4(),
                                detail.getApprovalAttachFile5()
                        ));

                        // 비어있는 첫 번째 슬롯 탐색
                        int slotIndex = -1;
                        for (int j = 0; j < attachFiles.size(); j++) {
                            if (attachFiles.get(j) == null) {
                                slotIndex = j;
                                break;
                            }
                        }

                        // 슬롯이 없으면 업로드 불가
                        if (slotIndex == -1) {
                            throw new RuntimeException(messageUtil.getMessage("error.approval.file.max.exceeded"));
                        }

                        switch (slotIndex) {
                            case 0 -> { detail.setApprovalAttachFile1(savedFileName); detail.setApprovalAttachPath1(uploadDir); detail.setApprovalAttachInfo1(info); }
                            case 1 -> { detail.setApprovalAttachFile2(savedFileName); detail.setApprovalAttachPath2(uploadDir); detail.setApprovalAttachInfo2(info); }
                            case 2 -> { detail.setApprovalAttachFile3(savedFileName); detail.setApprovalAttachPath3(uploadDir); detail.setApprovalAttachInfo3(info); }
                            case 3 -> { detail.setApprovalAttachFile4(savedFileName); detail.setApprovalAttachPath4(uploadDir); detail.setApprovalAttachInfo4(info); }
                            case 4 -> { detail.setApprovalAttachFile5(savedFileName); detail.setApprovalAttachPath5(uploadDir); detail.setApprovalAttachInfo5(info); }
                        }

                    }
                    // ===== 결재자 첨언 =====
                    else if (isSigner) {

                        // 이미 첨부파일이 존재하면 예외
                        if (detail.getSignerAttachFile() != null) {
                            throw new RuntimeException(messageUtil.getMessage("error.approval.file.signer.limit"));
                        }

                        detail.setSignerAttachFile(savedFileName);
                        detail.setSignerAttachPath(uploadDir);
                        detail.setSignerAttachInfo(info);
                    }
                    // ===== 참조자 첨언 =====
                    else if (referencer) {

                        if (detail.getReferenceAttachFile() != null) {
                            throw new RuntimeException(messageUtil.getMessage("error.approval.file.reference.limit"));
                        }

                        detail.setReferenceAttachFile(savedFileName);
                        detail.setReferenceAttachPath(uploadDir);
                        detail.setReferenceAttachInfo(info);
                    }

                } catch (IOException e) {
                    throw new RuntimeException(messageUtil.getMessage("error.file.save.failed") + ": " + file.getOriginalFilename(), e);
                }
            }
        }


        approval.setUpdateId(memberId);
        approval.setUpdateDate(LocalDateTime.now());
        detail.setUpdateId(memberId);
        detail.setUpdateDate(LocalDateTime.now());

        System.out.println("[첨언] DB 저장 시작");
        approvalRepository.save(approval);
        System.out.println("[첨언] approval 테이블 저장 완료");
        approvalDetailRepository.save(detail);
        System.out.println("[첨언] approval_detail 테이블 저장 완료");
    }

    // 첨언 수정
    @Transactional
    public void updateComment(int approvalNo, CommentRequestDto dto) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));
        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));
        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("문서가 존재하지 않습니다."));

        boolean isDrafter = memberId.equals(approval.getApprovalId());
        String memberName = member.getMemberName();
        
        boolean isSigner = memberName.equals(approval.getSignId1()) ||
                          memberName.equals(approval.getSignId2()) ||
                          memberName.equals(approval.getSignId3()) ||
                          memberName.equals(approval.getSignId4()) ||
                          memberName.equals(approval.getSignId5());
        
        boolean referencer = false;
        if (approval.getReferenceId() != null && !approval.getReferenceId().isEmpty()) {
            String[] referenceIds = approval.getReferenceId().split(",");
            for (String refId : referenceIds) {
                if (memberName.equals(refId.trim())) {
                    referencer = true;
                    break;
                }
            }
        }

        if (!isDrafter && !isSigner && !referencer) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.comment.no.permission"));
        }

        // 댓글 수정
        if(isSigner) {
            if (memberName.equals(approval.getSignId1())) approval.setSignRemark1(dto.getComment());
            else if (memberName.equals(approval.getSignId2())) approval.setSignRemark2(dto.getComment());
            else if (memberName.equals(approval.getSignId3())) approval.setSignRemark3(dto.getComment());
            else if (memberName.equals(approval.getSignId4())) approval.setSignRemark4(dto.getComment());
            else if (memberName.equals(approval.getSignId5())) approval.setSignRemark5(dto.getComment());
            else throw new IllegalArgumentException(messageUtil.getMessage("error.approval.signer.mismatch"));
        } else if (isDrafter) {
            detail.setDrafterRemark(dto.getComment());
        } else if (referencer) {
            detail.setReferenceRemark(dto.getComment());
        }

        approval.setUpdateId(memberId);
        approval.setUpdateDate(LocalDateTime.now());
        detail.setUpdateId(memberId);
        detail.setUpdateDate(LocalDateTime.now());

        approvalRepository.save(approval);
        approvalDetailRepository.save(detail);
    }

    // 첨언 삭제
    @Transactional
    public void deleteComment(int approvalNo) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));
        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 문서를 찾을 수 없습니다."));
        ApprovalDetail detail = approvalDetailRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException("문서가 존재하지 않습니다."));

        boolean isDrafter = memberId.equals(approval.getApprovalId());
        String memberName = member.getMemberName();
        
        boolean isSigner = memberName.equals(approval.getSignId1()) ||
                          memberName.equals(approval.getSignId2()) ||
                          memberName.equals(approval.getSignId3()) ||
                          memberName.equals(approval.getSignId4()) ||
                          memberName.equals(approval.getSignId5());
        
        boolean referencer = false;
        if (approval.getReferenceId() != null && !approval.getReferenceId().isEmpty()) {
            String[] referenceIds = approval.getReferenceId().split(",");
            for (String refId : referenceIds) {
                if (memberName.equals(refId.trim())) {
                    referencer = true;
                    break;
                }
            }
        }

        if (!isDrafter && !isSigner && !referencer) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.comment.no.permission"));
        }

        // 댓글 삭제 (null로 설정)
        if(isSigner) {
            if (memberName.equals(approval.getSignId1())) approval.setSignRemark1(null);
            else if (memberName.equals(approval.getSignId2())) approval.setSignRemark2(null);
            else if (memberName.equals(approval.getSignId3())) approval.setSignRemark3(null);
            else if (memberName.equals(approval.getSignId4())) approval.setSignRemark4(null);
            else if (memberName.equals(approval.getSignId5())) approval.setSignRemark5(null);
            else throw new IllegalArgumentException(messageUtil.getMessage("error.approval.signer.mismatch"));
            
            // 결재자 첨부파일도 삭제
            detail.setSignerAttachFile(null);
            detail.setSignerAttachPath(null);
            detail.setSignerAttachInfo(null);
        } else if (isDrafter) {
            detail.setDrafterRemark(null);
        } else if (referencer) {
            detail.setReferenceRemark(null);
            // 참조자 첨부파일도 삭제
            detail.setReferenceAttachFile(null);
            detail.setReferenceAttachPath(null);
            detail.setReferenceAttachInfo(null);
        }

        approval.setUpdateId(memberId);
        approval.setUpdateDate(LocalDateTime.now());
        detail.setUpdateId(memberId);
        detail.setUpdateDate(LocalDateTime.now());

        approvalRepository.save(approval);
        approvalDetailRepository.save(detail);
    }

    // 승인
    @Transactional
    public void doApproval(int approvalNo) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.not.found")));

        if (!member.getMemberName().equals(approval.getNextId())) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.not.current.signer"));
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
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.already.approved"));
        }

        approval.setUpdateId(memberId);
        approval.setUpdateDate(LocalDateTime.now());
        approvalRepository.save(approval);
    }


    // 반려
    @Transactional
    public void doReject(int approvalNo) {
        
        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();
        Member member = memberRepository.findByMemberId(memberId)
            .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.member.not.found")));

        Approval approval = approvalRepository.findByApprovalNo(approvalNo)
                .orElseThrow(() -> new IllegalArgumentException(messageUtil.getMessage("error.approval.not.found")));

        if (!member.getMemberName().equals(approval.getNextId())) {
            throw new IllegalArgumentException(messageUtil.getMessage("error.approval.not.current.signer"));
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
