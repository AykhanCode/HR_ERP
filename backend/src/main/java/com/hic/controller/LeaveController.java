package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.LeaveRequestDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.model.LeaveRequest;
import com.hic.model.LeaveRequest.LeaveStatus;
import com.hic.model.LeaveType;
import com.hic.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<LeaveRequest>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<LeaveRequest> result = leaveService.getAll(page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveRequest>> getById(@PathVariable Long id) {
        LeaveRequest result = leaveService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getByEmployee(@PathVariable Long employeeId) {
        List<LeaveRequest> result = leaveService.getByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getByStatus(@PathVariable LeaveStatus status) {
        List<LeaveRequest> result = leaveService.getByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<LeaveType>>> getLeaveTypes() {
        List<LeaveType> result = leaveService.getAllLeaveTypes();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequest>> create(@Valid @RequestBody LeaveRequestDTO dto) {
        LeaveRequest result = leaveService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Leave request submitted", result));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveRequest>> approve(
            @PathVariable Long id,
            @RequestParam Long approvedBy) {
        LeaveRequest result = leaveService.approve(id, approvedBy);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved", result));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveRequest>> reject(
            @PathVariable Long id,
            @RequestParam Long rejectedBy) {
        LeaveRequest result = leaveService.reject(id, rejectedBy);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        leaveService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Leave request deleted", null));
    }

    @GetMapping("/balance/{employeeId}/{leaveTypeId}/{year}")
    public ResponseEntity<ApiResponse<Long>> getLeaveBalance(
            @PathVariable Long employeeId,
            @PathVariable Long leaveTypeId,
            @PathVariable int year) {
        long used = leaveService.calculateLeaveDays(employeeId, leaveTypeId, year);
        return ResponseEntity.ok(ApiResponse.success(used));
    }
}
