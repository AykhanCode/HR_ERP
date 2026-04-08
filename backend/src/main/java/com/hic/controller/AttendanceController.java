package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.AttendanceDTO;
import com.hic.dto.AttendanceLogDTO;
import com.hic.dto.DailyAttendanceSummaryDTO;
import com.hic.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/log")
    public ResponseEntity<ApiResponse<AttendanceLogDTO>> logAttendance(@Valid @RequestBody AttendanceDTO dto) {
        AttendanceLogDTO result = attendanceService.logAttendance(dto);
        return ResponseEntity.ok(ApiResponse.success("Attendance logged", result));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<AttendanceLogDTO>>> getLogsForEmployee(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AttendanceLogDTO> result = attendanceService.getLogsForEmployee(employeeId, start, end);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<AttendanceLogDTO>>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AttendanceLogDTO> result = attendanceService.getLogsByDateRange(start, end);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/summary/{employeeId}")
    public ResponseEntity<ApiResponse<List<DailyAttendanceSummaryDTO>>> getDailySummary(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<DailyAttendanceSummaryDTO> result = attendanceService.getDailySummary(employeeId, start, end);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/summary/generate/{employeeId}")
    public ResponseEntity<ApiResponse<DailyAttendanceSummaryDTO>> generateSummary(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyAttendanceSummaryDTO result = attendanceService.generateDailySummary(employeeId, date);
        return ResponseEntity.ok(ApiResponse.success("Summary generated", result));
    }
}
