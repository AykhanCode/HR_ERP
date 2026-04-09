import { format } from 'date-fns'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'
import type { LeaveRequest, LeaveStatus } from '../types'

interface LeaveTableProps {
  leaves: LeaveRequest[]
  onApprove?: (leave: LeaveRequest) => void
  onReject?: (leave: LeaveRequest) => void
  onDelete?: (leave: LeaveRequest) => void
  canManage?: boolean
}

const STATUS_COLORS: Record<LeaveStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

function formatDate(d?: string) {
  if (!d) return '—'
  try {
    return format(new Date(d), 'MMM d, yyyy')
  } catch {
    return d
  }
}

export default function LeaveTable({
  leaves,
  onApprove,
  onReject,
  onDelete,
  canManage = false,
}: LeaveTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Employee
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Leave Type
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Start Date
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              End Date
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Approved By
            </th>
            {(canManage) && (
              <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leaves.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 7 : 6} className="px-4 py-8 text-center text-gray-400">
                No leave requests found
              </td>
            </tr>
          ) : (
            leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {leave.employeeName ?? `Employee #${leave.employeeId}`}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {leave.leaveTypeName ?? `Type #${leave.leaveTypeId}`}
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(leave.startDate)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(leave.endDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[leave.status]}`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{leave.approverName ?? '—'}</td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {leave.status === 'PENDING' && onApprove && (
                        <button
                          onClick={() => onApprove(leave)}
                          className="rounded p-1 text-green-600 hover:bg-green-50"
                          aria-label="Approve leave"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {leave.status === 'PENDING' && onReject && (
                        <button
                          onClick={() => onReject(leave)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                          aria-label="Reject leave"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(leave)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                          aria-label="Delete leave"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
