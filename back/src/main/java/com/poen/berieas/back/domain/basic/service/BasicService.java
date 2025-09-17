package com.poen.berieas.back.domain.basic.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poen.berieas.back.domain.basic.dto.DepartmentResponseDto;
import com.poen.berieas.back.domain.basic.dto.TeamResponseDto;
import com.poen.berieas.back.domain.basic.entity.Basic;
import com.poen.berieas.back.domain.basic.repository.BasicRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BasicService {
    
    private final BasicRepository basicRepository;

    // 부서 리스트 
    public List<DepartmentResponseDto> getDepartments() {

        List<Basic> departments = basicRepository.getDepartments();
        
        return departments.stream()
            .map(department -> new DepartmentResponseDto(
                    department.getCode(), 
                    department.getName())).collect(Collectors.toList()
            );
    }

    // 팀 리스트
    // public List<TeamResponseDto> getTeams(String codeKey) {

    //     List<Basic> teams = basicRepository.getTeams(codeKey);

    //     System.out.println(teams);
        
    //     return teams.stream()
    //         .map(team -> new TeamResponseDto(
    //             team.getName()
    //         )).collect(Collectors.toList());
    // }
}
