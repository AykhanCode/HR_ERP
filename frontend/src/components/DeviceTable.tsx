import { RefreshCw, Trash2, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import type { Device } from '../types'

interface DeviceTableProps {
  devices: Device[]
  onSync: (device: Device) => void
  onEdit: (device: Device) => void
  onDelete: (device: Device) => void
  isSyncing?: boolean
}

function formatDT(dt?: string) {
  if (!dt) return 'Never'
  try {
    return format(new Date(dt), 'MMM d, yyyy HH:mm')
  } catch {
    return dt
  }
}

export default function DeviceTable({
  devices,
  onSync,
  onEdit,
  onDelete,
  isSyncing,
}: DeviceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Device ID
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Type
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              IP Address
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Branch
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Last Sync
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {devices.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                No devices found
              </td>
            </tr>
          ) : (
            devices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{device.deviceId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {device.deviceName ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{device.deviceType ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {device.ipAddress ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{device.branchName ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      device.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {device.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDT(device.lastSyncAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSync(device)}
                      disabled={isSyncing}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                      aria-label={`Sync ${device.deviceName ?? device.deviceId}`}
                    >
                      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => onEdit(device)}
                      className="rounded p-1 text-gray-600 hover:bg-gray-100"
                      aria-label={`Edit ${device.deviceName ?? device.deviceId}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(device)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      aria-label={`Delete ${device.deviceName ?? device.deviceId}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
