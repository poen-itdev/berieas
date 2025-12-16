package com.poen.berieas.back.domain.approval.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.approval.dto.ApprovalSettingListResponseDto;
import com.poen.berieas.back.domain.approval.dto.ApprovalSettingResponseDto;
import com.poen.berieas.back.domain.approval.dto.FormRequestDto;
import com.poen.berieas.back.domain.approval.entity.ApprovalSetting;
import com.poen.berieas.back.domain.approval.repository.ApprovalSettingRepository;
import com.poen.berieas.back.domain.member.entity.Member;
import com.poen.berieas.back.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalSettingService {
    
    private final ApprovalSettingRepository approvalSettingRepository;
    private final MemberRepository memberRepository;

    // 양식 리스트
    public List<ApprovalSettingListResponseDto> getForms() {

        List<ApprovalSetting> approvalSettings = approvalSettingRepository.findAll();

        return approvalSettings.stream()
            .map(approvalSetting -> new ApprovalSettingListResponseDto(
                approvalSetting.getFormNo(),
                approvalSetting.getFormType(),
                approvalSetting.getFormTitle()
            )).collect(Collectors.toList());
    }

    // 양식 등록
    @Transactional
    public void addForm(FormRequestDto dto) {
        
        String memberId;
        try {
            memberId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        } catch (Exception e) {
            memberId = "system";
        }

        ApprovalSetting approvalSetting = new ApprovalSetting();
        approvalSetting.setFormType(dto.getFormType());
        approvalSetting.setFormTitle(dto.getFormTitle());
        approvalSetting.setFormDocument(dto.getFormDocument());
        
        // 결재자 설정 (선택사항)
        approvalSetting.setFormSignId1(dto.getSignId1());
        approvalSetting.setFormSignId2(dto.getSignId2());
        approvalSetting.setFormSignId3(dto.getSignId3());
        approvalSetting.setFormSignId4(dto.getSignId4());
        approvalSetting.setFormSignId5(dto.getSignId5());
        
        approvalSetting.setRegId(memberId);
        approvalSetting.setRegDate(LocalDateTime.now());
        approvalSetting.setUpdateId(memberId);
        approvalSetting.setUpdateDate(LocalDateTime.now());

        approvalSettingRepository.save(approvalSetting);
    }

    // 양식 삭제
    @Transactional
    public void deleteForm(int formNo) {

        ApprovalSetting form = approvalSettingRepository.findByFormNo(formNo)
            .orElseThrow(() ->  new IllegalArgumentException("해당 양식을 찾을 수 없습니다."));

        approvalSettingRepository.delete(form);
    }

    // 양식 조회
    public ApprovalSettingResponseDto getForm(int formNo) {

        ApprovalSetting form = approvalSettingRepository.findByFormNo(formNo)
            .orElseThrow(() -> new IllegalArgumentException("해당 양식이 존재하지 않습니다."));

        // 결재자 정보 리스트 생성
        List<ApprovalSettingResponseDto.ApproverInfo> approvers = new ArrayList<>();
        
        String[] signIds = {
            form.getFormSignId1(),
            form.getFormSignId2(),
            form.getFormSignId3(),
            form.getFormSignId4(),
            form.getFormSignId5()
        };
        
        for (String signId : signIds) {
            if (signId != null && !signId.isBlank()) {
                // signId는 memberName이므로 memberName으로 조회
                memberRepository.findByMemberName(signId).ifPresent(member -> {
                    approvers.add(new ApprovalSettingResponseDto.ApproverInfo(
                        member.getMemberId(),
                        member.getMemberName(),
                        member.getMemberDepartment(),
                        member.getMemberPosition()
                    ));
                });
            }
        }

        return new ApprovalSettingResponseDto(
            formNo, 
            form.getFormType(), 
            form.getFormTitle(), 
            form.getFormDocument(),
            approvers
        );
    }


}
