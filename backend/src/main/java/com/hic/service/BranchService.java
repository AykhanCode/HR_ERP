package com.hic.service;

import com.hic.dto.BranchDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.exception.BadRequestException;
import com.hic.exception.ResourceNotFoundException;
import com.hic.model.Branch;
import com.hic.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    public PaginatedResponse<Branch> getAll(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy != null ? sortBy : "id"));
        Page<Branch> branchPage = branchRepository.findAll(pageable);
        List<Branch> content = branchPage.getContent();
        return PaginatedResponse.of(content, branchPage.getTotalElements(),
                branchPage.getTotalPages(), branchPage.getNumber(), branchPage.getSize());
    }

    public List<Branch> getAllList() {
        return branchRepository.findAll(Sort.by("branchName"));
    }

    public Branch getById(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", id));
    }

    @Transactional
    public Branch create(BranchDTO dto) {
        if (branchRepository.existsByBranchCode(dto.getBranchCode())) {
            throw new BadRequestException("Branch with code already exists: " + dto.getBranchCode());
        }
        Branch branch = new Branch();
        mapDtoToBranch(dto, branch);
        return branchRepository.save(branch);
    }

    @Transactional
    public Branch update(Long id, BranchDTO dto) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", id));

        branchRepository.findByBranchCode(dto.getBranchCode()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Branch code already in use: " + dto.getBranchCode());
            }
        });

        mapDtoToBranch(dto, branch);
        return branchRepository.save(branch);
    }

    @Transactional
    public void delete(Long id) {
        if (!branchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Branch", id);
        }
        branchRepository.deleteById(id);
    }

    private void mapDtoToBranch(BranchDTO dto, Branch branch) {
        branch.setBranchName(dto.getBranchName());
        branch.setBranchCode(dto.getBranchCode());
        branch.setLocation(dto.getLocation());
        branch.setIsHeadOffice(dto.getIsHeadOffice() != null ? dto.getIsHeadOffice() : false);
    }
}
