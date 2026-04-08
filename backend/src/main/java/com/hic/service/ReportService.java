package com.hic.service;

import com.hic.dto.ReportDTO;
import com.hic.model.DailyAttendanceSummary;
import com.hic.model.Employee;
import com.hic.model.LeaveRequest;
import com.hic.repository.DailyAttendanceSummaryRepository;
import com.hic.repository.DepartmentRepository;
import com.hic.repository.EmployeeRepository;
import com.hic.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final DailyAttendanceSummaryRepository summaryRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final DepartmentRepository departmentRepository;

    public Map<String, Object> getAttendanceReport(ReportDTO dto) {
        LocalDate start = dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now().withDayOfMonth(1);
        LocalDate end = dto.getEndDate() != null ? dto.getEndDate() : LocalDate.now();

        List<DailyAttendanceSummary> summaries = summaryRepository.findByAttendanceDateBetween(start, end);

        if (dto.getDepartmentId() != null) {
            List<Long> employeeIds = employeeRepository.findByDepartmentId(dto.getDepartmentId())
                    .stream().map(Employee::getId).collect(Collectors.toList());
            summaries = summaries.stream()
                    .filter(s -> employeeIds.contains(s.getEmployeeId()))
                    .collect(Collectors.toList());
        }

        long totalPresent = summaries.stream().filter(s ->
                s.getAttendanceStatus() == DailyAttendanceSummary.AttendanceStatus.PRESENT).count();
        long totalAbsent = summaries.stream().filter(s ->
                s.getAttendanceStatus() == DailyAttendanceSummary.AttendanceStatus.ABSENT).count();
        long totalLate = summaries.stream().filter(s ->
                s.getAttendanceStatus() == DailyAttendanceSummary.AttendanceStatus.LATE).count();
        double totalHours = summaries.stream().mapToDouble(s ->
                s.getHoursWorked() != null ? s.getHoursWorked() : 0.0).sum();

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", start);
        report.put("endDate", end);
        report.put("totalRecords", summaries.size());
        report.put("totalPresent", totalPresent);
        report.put("totalAbsent", totalAbsent);
        report.put("totalLate", totalLate);
        report.put("totalHoursWorked", totalHours);
        report.put("data", summaries);
        return report;
    }

    public Map<String, Object> getLeaveReport(ReportDTO dto) {
        LocalDate start = dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now().withDayOfMonth(1);
        LocalDate end = dto.getEndDate() != null ? dto.getEndDate() : LocalDate.now();

        List<LeaveRequest> leaves = leaveRequestRepository.findAll().stream()
                .filter(lr -> !lr.getStartDate().isAfter(end) && !lr.getEndDate().isBefore(start))
                .collect(Collectors.toList());

        long approved = leaves.stream().filter(l ->
                l.getStatus() == LeaveRequest.LeaveStatus.APPROVED).count();
        long pending = leaves.stream().filter(l ->
                l.getStatus() == LeaveRequest.LeaveStatus.PENDING).count();
        long rejected = leaves.stream().filter(l ->
                l.getStatus() == LeaveRequest.LeaveStatus.REJECTED).count();

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", start);
        report.put("endDate", end);
        report.put("totalRequests", leaves.size());
        report.put("approved", approved);
        report.put("pending", pending);
        report.put("rejected", rejected);
        report.put("data", leaves);
        return report;
    }

    public Map<String, Object> getEmployeeReport(ReportDTO dto) {
        List<Employee> employees;
        if (dto.getDepartmentId() != null) {
            employees = employeeRepository.findByDepartmentId(dto.getDepartmentId());
        } else {
            employees = employeeRepository.findAll();
        }

        long active = employees.stream().filter(e ->
                e.getEmploymentStatus() == Employee.EmploymentStatus.ACTIVE).count();
        long inactive = employees.stream().filter(e ->
                e.getEmploymentStatus() == Employee.EmploymentStatus.INACTIVE).count();
        long onLeave = employees.stream().filter(e ->
                e.getEmploymentStatus() == Employee.EmploymentStatus.ON_LEAVE).count();

        Map<String, Object> report = new HashMap<>();
        report.put("totalEmployees", employees.size());
        report.put("active", active);
        report.put("inactive", inactive);
        report.put("onLeave", onLeave);
        report.put("data", employees);
        return report;
    }

    public List<DailyAttendanceSummary> getAttendanceSummaries(LocalDate start, LocalDate end) {
        return summaryRepository.findByAttendanceDateBetween(start, end);
    }

    public List<Employee> getEmployees(Long departmentId) {
        if (departmentId != null) {
            return employeeRepository.findByDepartmentId(departmentId);
        }
        return employeeRepository.findAll();
    }
}
