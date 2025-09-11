package com.poen.berieas.back.domain.approval.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "approval_setting")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalSetting {
    
    @Id
    @Column(name = "form_no")
    private String formNo;

    @Column(name = "form_type")
    private String formType;

    @Column(name = "form_title")
    private String formTitle;

    @Column(name = "form_document")
    private String formDocument;

    @Column(name = "form_sign_id1")
    private String formSignId1;

    @Column(name = "form_sign_id2")
    private String formSignId2;

    @Column(name = "form_sign_id3")
    private String formSignId3;

    @Column(name = "form_sign_id4")
    private String formSignId4;

    @Column(name = "form_sign_id5")
    private String formSignId5;

    @Column(name = "form_reference_id")
    private String formReferenceId;

    @Column(name = "reg_id")
    private String regId;

    @CreatedDate
    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @LastModifiedDate
    @Column(name = "update_id")
    private String updateId;

    @Column(name = "update_date")
    private LocalDateTime updateDate;
    
}
