package com.poen.berieas.back.domain.approval.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "approval") // 실제 테이블명에 맞게 수정하세요
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalHistory {

    @Id
    @Column(name = "idx")
    private Integer idx;

    @Column(name = "approval_no")
    private Integer approvalNo;

    @Column(name = "approval_start_date")
    private LocalDateTime approvalStartDate;

    @Column(name = "approval_end_date")
    private LocalDateTime approvalEndDate;

    @Column(name = "approval_id")
    private String approvalId;

    @Column(name = "approval_name")
    private String approvalName;

    @Column(name = "approval_department")
    private String approvalDepartment;

    @Column(name = "approval_position")
    private String approvalPosition;

    @Column(name = "approval_status")
    private String approvalStatus;

    @Column(name = "approval_detail_link")
    private String approvalDetailLink;

    @Column(name = "sign_id1")
    private String signId1;

    @Column(name = "sign_date1")
    private LocalDateTime signDate1;

    @Column(name = "sign_remark1")
    private String signRemark1;

    @Column(name = "sign_etc1")
    private String signEtc1;

    @Column(name = "sign_id2")
    private String signId2;

    @Column(name = "sign_date2")
    private LocalDateTime signDate2;

    @Column(name = "sign_remark2")
    private String signRemark2;

    @Column(name = "sign_etc2")
    private String signEtc2;

    @Column(name = "sign_id3")
    private String signId3;

    @Column(name = "sign_date3")
    private LocalDateTime signDate3;

    @Column(name = "sign_remark3")
    private String signRemark3;

    @Column(name = "sign_etc3")
    private String signEtc3;

    @Column(name = "sign_id4")
    private String signId4;

    @Column(name = "sign_date4")
    private LocalDateTime signDate4;

    @Column(name = "sign_remark4")
    private String signRemark4;

    @Column(name = "sign_etc4")
    private String signEtc4;

    @Column(name = "sign_id5")
    private String signId5;

    @Column(name = "sign_date5")
    private LocalDateTime signDate5;

    @Column(name = "sign_remark5")
    private String signRemark5;

    @Column(name = "sign_etc5")
    private String signEtc5;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "next_id")
    private String nextId;

    @Column(name = "reg_id")
    private String regId;

    @Column(name = "reg_date")
    private LocalDateTime regDate;
}
