import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAttendanceStore } from '../store/attendanceStore'
import { useEmployeeStore } from '../store/employeeStore'
import { exportService } from '../api/services'
import AttendanceTable from '../components/AttendanceTable'
import Filters from '../components/Filters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import { format, subDays } from 'date-fns'

export default function AttendancePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

  const [startDate, setStartDate] = useState(weekAgo)
  const [endDate, setEndDate] = useState(today)
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>()

  const { logs, isLoading, error, fetchByRange, clearError } = useAttendanceStore()
  const { employees, fetchEmployees } = useEmployeeStore()

  useEffect(() => {
    fetchEmployees({ size: 100 })
  }, [fetchEmployees])

  useEffect(() => {
    fetchByRange({ startDate, endDate, employeeId: selectedEmployee })
  }, [fetchByRange, startDate, endDate, selectedEmployee])

  const handleExportExcel = async () => {
    try {
      const res = await exportService.attendanceExcel({
        startDate,
        endDate,
        employeeId: selectedEmployee,
      })
      const url = URL.createObjectURL(new Blob([res.data as BlobPart]))
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_${startDate}_${endDate}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export started')
    } catch {
      toast.error('Export failed')
    }
  }

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    ...(employees?.content ?? []).map((e) => ({
      value: String(e.id),
      label: `${e.firstName} ${e.lastName}`,
    })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">{logs.length} records found</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export Excel
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="flex flex-wrap gap-3 rounded-lg bg-gray-50 p-4">
        <Filters
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          showDateRange
        />
        <div className="flex items-center gap-2">
          <label htmlFor="emp-filter" className="text-sm text-gray-600">
            Employee
          </label>
          <select
            id="emp-filter"
            value={selectedEmployee ?? ''}
            onChange={(e) =>
              setSelectedEmployee(e.target.value ? Number(e.target.value) : undefined)
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {employeeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading attendance records..." />
      ) : (
        <AttendanceTable logs={logs} />
      )}
    </div>
  )
}
