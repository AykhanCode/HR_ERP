import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEmployeeStore } from '../store/employeeStore'
import EmployeeTable from '../components/EmployeeTable'
import Modal from '../components/Modal'
import FormComponent from '../components/FormComponent'
import Filters from '../components/Filters'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import type { Employee, EmployeeDTO } from '../types'
import type { FieldConfig } from '../components/FormComponent'

export default function EmployeesPage() {
  const {
    employees,
    branches,
    departments,
    isLoading,
    error,
    fetchEmployees,
    searchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchBranches,
    fetchDepartments,
    clearError,
    setSelectedEmployee,
    selectedEmployee,
  } = useEmployeeStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>()
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>()
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    fetchEmployees({ page: 0, size: 10 })
    fetchBranches()
    fetchDepartments()
  }, [fetchEmployees, fetchBranches, fetchDepartments])

  const applyFilters = useCallback(
    (page = 0) => {
      if (searchText || selectedBranch || selectedDepartment) {
        searchEmployees({
          name: searchText || undefined,
          branchId: selectedBranch,
          departmentId: selectedDepartment,
          page,
          size: 10,
        })
      } else {
        fetchEmployees({ page, size: 10 })
      }
      setCurrentPage(page)
    },
    [searchText, selectedBranch, selectedDepartment, searchEmployees, fetchEmployees]
  )

  const handleSearch = () => applyFilters(0)
  const handlePageChange = (page: number) => applyFilters(page)

  const employeeFields: FieldConfig[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'mobilePhone', label: 'Phone', type: 'tel' },
    {
      name: 'departmentId',
      label: 'Department',
      type: 'select',
      required: true,
      options: departments.map((d) => ({ value: d.id, label: d.departmentName })),
    },
    { name: 'hireDate', label: 'Hire Date', type: 'date' },
    { name: 'birthDate', label: 'Birth Date', type: 'date' },
    { name: 'finNumber', label: 'FIN Number', type: 'text' },
    {
      name: 'employmentStatus',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'ON_LEAVE', label: 'On Leave' },
        { value: 'TERMINATED', label: 'Terminated' },
      ],
    },
  ]

  const handleSubmit = async (values: Record<string, string | number>) => {
    const dto: EmployeeDTO = {
      firstName: String(values.firstName),
      lastName: String(values.lastName),
      email: values.email ? String(values.email) : undefined,
      mobilePhone: values.mobilePhone ? String(values.mobilePhone) : undefined,
      departmentId: Number(values.departmentId),
      hireDate: values.hireDate ? String(values.hireDate) : undefined,
      birthDate: values.birthDate ? String(values.birthDate) : undefined,
      finNumber: values.finNumber ? String(values.finNumber) : undefined,
      employmentStatus: values.employmentStatus
        ? (String(values.employmentStatus) as EmployeeDTO['employmentStatus'])
        : undefined,
    }
    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, dto)
        toast.success('Employee updated successfully')
      } else {
        await createEmployee(dto)
        toast.success('Employee created successfully')
      }
      setIsModalOpen(false)
      setSelectedEmployee(null)
      applyFilters(currentPage)
    } catch {
      // error is set in store
    }
  }

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (emp: Employee) => {
    setSelectedEmployee(emp)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return
    try {
      await deleteEmployee(selectedEmployee.id)
      toast.success('Employee deleted')
      setIsDeleteModalOpen(false)
      setSelectedEmployee(null)
      applyFilters(currentPage)
    } catch {
      // error is set in store
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">
            {employees?.totalElements ?? 0} total employees
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedEmployee(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Employee
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <Filters
        branches={branches}
        departments={departments}
        searchText={searchText}
        selectedBranch={selectedBranch}
        selectedDepartment={selectedDepartment}
        onSearchChange={setSearchText}
        onBranchChange={setSelectedBranch}
        onDepartmentChange={setSelectedDepartment}
        showSearch
        showBranch
        showDepartment
      />

      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Search
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading employees..." />
      ) : (
        <>
          <EmployeeTable
            employees={employees?.content ?? []}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
          {employees && employees.totalPages > 1 && (
            <Pagination
              currentPage={employees.currentPage}
              totalPages={employees.totalPages}
              totalElements={employees.totalElements}
              pageSize={employees.pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEmployee(null)
        }}
        title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        <FormComponent
          fields={employeeFields}
          initialValues={
            selectedEmployee
              ? {
                  firstName: selectedEmployee.firstName,
                  lastName: selectedEmployee.lastName,
                  email: selectedEmployee.email ?? '',
                  mobilePhone: selectedEmployee.mobilePhone ?? '',
                  departmentId: selectedEmployee.departmentId,
                  hireDate: selectedEmployee.hireDate ?? '',
                  birthDate: selectedEmployee.birthDate ?? '',
                  finNumber: selectedEmployee.finNumber ?? '',
                  employmentStatus: selectedEmployee.employmentStatus,
                }
              : {}
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedEmployee(null)
          }}
          submitLabel={selectedEmployee ? 'Update' : 'Create'}
          isLoading={isLoading}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold">
            {selectedEmployee?.firstName} {selectedEmployee?.lastName}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isLoading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
