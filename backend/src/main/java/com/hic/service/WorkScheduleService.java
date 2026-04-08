package com.hic.service;

import com.hic.dto.PaginatedResponse;
import com.hic.exception.BadRequestException;
import com.hic.exception.ResourceNotFoundException;
import com.hic.model.WorkSchedule;
import com.hic.repository.EmployeeRepository;
import com.hic.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final EmployeeRepository employeeRepository;

    public PaginatedResponse<WorkSchedule> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WorkSchedule> schedulePage = workScheduleRepository.findAll(pageable);
        return PaginatedResponse.of(schedulePage.getContent(), schedulePage.getTotalElements(),
                schedulePage.getTotalPages(), schedulePage.getNumber(), schedulePage.getSize());
    }

    public WorkSchedule getById(Long id) {
        return workScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkSchedule", id));
    }

    public List<WorkSchedule> getByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", employeeId);
        }
        return workScheduleRepository.findByEmployeeIdAndEffectiveDateLessThanEqual(employeeId, LocalDate.now());
    }

    public WorkSchedule getActiveScheduleForEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", employeeId);
        }
        return workScheduleRepository
                .findTopByEmployeeIdAndEffectiveDateLessThanEqualOrderByEffectiveDateDesc(employeeId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No active work schedule found for employee: " + employeeId));
    }

    @Transactional
    public WorkSchedule create(WorkSchedule schedule) {
        if (!employeeRepository.existsById(schedule.getEmployeeId())) {
            throw new ResourceNotFoundException("Employee", schedule.getEmployeeId());
        }
        validateSchedule(schedule);
        return workScheduleRepository.save(schedule);
    }

    @Transactional
    public WorkSchedule update(Long id, WorkSchedule updated) {
        WorkSchedule existing = workScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkSchedule", id));
        if (!employeeRepository.existsById(updated.getEmployeeId())) {
            throw new ResourceNotFoundException("Employee", updated.getEmployeeId());
        }
        validateSchedule(updated);
        existing.setEmployeeId(updated.getEmployeeId());
        existing.setEffectiveDate(updated.getEffectiveDate());
        existing.setEndDate(updated.getEndDate());
        existing.setMondayStart(updated.getMondayStart());
        existing.setMondayEnd(updated.getMondayEnd());
        existing.setTuesdayStart(updated.getTuesdayStart());
        existing.setTuesdayEnd(updated.getTuesdayEnd());
        existing.setWednesdayStart(updated.getWednesdayStart());
        existing.setWednesdayEnd(updated.getWednesdayEnd());
        existing.setThursdayStart(updated.getThursdayStart());
        existing.setThursdayEnd(updated.getThursdayEnd());
        existing.setFridayStart(updated.getFridayStart());
        existing.setFridayEnd(updated.getFridayEnd());
        existing.setSaturdayStart(updated.getSaturdayStart());
        existing.setSaturdayEnd(updated.getSaturdayEnd());
        existing.setSundayStart(updated.getSundayStart());
        existing.setSundayEnd(updated.getSundayEnd());
        existing.setDailyWorkHours(updated.getDailyWorkHours());
        existing.setGracePeriodMinutes(updated.getGracePeriodMinutes());
        return workScheduleRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!workScheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("WorkSchedule", id);
        }
        workScheduleRepository.deleteById(id);
    }

    private void validateSchedule(WorkSchedule schedule) {
        if (schedule.getEffectiveDate() == null) {
            throw new BadRequestException("Effective date is required");
        }
        if (schedule.getEndDate() != null && schedule.getEndDate().isBefore(schedule.getEffectiveDate())) {
            throw new BadRequestException("End date cannot be before effective date");
        }
    }
}
