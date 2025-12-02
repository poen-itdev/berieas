package com.poen.berieas.back.domain.basic.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.poen.berieas.back.domain.basic.entity.Basic;

public interface BasicRepository extends JpaRepository<Basic, Integer>{
    
    // 부서 리스트
    @Query("select b from Basic b where b.type = 'department'")
    List<Basic> getDepartments();

    // 직급 리스트
    @Query("select b from Basic b where b.type = 'position'")
    List<Basic> getPositions();

    Optional<Basic> findByIdx(int idx);

    // codeKey로 값 조회 (예: nation)
    Optional<Basic> findByTypeAndName(String type, String name);
}
