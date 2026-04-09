package com.hic.service;

import com.hic.dto.DepartmentDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.exception.BadRequestException;
import com.hic.exception.ResourceNotFoundException;
import com.hic.model.Department;
import com.hic.repository.BranchRepository;
import com.hic.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final BranchRepository branchRepository;

    public PaginatedResponse<Department> getAll(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy != null ? sortBy : "id"));
        Page<Department> deptPage = departmentRepository.findAll(pageable);
        return PaginatedResponse.of(deptPage.getContent(), deptPage.getTotalElements(),
                deptPage.getTotalPages(), deptPage.getNumber(), deptPage.getSize());
    }

    public List<Department> getAllList() {
        return departmentRepository.findAll(Sort.by("departmentName"));
    }

    public Department getById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
    }

    public List<Department> getByBranch(Long branchId) {
        if (!branchRepository.existsById(branchId)) {
            throw new ResourceNotFoundException("Branch", branchId);
        }
        return departmentRepository.findByBranchId(branchId);
    }

    @Transactional
    public Department create(DepartmentDTO dto) {
        if (!branchRepository.existsById(dto.getBranchId())) {
            throw new ResourceNotFoundException("Branch", dto.getBranchId());
        }
        Department department = new Department();
        mapDtoToDepartment(dto, department);
        return departmentRepository.save(department);
    }

    @Transactional
    public Department update(Long id, DepartmentDTO dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        if (!branchRepository.existsById(dto.getBranchId())) {
            throw new ResourceNotFoundException("Branch", dto.getBranchId());
        }
        mapDtoToDepartment(dto, department);
        return departmentRepository.save(department);
    }

    @Transactional
    public void delete(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department", id);
        }
        departmentRepository.deleteById(id);
    }

    private void mapDtoToDepartment(DepartmentDTO dto, Department department) {
        department.setDepartmentName(dto.getDepartmentName());
        department.setBranchId(dto.getBranchId());
    }
}
