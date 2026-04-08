package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.PaginatedResponse;
import com.hic.model.WorkSchedule;
import com.hic.service.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final WorkScheduleService workScheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<WorkSchedule>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<WorkSchedule> result = workScheduleService.getAll(page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkSchedule>> getById(@PathVariable Long id) {
        WorkSchedule result = workScheduleService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<WorkSchedule>>> getByEmployee(@PathVariable Long employeeId) {
        List<WorkSchedule> result = workScheduleService.getByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/employee/{employeeId}/active")
    public ResponseEntity<ApiResponse<WorkSchedule>> getActiveSchedule(@PathVariable Long employeeId) {
        WorkSchedule result = workScheduleService.getActiveScheduleForEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkSchedule>> create(@RequestBody WorkSchedule schedule) {
        WorkSchedule result = workScheduleService.create(schedule);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Work schedule created", result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkSchedule>> update(
            @PathVariable Long id, @RequestBody WorkSchedule schedule) {
        WorkSchedule result = workScheduleService.update(id, schedule);
        return ResponseEntity.ok(ApiResponse.success("Work schedule updated", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        workScheduleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Work schedule deleted", null));
    }
}
