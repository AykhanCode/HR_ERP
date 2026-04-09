package com.hic.service;

import com.hic.dto.LeaveRequestDTO;
import com.hic.dto.PaginatedResponse;
import com.hic.exception.BadRequestException;
import com.hic.exception.ResourceNotFoundException;
import com.hic.model.LeaveRequest;
import com.hic.model.LeaveRequest.LeaveStatus;
import com.hic.model.LeaveType;
import com.hic.repository.EmployeeRepository;
import com.hic.repository.LeaveRequestRepository;
import com.hic.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    public PaginatedResponse<LeaveRequest> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LeaveRequest> leavePage = leaveRequestRepository.findAll(pageable);
        return PaginatedResponse.of(leavePage.getContent(), leavePage.getTotalElements(),
                leavePage.getTotalPages(), leavePage.getNumber(), leavePage.getSize());
    }

    public LeaveRequest getById(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));
    }

    public List<LeaveRequest> getByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", employeeId);
        }
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    public List<LeaveRequest> getByStatus(LeaveStatus status) {
        return leaveRequestRepository.findByStatus(status);
    }

    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeRepository.findAll();
    }

    @Transactional
    public LeaveRequest create(LeaveRequestDTO dto) {
        if (!employeeRepository.existsById(dto.getEmployeeId())) {
            throw new ResourceNotFoundException("Employee", dto.getEmployeeId());
        }
        if (!leaveTypeRepository.existsById(dto.getLeaveTypeId())) {
            throw new ResourceNotFoundException("LeaveType", dto.getLeaveTypeId());
        }
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployeeId(dto.getEmployeeId());
        leaveRequest.setLeaveTypeId(dto.getLeaveTypeId());
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(leaveRequest);
    }

    @Transactional
    public LeaveRequest approve(Long id, Long approvedBy) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already " + leaveRequest.getStatus().name().toLowerCase());
        }
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setApprovedBy(approvedBy);
        leaveRequest.setApprovalDate(LocalDate.now());
        return leaveRequestRepository.save(leaveRequest);
    }

    @Transactional
    public LeaveRequest reject(Long id, Long rejectedBy) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already " + leaveRequest.getStatus().name().toLowerCase());
        }
        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setApprovedBy(rejectedBy);
        leaveRequest.setApprovalDate(LocalDate.now());
        return leaveRequestRepository.save(leaveRequest);
    }

    @Transactional
    public void delete(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            throw new BadRequestException("Cannot delete an approved leave request");
        }
        leaveRequestRepository.deleteById(id);
    }

    public long calculateLeaveDays(Long employeeId, Long leaveTypeId, int year) {
        return leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, LeaveStatus.APPROVED)
                .stream()
                .filter(lr -> lr.getLeaveTypeId().equals(leaveTypeId))
                .filter(lr -> lr.getStartDate().getYear() == year || lr.getEndDate().getYear() == year)
                .mapToLong(lr -> ChronoUnit.DAYS.between(lr.getStartDate(), lr.getEndDate()) + 1)
                .sum();
    }
}
