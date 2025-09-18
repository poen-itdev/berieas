package com.poen.berieas.back.domain.email.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poen.berieas.back.domain.email.entity.PasswordResetRequest;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long>{
    
    Optional<PasswordResetRequest> findTopByEmailAndCodeAndUsedOrderByCreatedAtDesc(String email, String code, boolean used);
    Optional<PasswordResetRequest> findTopByEmailAndUsedOrderByCreatedAtDesc(String email, boolean used);
}
