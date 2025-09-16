package com.poen.berieas.back.domain.email.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "password_reset_request")
@Getter @Setter
@NoArgsConstructor
public class PasswordResetRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "email")
    private String email;

    @Column(name = "code")
    private String code;

    @Column(name = "expire_time")
    private LocalDateTime expireTime;

    @Column(name = "used")
    private boolean used;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
