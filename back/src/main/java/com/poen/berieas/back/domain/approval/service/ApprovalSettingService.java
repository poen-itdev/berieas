package com.poen.berieas.back.domain.approval.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.approval.dto.ApprovalSettingListResponseDto;
import com.poen.berieas.back.domain.approval.dto.ApprovalSettingResponseDto;
import com.poen.berieas.back.domain.approval.dto.FormRequestDto;
import com.poen.berieas.back.domain.approval.entity.ApprovalSetting;
import com.poen.berieas.back.domain.approval.repository.ApprovalSettingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalSettingService {
    
    private final ApprovalSettingRepository approvalSettingRepository;

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

        return new ApprovalSettingResponseDto(formNo, form.getFormType(), form.getFormTitle(), form.getFormDocument());
    }


}
