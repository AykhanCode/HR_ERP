import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLeaveStore } from '../store/leaveStore'
import { useAuthStore } from '../store/authStore'
import { useEmployeeStore } from '../store/employeeStore'
import LeaveTable from '../components/LeaveTable'
import Modal from '../components/Modal'
import FormComponent from '../components/FormComponent'
import Filters from '../components/Filters'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import type { LeaveRequest, LeaveRequestDTO, LeaveStatus } from '../types'
import type { FieldConfig } from '../components/FormComponent'

export default function LeavesPage() {
  const { user } = useAuthStore()
  const {
    leaves,
    leaveTypes,
    isLoading,
    error,
    fetchLeaves,
    fetchByStatus,
    fetchLeaveTypes,
    createLeave,
    approveLeave,
    rejectLeave,
    deleteLeave,
    clearError,
  } = useLeaveStore()
  const { employees, fetchEmployees } = useEmployeeStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>()
  const [currentPage, setCurrentPage] = useState(0)

  const canManage = user?.userType === 'ADMIN' || user?.userType === 'HR'

  useEffect(() => {
    fetchLeaveTypes()
    fetchEmployees({ size: 100 })
    fetchLeaves({ page: 0, size: 10 })
  }, [fetchLeaveTypes, fetchEmployees, fetchLeaves])

  const handleStatusFilter = (status: string | undefined) => {
    setSelectedStatus(status)
    setCurrentPage(0)
    if (status) {
      fetchByStatus(status as LeaveStatus)
    } else {
      fetchLeaves({ page: 0, size: 10 })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchLeaves({ page, size: 10 })
  }

  const leaveFields: FieldConfig[] = [
    {
      name: 'employeeId',
      label: 'Employee',
      type: 'select',
      required: true,
      options: (employees?.content ?? []).map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`,
      })),
    },
    {
      name: 'leaveTypeId',
      label: 'Leave Type',
      type: 'select',
      required: true,
      options: leaveTypes.map((t) => ({ value: t.id, label: t.typeName })),
    },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date', required: true },
  ]

  const handleSubmit = async (values: Record<string, string | number>) => {
    const dto: LeaveRequestDTO = {
      employeeId: Number(values.employeeId),
      leaveTypeId: Number(values.leaveTypeId),
      startDate: String(values.startDate),
      endDate: String(values.endDate),
    }
    try {
      await createLeave(dto)
      toast.success('Leave request submitted')
      setIsModalOpen(false)
      fetchLeaves({ page: currentPage, size: 10 })
    } catch {
      // error set in store
    }
  }

  const handleApprove = async (leave: LeaveRequest) => {
    if (!user) return
    try {
      await approveLeave(leave.id, user.id)
      toast.success('Leave approved')
      fetchLeaves({ page: currentPage, size: 10 })
    } catch {
      toast.error('Failed to approve leave')
    }
  }

  const handleReject = async (leave: LeaveRequest) => {
    if (!user) return
    try {
      await rejectLeave(leave.id, user.id)
      toast.success('Leave rejected')
      fetchLeaves({ page: currentPage, size: 10 })
    } catch {
      toast.error('Failed to reject leave')
    }
  }

  const handleDelete = async (leave: LeaveRequest) => {
    if (!window.confirm('Delete this leave request?')) return
    try {
      await deleteLeave(leave.id)
      toast.success('Leave request deleted')
      fetchLeaves({ page: currentPage, size: 10 })
    } catch {
      toast.error('Failed to delete leave')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            {leaves?.totalElements ?? 0} total requests
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Request
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <Filters
        leaveTypes={leaveTypes}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusFilter}
        showLeaveStatus
      />

      {isLoading ? (
        <LoadingSpinner text="Loading leave requests..." />
      ) : (
        <>
          <LeaveTable
            leaves={leaves?.content ?? []}
            onApprove={canManage ? handleApprove : undefined}
            onReject={canManage ? handleReject : undefined}
            onDelete={canManage ? handleDelete : undefined}
            canManage={canManage}
          />
          {leaves && leaves.totalPages > 1 && (
            <Pagination
              currentPage={leaves.currentPage}
              totalPages={leaves.totalPages}
              totalElements={leaves.totalElements}
              pageSize={leaves.pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Leave Request"
        size="md"
      >
        <FormComponent
          fields={leaveFields}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          submitLabel="Submit Request"
          isLoading={isLoading}
        />
      </Modal>
    </div>
  )
}
