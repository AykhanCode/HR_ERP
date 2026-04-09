import type { Branch, Department, LeaveType, EmploymentStatus, LeaveStatus } from '../types'

interface FiltersProps {
  branches?: Branch[]
  departments?: Department[]
  leaveTypes?: LeaveType[]
  selectedBranch?: number
  selectedDepartment?: number
  selectedStatus?: string
  selectedLeaveType?: number
  startDate?: string
  endDate?: string
  searchText?: string
  onBranchChange?: (id: number | undefined) => void
  onDepartmentChange?: (id: number | undefined) => void
  onStatusChange?: (status: string | undefined) => void
  onLeaveTypeChange?: (id: number | undefined) => void
  onStartDateChange?: (date: string) => void
  onEndDateChange?: (date: string) => void
  onSearchChange?: (text: string) => void
  showDateRange?: boolean
  showSearch?: boolean
  showBranch?: boolean
  showDepartment?: boolean
  showStatus?: boolean
  showLeaveStatus?: boolean
  showLeaveType?: boolean
}

const EMPLOYMENT_STATUSES: { value: EmploymentStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'ON_LEAVE', label: 'On Leave' },
]

const LEAVE_STATUSES: { value: LeaveStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function Filters({
  branches = [],
  departments = [],
  leaveTypes = [],
  selectedBranch,
  selectedDepartment,
  selectedStatus,
  selectedLeaveType,
  startDate,
  endDate,
  searchText,
  onBranchChange,
  onDepartmentChange,
  onStatusChange,
  onLeaveTypeChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  showDateRange,
  showSearch,
  showBranch,
  showDepartment,
  showStatus,
  showLeaveStatus,
  showLeaveType,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg bg-gray-50 p-4">
      {showSearch && onSearchChange && (
        <input
          type="search"
          placeholder="Search..."
          value={searchText ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Search"
        />
      )}
      {showDateRange && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600" htmlFor="start-date">
              From
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate ?? ''}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600" htmlFor="end-date">
              To
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate ?? ''}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </>
      )}
      {showBranch && onBranchChange && (
        <select
          value={selectedBranch ?? ''}
          onChange={(e) => onBranchChange(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Filter by branch"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>
      )}
      {showDepartment && onDepartmentChange && (
        <select
          value={selectedDepartment ?? ''}
          onChange={(e) => onDepartmentChange(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Filter by department"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.departmentName}
            </option>
          ))}
        </select>
      )}
      {showStatus && onStatusChange && (
        <select
          value={selectedStatus ?? ''}
          onChange={(e) => onStatusChange(e.target.value || undefined)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {EMPLOYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}
      {showLeaveStatus && onStatusChange && (
        <select
          value={selectedStatus ?? ''}
          onChange={(e) => onStatusChange(e.target.value || undefined)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Filter by leave status"
        >
          <option value="">All Statuses</option>
          {LEAVE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}
      {showLeaveType && onLeaveTypeChange && (
        <select
          value={selectedLeaveType ?? ''}
          onChange={(e) => onLeaveTypeChange(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Filter by leave type"
        >
          <option value="">All Types</option>
          {leaveTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.typeName}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
