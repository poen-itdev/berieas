package com.poen.berieas.back.domain.email.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poen.berieas.back.domain.email.entity.PasswordResetRequest;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long>{
    
    Optional<PasswordResetRequest> findTopByCodeAndUsedOrderByCreatedAtDesc(String code, boolean used);

}
