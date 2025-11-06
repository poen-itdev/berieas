package com.poen.berieas.back.domain.approval.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poen.berieas.back.domain.approval.entity.ApprovalSetting;

public interface ApprovalSettingRepository extends JpaRepository<ApprovalSetting, Integer> {
    
    Optional<ApprovalSetting> findByFormNo(int formNo);
}
