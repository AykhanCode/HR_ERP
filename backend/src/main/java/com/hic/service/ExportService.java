package com.hic.service;

import com.hic.exception.ExportException;
import com.hic.model.DailyAttendanceSummary;
import com.hic.model.Employee;
import com.hic.repository.DailyAttendanceSummaryRepository;
import com.hic.repository.EmployeeRepository;
import com.hic.util.CsvExportUtil;
import com.hic.util.ExcelExportUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final EmployeeRepository employeeRepository;
    private final DailyAttendanceSummaryRepository summaryRepository;
    private final ExcelExportUtil excelExportUtil;
    private final CsvExportUtil csvExportUtil;

    public byte[] exportEmployeesToExcel() {
        List<Employee> employees = employeeRepository.findAll();
        return excelExportUtil.writeEmployees(employees);
    }

    public byte[] exportEmployeesToCsv() {
        List<Employee> employees = employeeRepository.findAll();
        return csvExportUtil.writeEmployeesCsv(employees);
    }

    public byte[] exportAttendanceToExcel(LocalDate start, LocalDate end) {
        LocalDate startDate = start != null ? start : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = end != null ? end : LocalDate.now();
        List<DailyAttendanceSummary> summaries = summaryRepository.findByAttendanceDateBetween(startDate, endDate);
        return excelExportUtil.writeAttendance(summaries);
    }

    public byte[] exportAttendanceToCsv(LocalDate start, LocalDate end) {
        LocalDate startDate = start != null ? start : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = end != null ? end : LocalDate.now();
        List<DailyAttendanceSummary> summaries = summaryRepository.findByAttendanceDateBetween(startDate, endDate);
        return csvExportUtil.writeAttendanceCsv(summaries);
    }

    public byte[] exportEmployeesByDepartmentToExcel(Long departmentId) {
        List<Employee> employees = employeeRepository.findByDepartmentId(departmentId);
        if (employees.isEmpty()) {
            throw new ExportException("No employees found for department: " + departmentId);
        }
        return excelExportUtil.writeEmployees(employees);
    }
}
