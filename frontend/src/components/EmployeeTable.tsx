import { Pencil, Trash2 } from 'lucide-react'
import type { Employee } from '../types'

interface EmployeeTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  canEdit?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
}

export default function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  canEdit = true,
}: EmployeeTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              ID
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Email
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Department
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Position
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Status
            </th>
            {canEdit && (
              <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={canEdit ? 7 : 6}
                className="px-4 py-8 text-center text-gray-400"
              >
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{emp.employeeId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="px-4 py-3 text-gray-600">{emp.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{emp.departmentName ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{emp.positionName ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[emp.employmentStatus] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {emp.employmentStatus}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(emp)}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        aria-label={`Edit ${emp.firstName} ${emp.lastName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(emp)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                        aria-label={`Delete ${emp.firstName} ${emp.lastName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
