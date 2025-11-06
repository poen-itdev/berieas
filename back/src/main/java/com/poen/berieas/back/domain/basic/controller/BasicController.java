package com.poen.berieas.back.domain.basic.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.poen.berieas.back.domain.basic.dto.BasicRequestDto;
import com.poen.berieas.back.domain.basic.dto.BasicResponseDto;
import com.poen.berieas.back.domain.basic.service.BasicService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BasicController {
    
    private final BasicService basicService;

    // 부서 조회 
    @GetMapping(value = "/departments")
    public ResponseEntity<List<BasicResponseDto>> getDepartmentsApi() {
        
        List<BasicResponseDto> departments = basicService.getDepartments();
        return ResponseEntity.ok(departments);
    }

    // 부서 추가
    @PostMapping(value = "/addDepartment", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> addDepartmentApi(@RequestBody BasicRequestDto dto) {

        basicService.addDepartment(dto);
        return ResponseEntity.ok("부서 추가 성공");
    }

    // 부서 삭제
    @DeleteMapping(value = "/deleteDepartment/{idx}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteDepartmentApi(@PathVariable int idx) {

        basicService.deleteDepartment(idx);
        return ResponseEntity.ok("해당 부서가 삭제되었습니다.");
    }

    // 부서 수정
    @PutMapping(value = "/updateDepartment/{idx}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateDepartmentApi(@PathVariable int idx, @RequestBody BasicRequestDto dto) {

        basicService.updateDepartment(idx, dto);
        return ResponseEntity.ok("해당 부서가 수정되었습니다.");
    }

    // 직급 리스트
    @GetMapping(value = "/positions")
    public ResponseEntity<List<BasicResponseDto>> getPositionsApi() {

        List<BasicResponseDto> positions = basicService.getPositions();
        return ResponseEntity.ok(positions);
    }

    // 직급 추가
    @PostMapping(value = "/addPosition", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> addPositionApi(@RequestBody BasicRequestDto dto) {

        basicService.addPosition(dto);
        return ResponseEntity.ok("직급 추가 성공");
    }

    // 직급 삭제 
    @DeleteMapping(value = "/deletePosition/{idx}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deletePosition(@PathVariable int idx) {

        basicService.deletePosition(idx);
        return ResponseEntity.ok("해당 직급이 삭제되었습니다.");
    }

    // 직급 수정
    @PutMapping(value = "/updatePosition/{idx}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updatePositionApi(@PathVariable int idx, @RequestBody BasicRequestDto dto) {

        basicService.updatePosition(idx, dto);
        return ResponseEntity.ok("해당 직급이 수정되었습니다.");
    }
}
