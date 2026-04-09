package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.ReportDTO;
import com.hic.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long departmentId) {
        ReportDTO dto = new ReportDTO();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setBranchId(branchId);
        dto.setDepartmentId(departmentId);
        Map<String, Object> result = reportService.getAttendanceReport(dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/leave")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLeaveReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long departmentId) {
        ReportDTO dto = new ReportDTO();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setBranchId(branchId);
        dto.setDepartmentId(departmentId);
        Map<String, Object> result = reportService.getLeaveReport(dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeReport(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long departmentId) {
        ReportDTO dto = new ReportDTO();
        dto.setBranchId(branchId);
        dto.setDepartmentId(departmentId);
        Map<String, Object> result = reportService.getEmployeeReport(dto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
