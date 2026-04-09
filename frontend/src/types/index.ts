// Auth
export interface User {
  id: number
  username: string
  email: string
  userType: 'ADMIN' | 'HR' | 'EMPLOYEE'
  branchId?: number
  departmentId?: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

// API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// Employee
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE'

export interface Employee {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  birthDate?: string
  gender?: string
  mobilePhone?: string
  email?: string
  finNumber?: string
  faceId?: string
  cardId?: string
  departmentId: number
  departmentName?: string
  positionId?: number
  positionName?: string
  hireDate?: string
  employmentStatus: EmploymentStatus
  createdAt?: string
  updatedAt?: string
}

export interface EmployeeDTO {
  firstName: string
  lastName: string
  birthDate?: string
  gender?: string
  mobilePhone?: string
  email?: string
  finNumber?: string
  faceId?: string
  cardId?: string
  departmentId: number
  positionId?: number
  hireDate?: string
  employmentStatus?: EmploymentStatus
}

// Branch / Department
export interface Branch {
  id: number
  branchName: string
  branchCode: string
  location?: string
  isHeadOffice?: boolean
}

export interface Department {
  id: number
  departmentName: string
  branchId: number
  branchName?: string
}

export interface Position {
  id: number
  positionName: string
  departmentId: number
}

// Attendance
export interface AttendanceLog {
  id: number
  employeeId: number
  employeeName?: string
  checkInTime?: string
  checkOutTime?: string
  deviceId?: string
  doorId?: string
  eventType?: string
  verificationMethod?: string
  status?: string
  createdAt?: string
}

export interface DailyAttendanceSummary {
  id: number
  employeeId: number
  employeeName?: string
  attendanceDate: string
  checkInTime?: string
  checkOutTime?: string
  hoursWorked?: number
  isStandardDay?: boolean
  isAdditionalDay?: boolean
  isExtraDay?: boolean
  isHoliday?: boolean
  isLeave?: boolean
  attendanceStatus?: string
}

// Leave
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface LeaveType {
  id: number
  typeName: string
  defaultDays?: number
  isPaid?: boolean
}

export interface LeaveRequest {
  id: number
  employeeId: number
  employeeName?: string
  leaveTypeId: number
  leaveTypeName?: string
  startDate: string
  endDate: string
  status: LeaveStatus
  approvedBy?: number
  approverName?: string
  createdAt?: string
}

export interface LeaveRequestDTO {
  employeeId: number
  leaveTypeId: number
  startDate: string
  endDate: string
}

export interface LeaveBalance {
  leaveTypeId: number
  leaveTypeName: string
  totalDays: number
  usedDays: number
  remainingDays: number
}

// Device
export interface Device {
  id: number
  deviceId: string
  deviceName?: string
  deviceType?: string
  ipAddress?: string
  port?: number
  branchId?: number
  branchName?: string
  isActive?: boolean
  lastSyncAt?: string
  createdAt?: string
}

export interface DeviceSyncRecord {
  id: number
  deviceId: string
  syncResult: string
  recordsSynced: number
  errorMessage?: string
  syncedAt?: string
}

export interface DeviceDTO {
  deviceId: string
  deviceName?: string
  deviceType?: string
  ipAddress?: string
  port?: number
  branchId?: number
  isActive?: boolean
}

// Reports
export interface AttendanceReport {
  employeeId: number
  employeeName: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  totalHours: number
}

export interface LeaveReport {
  employeeId: number
  employeeName: string
  leaveType: string
  totalRequests: number
  approvedRequests: number
  totalDays: number
}

export interface EmployeeReport {
  departmentName: string
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
}

// Filters
export interface AttendanceFilters {
  employeeId?: number
  startDate?: string
  endDate?: string
}

export interface EmployeeFilters {
  search?: string
  branchId?: number
  departmentId?: number
  status?: EmploymentStatus
  page?: number
  size?: number
}

export interface LeaveFilters {
  status?: LeaveStatus
  employeeId?: number
}
