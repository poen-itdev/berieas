package com.poen.berieas.back.domain.basic.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.basic.dto.CodeKeyRequestDto;
import com.poen.berieas.back.domain.basic.dto.DepartmentResponseDto;
import com.poen.berieas.back.domain.basic.dto.TeamResponseDto;
import com.poen.berieas.back.domain.basic.service.BasicService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BasicController {
    
    private final BasicService basicService;

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponseDto>> getDepartmentsApi() {
        
        List<DepartmentResponseDto> departments = basicService.getDepartments();

        return ResponseEntity.ok(departments);
    }

    @GetMapping(value = "/teams", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TeamResponseDto>> getTeamsApi(@RequestBody CodeKeyRequestDto dto) {
        
        List<TeamResponseDto> teams = basicService.getTeams(dto.getCodeKey());

        return ResponseEntity.ok(teams);
    }
}
