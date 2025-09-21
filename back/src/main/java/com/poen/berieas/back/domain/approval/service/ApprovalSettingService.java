package com.poen.berieas.back.domain.approval.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.approval.dto.ApprovalSettingResponseDto;
import com.poen.berieas.back.domain.approval.entity.ApprovalSetting;
import com.poen.berieas.back.domain.approval.repository.ApprovalSettingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalSettingService {
    
    private final ApprovalSettingRepository approvalSettingRepository;

    // 양식 리스트
    public List<ApprovalSettingResponseDto> getForms() {

        List<ApprovalSetting> approvalSettings = approvalSettingRepository.findAll();

        return approvalSettings.stream()
            .map(approvalSetting -> new ApprovalSettingResponseDto(
                approvalSetting.getFormNo(),
                approvalSetting.getFormType(),
                approvalSetting.getFormTitle()
            )).collect(Collectors.toList());
    }

    // 양식 삭제
    @Transactional
    public void deleteForm(int formNo) {

        ApprovalSetting form = approvalSettingRepository.findByFormNo(formNo)
            .orElseThrow(() ->  new IllegalArgumentException("해당 양식을 찾을 수 없습니다."));

        approvalSettingRepository.delete(form);
    }
}
