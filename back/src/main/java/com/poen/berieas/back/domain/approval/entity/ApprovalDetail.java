package com.poen.berieas.back.domain.approval.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "approval_detail")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDetail {
    
    @Id
    @Column(name = "approval_no")
    private int approvalNo;

    @Column(name = "form_no")
    private int formNo;

    @Column(name = "approval_type")
    private String approvalType;

    @Column(name = "approval_title")
    private String approvalTitle;

    @Column(name = "approval_document")
    private String approvalDocument;

    @Column(name = "approval_attach_path1")
    private String approvalAttachPath1;
    @Column(name = "approval_attach_file1")
    private String approvalAttachFile1;
    @Column(name = "approval_attach_info1")
    private String approvalAttachInfo1;

    @Column(name = "approval_attach_path2")
    private String approvalAttachPath2;
    @Column(name = "approval_attach_file2")
    private String approvalAttachFile2;
    @Column(name = "approval_attach_info2")
    private String approvalAttachInfo2;

    @Lob
    @Column(name = "approval_attach_path3")
    private String approvalAttachPath3;
    @Column(name = "approval_attach_file3")
    private String approvalAttachFile3;
    @Column(name = "approval_attach_info3")
    private String approvalAttachInfo3;

    @Column(name = "approval_attach_path4")
    private String approvalAttachPath4;
    @Column(name = "approval_attach_file4")
    private String approvalAttachFile4;
    @Column(name = "approval_attach_info4")
    private String approvalAttachInfo4;

    @Column(name = "approval_attach_path5")
    private String approvalAttachPath5;
    @Column(name = "approval_attach_file5")
    private String approvalAttachFile5;
    @Column(name = "approval_attach_info5")
    private String approvalAttachInfo5;

    @Column(name = "reg_id")
    private String regId;

    @CreatedDate
    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @Column(name = "update_id")
    private String updateId;
    
    @LastModifiedDate
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Column(name = "drafter_remark")
    private String drafterRemark;

    @Column(name = "signer_attach_path")
    private String signerAttachPath;

    @Column(name = "signer_attach_file")
    private String signerAttachFile;

    @Column(name = "signer_attach_info")
    private String signerAttachInfo;

    @Column(name = "reference_remark")
    private String referenceRemark;

    @Column(name = "reference_attach_path")
    private String referenceAttachPath;

    @Column(name = "reference_attach_file")
    private String referenceAttachFile;

    @Column(name = "reference_attach_info")
    private String referenceAttachInfo;
}
