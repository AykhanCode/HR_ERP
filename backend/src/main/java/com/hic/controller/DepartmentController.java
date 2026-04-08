package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.DepartmentDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.model.Department;
import com.hic.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<Department>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy) {
        PaginatedResponse<Department> result = departmentService.getAll(page, size, sortBy);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Department>>> getAllList() {
        List<Department> result = departmentService.getAllList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> getById(@PathVariable Long id) {
        Department result = departmentService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<ApiResponse<List<Department>>> getByBranch(@PathVariable Long branchId) {
        List<Department> result = departmentService.getByBranch(branchId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Department>> create(@Valid @RequestBody DepartmentDTO dto) {
        Department result = departmentService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Department created", result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> update(
            @PathVariable Long id, @Valid @RequestBody DepartmentDTO dto) {
        Department result = departmentService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Department updated", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted", null));
    }
}
