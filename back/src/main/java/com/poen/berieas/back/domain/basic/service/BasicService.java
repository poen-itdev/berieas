package com.poen.berieas.back.domain.basic.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.basic.dto.BasicRequestDto;
import com.poen.berieas.back.domain.basic.dto.BasicResponseDto;
import com.poen.berieas.back.domain.basic.entity.Basic;
import com.poen.berieas.back.domain.basic.repository.BasicRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BasicService {
    
    private final BasicRepository basicRepository;

    // 부서 리스트 
    public List<BasicResponseDto> getDepartments() {

        List<Basic> departments = basicRepository.getDepartments();
        
        return departments.stream()
            .map(department -> new BasicResponseDto(
                    department.getIdx(),
                    department.getName(),
                    department.getCodeKey(),
                    department.getCodeValue()))
            .collect(Collectors.toList());
    }

    // 부서 추가
    @Transactional
    public void addDepartment(BasicRequestDto dto) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Basic department = new Basic();
        department.setType("department");
        department.setCode("");
        department.setName(dto.getName());
        department.setRegId(memberId);
        department.setRegDate(LocalDateTime.now());

        basicRepository.save(department);
    }

    // 부서 삭제
    @Transactional
    public void deleteDepartment(int idx) {

        Basic department = basicRepository.findByIdx(idx).orElseThrow(() -> new IllegalArgumentException("해당 부서가 없습니다."));

        basicRepository.delete(department);
    }

    // 부서 수정
    @Transactional
    public void updateDepartment(int idx, BasicRequestDto dto) {

        Basic department = basicRepository.findByIdx(idx).orElseThrow(() -> new IllegalArgumentException("해당 부서가 없습니다."));

        department.setName(dto.getName());
        basicRepository.save(department);
    }

    // 직급 리스트 
    public List<BasicResponseDto> getPositions() {

        List<Basic> positions = basicRepository.getPositions();

        return positions.stream()
            .map(position -> new BasicResponseDto(
                position.getIdx(),
                position.getName(),
                position.getCodeKey(),
                position.getCodeValue()))
            .collect(Collectors.toList());
    }

    // 직급 추가
    @Transactional
    public void addPosition(BasicRequestDto dto) {

        String memberId = SecurityContextHolder.getContext().getAuthentication().getName();

        Basic position = new Basic();
        position.setType("position");
        position.setCode("");
        position.setName(dto.getName());
        position.setRegId(memberId);
        position.setRegDate(LocalDateTime.now());

        basicRepository.save(position);
    }

    // 직급 삭제
    @Transactional
    public void deletePosition(int idx) {

        Basic postition = basicRepository.findByIdx(idx).orElseThrow(() -> new IllegalArgumentException("해당 부서가 없습니다."));

        basicRepository.delete(postition);
    }

    // 직급 수정
    @Transactional
    public void updatePosition(int idx, BasicRequestDto dto) {

        Basic position = basicRepository.findByIdx(idx).orElseThrow(() -> new IllegalArgumentException("해당 직급이 없습니다."));

        position.setName(dto.getName());
        basicRepository.save(position);
    }
}
