package com.poen.berieas.back.domain.basic.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "basic") // 실제 테이블명에 맞게 수정하세요
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Basic {
    
    @Id
    @Column(name = "idx")
    private Integer idx;

    @Column(name = "type")
    private String type;

    @Column(name = "code")
    private String code;

    @Column(name = "name")
    private String name;

    @Column(name = "code_key")
    private String codeKey;

    @Column(name = "code_value")
    private String codeValue;

    @Column(name = "description")
    private String description;

    @Column(name = "use_yn")
    private String useYn;

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
}
