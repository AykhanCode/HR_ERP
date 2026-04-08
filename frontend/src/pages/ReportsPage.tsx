import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportService, exportService } from '../api/services'
import ReportTable from '../components/ReportTable'
import Filters from '../components/Filters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import { format, subDays } from 'date-fns'
import type { AttendanceReport, LeaveReport, EmployeeReport } from '../types'

type ReportType = 'attendance' | 'leave' | 'employee'

export default function ReportsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const [reportType, setReportType] = useState<ReportType>('attendance')
  const [startDate, setStartDate] = useState(monthAgo)
  const [endDate, setEndDate] = useState(today)
  const [attendanceData, setAttendanceData] = useState<AttendanceReport[]>([])
  const [leaveData, setLeaveData] = useState<LeaveReport[]>([])
  const [employeeData, setEmployeeData] = useState<EmployeeReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (reportType === 'attendance') {
        const res = await reportService.attendance({ startDate, endDate })
        setAttendanceData(res.data.data)
      } else if (reportType === 'leave') {
        const res = await reportService.leave({ startDate, endDate })
        setLeaveData(res.data.data)
      } else {
        const res = await reportService.employees()
        setEmployeeData(res.data.data)
      }
      setGenerated(true)
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message ?? 'Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      if (reportType === 'attendance') {
        const res = await exportService.attendanceExcel({ startDate, endDate })
        const url = URL.createObjectURL(new Blob([res.data as BlobPart]))
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance_report_${startDate}_${endDate}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const res = await exportService.employeesExcel()
        const url = URL.createObjectURL(new Blob([res.data as BlobPart]))
        const a = document.createElement('a')
        a.href = url
        a.download = `employees_report.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      }
      toast.success('Export started')
    } catch {
      toast.error('Export failed')
    }
  }

  const currentData =
    reportType === 'attendance'
      ? attendanceData
      : reportType === 'leave'
      ? leaveData
      : employeeData

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Generate and export HR reports</p>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {(['attendance', 'leave', 'employee'] as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setReportType(type)
              setGenerated(false)
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              reportType === type
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            {type} Report
          </button>
        ))}
      </div>

      {/* Filters */}
      {reportType !== 'employee' && (
        <Filters
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          showDateRange
        />
      )}

      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <LoadingSpinner text="Generating report..." />
      ) : generated ? (
        <ReportTable
          type={reportType}
          data={currentData}
          onExport={handleExport}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-500">
            Select a report type and click Generate Report
          </p>
        </div>
      )}
    </div>
  )
}
