package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.EmployeeDTO;
import com.hic.dto.EmployeeResponseDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.model.Employee.EmploymentStatus;
import com.hic.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<EmployeeResponseDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy) {
        PaginatedResponse<EmployeeResponseDTO> result = employeeService.getAll(page, size, sortBy);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> getById(@PathVariable Long id) {
        EmployeeResponseDTO result = employeeService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<ApiResponse<PaginatedResponse<EmployeeResponseDTO>>> getByBranch(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<EmployeeResponseDTO> result = employeeService.getByBranch(branchId, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDTO>>> getByDepartment(@PathVariable Long departmentId) {
        List<EmployeeResponseDTO> result = employeeService.getByDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDTO>>> getByStatus(@PathVariable EmploymentStatus status) {
        List<EmployeeResponseDTO> result = employeeService.getByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PaginatedResponse<EmployeeResponseDTO>>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<EmployeeResponseDTO> result = employeeService.search(query, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> create(@Valid @RequestBody EmployeeDTO dto) {
        EmployeeResponseDTO result = employeeService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Employee created", result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> update(
            @PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        EmployeeResponseDTO result = employeeService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Employee updated", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted", null));
    }
}
