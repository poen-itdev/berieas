package com.poen.berieas.back.domain.basic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.poen.berieas.back.domain.basic.entity.Basic;

public interface BasicRepository extends JpaRepository<Basic, Integer>{
    
    // 부서 리스트
    @Query("select b from Basic b where b.type = 'department'")
    List<Basic> getDepartments();

    // 팀 리스트 
    // @Query("select b from Basic b where b.codeKey = :codeKey")
    // List<Basic> getTeams(String codeKey);
}
