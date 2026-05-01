package com.hic.controller;

import com.hic.dto.EmployeeDTO;
import com.hic.dto.EmployeeResponseDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.dto.ApiResponse;
import com.hic.model.Employee.EmploymentStatus;
import com.hic.service.EmployeeService;
import com.hic.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<EmployeeResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(employeeService.getAll(page, size, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getById(id)));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<PaginatedResponse<EmployeeResponseDTO>> getByBranch(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(employeeService.getByBranch(branchId, page, size));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDTO>>> getByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getByDepartment(departmentId)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDTO>>> getByStatus(@PathVariable EmploymentStatus status) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getByStatus(status)));
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<EmployeeResponseDTO>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(employeeService.search(q, page, size));
    }

    @GetMapping("/filter")
    public ResponseEntity<PaginatedResponse<EmployeeResponseDTO>> filter(
            @RequestParam(required = false) EmploymentStatus status,
            @RequestParam(required = false) Long department,
            @RequestParam(required = false) String shift,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(employeeService.filter(status, department, shift, area, search, page, size));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> create(@Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> update(@PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/upload-photo")
    public ResponseEntity<ApiResponse<EmployeeResponseDTO>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        EmployeeResponseDTO updated = employeeService.updatePhoto(id, file);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
