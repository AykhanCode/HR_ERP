import { Download } from 'lucide-react'
import type { AttendanceReport, LeaveReport, EmployeeReport } from '../types'

type ReportData = AttendanceReport | LeaveReport | EmployeeReport

interface ReportTableProps {
  type: 'attendance' | 'leave' | 'employee'
  data: ReportData[]
  onExport?: () => void
}

function AttendanceReportTable({ data }: { data: AttendanceReport[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead className="bg-gray-50">
        <tr>
          {['Employee', 'Total Days', 'Present', 'Absent', 'Late', 'Total Hours'].map((h) => (
            <th key={h} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
              No data
            </td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={row.employeeId} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{row.employeeName}</td>
              <td className="px-4 py-3 text-gray-600">{row.totalDays}</td>
              <td className="px-4 py-3 text-green-600">{row.presentDays}</td>
              <td className="px-4 py-3 text-red-600">{row.absentDays}</td>
              <td className="px-4 py-3 text-yellow-600">{row.lateDays}</td>
              <td className="px-4 py-3 text-gray-600">{row.totalHours.toFixed(1)}h</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

function LeaveReportTable({ data }: { data: LeaveReport[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead className="bg-gray-50">
        <tr>
          {['Employee', 'Leave Type', 'Total Requests', 'Approved', 'Total Days'].map((h) => (
            <th key={h} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
              No data
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{row.employeeName}</td>
              <td className="px-4 py-3 text-gray-600">{row.leaveType}</td>
              <td className="px-4 py-3 text-gray-600">{row.totalRequests}</td>
              <td className="px-4 py-3 text-green-600">{row.approvedRequests}</td>
              <td className="px-4 py-3 text-gray-600">{row.totalDays}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

function EmployeeReportTable({ data }: { data: EmployeeReport[] }) {
  return (
    <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
      <thead className="bg-gray-50">
        <tr>
          {['Department', 'Total', 'Active', 'Inactive'].map((h) => (
            <th key={h} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
              No data
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{row.departmentName}</td>
              <td className="px-4 py-3 text-gray-600">{row.totalEmployees}</td>
              <td className="px-4 py-3 text-green-600">{row.activeEmployees}</td>
              <td className="px-4 py-3 text-red-600">{row.inactiveEmployees}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

export default function ReportTable({ type, data, onExport }: ReportTableProps) {
  return (
    <div className="rounded-lg border border-gray-200">
      {onExport && (
        <div className="flex justify-end border-b border-gray-200 px-4 py-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        {type === 'attendance' && (
          <AttendanceReportTable data={data as AttendanceReport[]} />
        )}
        {type === 'leave' && <LeaveReportTable data={data as LeaveReport[]} />}
        {type === 'employee' && <EmployeeReportTable data={data as EmployeeReport[]} />}
      </div>
    </div>
  )
}
