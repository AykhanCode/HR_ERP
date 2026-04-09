package com.hic.controller;

import com.hic.dto.ApiResponse;
import com.hic.dto.BranchDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.model.Branch;
import com.hic.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<Branch>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy) {
        PaginatedResponse<Branch> result = branchService.getAll(page, size, sortBy);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Branch>>> getAllList() {
        List<Branch> result = branchService.getAllList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Branch>> getById(@PathVariable Long id) {
        Branch result = branchService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Branch>> create(@Valid @RequestBody BranchDTO dto) {
        Branch result = branchService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Branch created", result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Branch>> update(@PathVariable Long id, @Valid @RequestBody BranchDTO dto) {
        Branch result = branchService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Branch updated", result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        branchService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Branch deleted", null));
    }
}
