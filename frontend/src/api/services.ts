import client from './client'
import type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
  Employee,
  EmployeeDTO,
  Branch,
  Department,
  AttendanceLog,
  DailyAttendanceSummary,
  LeaveRequest,
  LeaveRequestDTO,
  LeaveType,
  LeaveBalance,
  Device,
  DeviceDTO,
  DeviceSyncRecord,
  AttendanceReport,
  LeaveReport,
  EmployeeReport,
  EmploymentStatus,
  LeaveStatus,
} from '../types'

// Auth
export const authService = {
  login: (data: LoginRequest) =>
    client.post<ApiResponse<LoginResponse>>('/api/auth/login', data),
  me: () => client.get<ApiResponse<{ id: number; username: string; email: string; userType: string }>>('/api/auth/me'),
}

// Employees
export const employeeService = {
  list: (params?: { page?: number; size?: number; search?: string }) =>
    client.get<ApiResponse<PaginatedResponse<Employee>>>('/api/employees', { params }),
  getById: (id: number) =>
    client.get<ApiResponse<Employee>>(`/api/employees/${id}`),
  getByBranch: (branchId: number) =>
    client.get<ApiResponse<Employee[]>>(`/api/employees/branch/${branchId}`),
  getByDepartment: (departmentId: number) =>
    client.get<ApiResponse<Employee[]>>(`/api/employees/department/${departmentId}`),
  getByStatus: (status: EmploymentStatus) =>
    client.get<ApiResponse<Employee[]>>(`/api/employees/status/${status}`),
  search: (params: { name?: string; departmentId?: number; branchId?: number; page?: number; size?: number }) =>
    client.get<ApiResponse<PaginatedResponse<Employee>>>('/api/employees/search', { params }),
  create: (data: EmployeeDTO) =>
    client.post<ApiResponse<Employee>>('/api/employees', data),
  update: (id: number, data: EmployeeDTO) =>
    client.put<ApiResponse<Employee>>(`/api/employees/${id}`, data),
  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/api/employees/${id}`),
}

// Branches
export const branchService = {
  list: (params?: { page?: number; size?: number }) =>
    client.get<ApiResponse<PaginatedResponse<Branch>>>('/api/branches', { params }),
  listAll: () =>
    client.get<ApiResponse<Branch[]>>('/api/branches/list'),
  getById: (id: number) =>
    client.get<ApiResponse<Branch>>(`/api/branches/${id}`),
  create: (data: Partial<Branch>) =>
    client.post<ApiResponse<Branch>>('/api/branches', data),
  update: (id: number, data: Partial<Branch>) =>
    client.put<ApiResponse<Branch>>(`/api/branches/${id}`, data),
  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/api/branches/${id}`),
}

