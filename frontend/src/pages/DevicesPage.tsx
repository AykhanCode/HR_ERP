import { useEffect, useState } from 'react'
import { Plus, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDeviceStore } from '../store/deviceStore'
import { useEmployeeStore } from '../store/employeeStore'
import DeviceTable from '../components/DeviceTable'
import Modal from '../components/Modal'
import FormComponent from '../components/FormComponent'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import { format } from 'date-fns'
import type { Device, DeviceDTO } from '../types'
import type { FieldConfig } from '../components/FormComponent'

export default function DevicesPage() {
  const {
    devices,
    syncHistory,
    isLoading,
    isSyncing,
    error,
    fetchDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    syncDevice,
    fetchRecentSyncHistory,
    clearError,
  } = useDeviceStore()
  const { branches, fetchBranches } = useEmployeeStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  useEffect(() => {
    fetchDevices()
    fetchBranches()
    fetchRecentSyncHistory()
  }, [fetchDevices, fetchBranches, fetchRecentSyncHistory])

  const deviceFields: FieldConfig[] = [
    { name: 'deviceId', label: 'Device ID', type: 'text', required: true },
    { name: 'deviceName', label: 'Device Name', type: 'text' },
    {
      name: 'deviceType',
      label: 'Device Type',
      type: 'select',
      options: [
        { value: 'FINGERPRINT', label: 'Fingerprint' },
        { value: 'FACE', label: 'Face Recognition' },
        { value: 'CARD', label: 'Card Reader' },
        { value: 'HIKVISION', label: 'Hikvision' },
      ],
    },
    { name: 'ipAddress', label: 'IP Address', type: 'text', placeholder: '192.168.1.100' },
    { name: 'port', label: 'Port', type: 'number', placeholder: '80' },
    {
      name: 'branchId',
      label: 'Branch',
      type: 'select',
      options: branches.map((b) => ({ value: b.id, label: b.branchName })),
    },
    {
      name: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ]

  const handleSubmit = async (values: Record<string, string | number>) => {
    const dto: DeviceDTO = {
      deviceId: String(values.deviceId),
      deviceName: values.deviceName ? String(values.deviceName) : undefined,
      deviceType: values.deviceType ? String(values.deviceType) : undefined,
      ipAddress: values.ipAddress ? String(values.ipAddress) : undefined,
      port: values.port ? Number(values.port) : undefined,
      branchId: values.branchId ? Number(values.branchId) : undefined,
      isActive: values.isActive === 'true',
    }
    try {
      if (selectedDevice) {
        await updateDevice(selectedDevice.id, dto)
        toast.success('Device updated')
      } else {
        await createDevice(dto)
        toast.success('Device added')
      }
      setIsModalOpen(false)
      setSelectedDevice(null)
      fetchDevices()
    } catch {
      // error in store
    }
  }

  const handleEdit = (device: Device) => {
    setSelectedDevice(device)
    setIsModalOpen(true)
  }

  const handleDelete = async (device: Device) => {
    if (!window.confirm(`Delete device ${device.deviceName ?? device.deviceId}?`)) return
    try {
      await deleteDevice(device.id)
      toast.success('Device deleted')
      fetchDevices()
    } catch {
      toast.error('Failed to delete device')
    }
  }

  const handleSync = async (device: Device) => {
    try {
      await syncDevice(device.id)
      toast.success(`Sync triggered for ${device.deviceName ?? device.deviceId}`)
      fetchDevices()
      fetchRecentSyncHistory()
    } catch {
      toast.error('Sync failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="mt-1 text-sm text-gray-500">{devices.length} devices registered</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            Sync History
          </button>
          <button
            onClick={() => {
              setSelectedDevice(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Device
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      {isLoading ? (
        <LoadingSpinner text="Loading devices..." />
      ) : (
        <DeviceTable
          devices={devices}
          onSync={handleSync}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isSyncing={isSyncing}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDevice(null)
        }}
        title={selectedDevice ? 'Edit Device' : 'Add Device'}
        size="lg"
      >
        <FormComponent
          fields={deviceFields}
          initialValues={
            selectedDevice
              ? {
                  deviceId: selectedDevice.deviceId,
                  deviceName: selectedDevice.deviceName ?? '',
                  deviceType: selectedDevice.deviceType ?? '',
                  ipAddress: selectedDevice.ipAddress ?? '',
                  port: selectedDevice.port ?? '',
                  branchId: selectedDevice.branchId ?? '',
                  isActive: selectedDevice.isActive ? 'true' : 'false',
                }
              : {}
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedDevice(null)
          }}
          submitLabel={selectedDevice ? 'Update' : 'Add Device'}
          isLoading={isLoading}
        />
      </Modal>

      {/* Sync History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Recent Sync History"
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Device', 'Result', 'Records', 'Synced At', 'Error'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {syncHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No sync history
                  </td>
                </tr>
              ) : (
                syncHistory.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 font-mono text-xs">{record.deviceId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          record.syncResult === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.syncResult}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{record.recordsSynced}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {record.syncedAt
                        ? format(new Date(record.syncedAt), 'MMM d, yyyy HH:mm')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-red-500 text-xs">
                      {record.errorMessage ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}
