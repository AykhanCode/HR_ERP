import { format } from 'date-fns'
import type { AttendanceLog } from '../types'

interface AttendanceTableProps {
  logs: AttendanceLog[]
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  HALF_DAY: 'bg-orange-100 text-orange-800',
}

function formatDT(dt?: string) {
  if (!dt) return '—'
  try {
    return format(new Date(dt), 'MMM d, yyyy HH:mm')
  } catch {
    return dt
  }
}

export default function AttendanceTable({ logs }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Employee
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Check In
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Check Out
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Device
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Event
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                No attendance records found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {log.employeeName ?? `#${log.employeeId}`}
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDT(log.checkInTime)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDT(log.checkOutTime)}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {log.deviceId ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{log.eventType ?? '—'}</td>
                <td className="px-4 py-3">
                  {log.status ? (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[log.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