// Departments
export const departmentService = {
  list: (params?: { page?: number; size?: number }) =>
    client.get<ApiResponse<PaginatedResponse<Department>>>('/api/departments', { params }),
  listAll: () =>
    client.get<ApiResponse<Department[]>>('/api/departments/list'),
  getById: (id: number) =>
    client.get<ApiResponse<Department>>(`/api/departments/${id}`),
  getByBranch: (branchId: number) =>
    client.get<ApiResponse<Department[]>>(`/api/departments/branch/${branchId}`),
  create: (data: Partial<Department>) =>
    client.post<ApiResponse<Department>>('/api/departments', data),
  update: (id: number, data: Partial<Department>) =>
    client.put<ApiResponse<Department>>(`/api/departments/${id}`, data),
  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/api/departments/${id}`),
}

// Attendance
export const attendanceService = {
  getByEmployee: (employeeId: number, params?: { page?: number; size?: number }) =>
    client.get<ApiResponse<PaginatedResponse<AttendanceLog>>>(`/api/attendance/employee/${employeeId}`, { params }),
  getByRange: (params: { startDate: string; endDate: string; employeeId?: number }) =>
    client.get<ApiResponse<AttendanceLog[]>>('/api/attendance/range', { params }),
  getSummary: (employeeId: number, params?: { startDate?: string; endDate?: string }) =>
    client.get<ApiResponse<DailyAttendanceSummary[]>>(`/api/attendance/summary/${employeeId}`, { params }),
  generateSummary: (employeeId: number, params: { date: string }) =>
    client.post<ApiResponse<DailyAttendanceSummary>>(`/api/attendance/summary/generate/${employeeId}`, null, { params }),
}

// Leaves
export const leaveService = {
  list: (params?: { page?: number; size?: number }) =>
    client.get<ApiResponse<PaginatedResponse<LeaveRequest>>>('/api/leaves', { params }),
  getById: (id: number) =>
    client.get<ApiResponse<LeaveRequest>>(`/api/leaves/${id}`),
  getByEmployee: (employeeId: number) =>
    client.get<ApiResponse<LeaveRequest[]>>(`/api/leaves/employee/${employeeId}`),
  getByStatus: (status: LeaveStatus) =>
    client.get<ApiResponse<LeaveRequest[]>>(`/api/leaves/status/${status}`),
  getTypes: () =>
    client.get<ApiResponse<LeaveType[]>>('/api/leaves/types'),
  create: (data: LeaveRequestDTO) =>
    client.post<ApiResponse<LeaveRequest>>('/api/leaves', data),
  approve: (id: number, approverId: number) =>
    client.post<ApiResponse<LeaveRequest>>(`/api/leaves/${id}/approve`, null, { params: { approverId } }),
  reject: (id: number, approverId: number) =>
    client.post<ApiResponse<LeaveRequest>>(`/api/leaves/${id}/reject`, null, { params: { approverId } }),
  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/api/leaves/${id}`),
  getBalance: (employeeId: number, leaveTypeId: number, year: number) =>
    client.get<ApiResponse<LeaveBalance>>(`/api/leaves/balance/${employeeId}/${leaveTypeId}/${year}`),
}

// Devices
export const deviceService = {
  list: () =>
    client.get<ApiResponse<Device[]>>('/api/devices'),
  getByBranch: (branchId: number) =>
    client.get<ApiResponse<Device[]>>(`/api/devices/branch/${branchId}`),
  getById: (id: number) =>
    client.get<ApiResponse<Device>>(`/api/devices/${id}`),
  create: (data: DeviceDTO) =>
    client.post<ApiResponse<Device>>('/api/devices', data),
  update: (id: number, data: DeviceDTO) =>
    client.put<ApiResponse<Device>>(`/api/devices/${id}`, data),
  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/api/devices/${id}`),
  sync: (deviceId: number) =>
    client.post<ApiResponse<DeviceSyncRecord>>(`/api/devices/sync/${deviceId}`),
  getSyncHistory: (deviceId: number) =>
    client.get<ApiResponse<DeviceSyncRecord[]>>(`/api/devices/sync/history/${deviceId}`),
  getRecentSyncHistory: () =>
    client.get<ApiResponse<DeviceSyncRecord[]>>('/api/devices/sync/history/recent'),
}

// Reports
export const reportService = {
  attendance: (params: { startDate: string; endDate: string; branchId?: number; departmentId?: number }) =>
    client.get<ApiResponse<AttendanceReport[]>>('/api/reports/attendance', { params }),
  leave: (params: { startDate: string; endDate: string; branchId?: number; departmentId?: number }) =>
    client.get<ApiResponse<LeaveReport[]>>('/api/reports/leave', { params }),
  employees: (params?: { branchId?: number; departmentId?: number }) =>
    client.get<ApiResponse<EmployeeReport[]>>('/api/reports/employees', { params }),
}

// Export
export const exportService = {
  employeesExcel: (params?: { branchId?: number; departmentId?: number }) =>
    client.get('/api/export/employees/excel', { params, responseType: 'blob' }),
  employeesCsv: (params?: { branchId?: number; departmentId?: number }) =>
    client.get('/api/export/employees/csv', { params, responseType: 'blob' }),
  attendanceExcel: (params: { startDate: string; endDate: string; employeeId?: number }) =>
    client.get('/api/export/attendance/excel', { params, responseType: 'blob' }),
  attendanceCsv: (params: { startDate: string; endDate: string; employeeId?: number }) =>
    client.get('/api/export/attendance/csv', { params, responseType: 'blob' }),
}
