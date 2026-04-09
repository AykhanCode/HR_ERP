import { create } from 'zustand'
import { employeeService, branchService, departmentService } from '../api/services'
import type { Employee, EmployeeDTO, Branch, Department, PaginatedResponse, EmploymentStatus } from '../types'

interface EmployeeState {
  employees: PaginatedResponse<Employee> | null
  selectedEmployee: Employee | null
  branches: Branch[]
  departments: Department[]
  isLoading: boolean
  error: string | null
  fetchEmployees: (params?: { page?: number; size?: number; search?: string }) => Promise<void>
  searchEmployees: (params: { name?: string; departmentId?: number; branchId?: number; page?: number; size?: number }) => Promise<void>
  fetchEmployee: (id: number) => Promise<void>
  createEmployee: (data: EmployeeDTO) => Promise<void>
  updateEmployee: (id: number, data: EmployeeDTO) => Promise<void>
  deleteEmployee: (id: number) => Promise<void>
  fetchBranches: () => Promise<void>
  fetchDepartments: () => Promise<void>
  filterByStatus: (status: EmploymentStatus) => Promise<void>
  clearError: () => void
  setSelectedEmployee: (employee: Employee | null) => void
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: null,
  selectedEmployee: null,
  branches: [],
  departments: [],
  isLoading: false,
  error: null,

  fetchEmployees: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const res = await employeeService.list(params)
      set({ employees: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch employees', isLoading: false })
    }
  },

  searchEmployees: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const res = await employeeService.search(params)
      set({ employees: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to search employees', isLoading: false })
    }
  },

  fetchEmployee: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await employeeService.getById(id)
      set({ selectedEmployee: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch employee', isLoading: false })
    }
  },

  createEmployee: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await employeeService.create(data)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to create employee', isLoading: false })
      throw err
    }
  },

  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await employeeService.update(id, data)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to update employee', isLoading: false })
      throw err
    }
  },

  deleteEmployee: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await employeeService.delete(id)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to delete employee', isLoading: false })
      throw err
    }
  },

  fetchBranches: async () => {
    try {
      const res = await branchService.listAll()
      set({ branches: res.data.data })
    } catch {
      // silently fail for branches
    }
  },

  fetchDepartments: async () => {
    try {
      const res = await departmentService.listAll()
      set({ departments: res.data.data })
    } catch {
      // silently fail for departments
    }
  },

  filterByStatus: async (status) => {
    set({ isLoading: true, error: null })
    try {
      const res = await employeeService.getByStatus(status)
      const employees = res.data.data
      set({
        employees: {
          content: employees,
          totalElements: employees.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: employees.length,
        },
        isLoading: false,
      })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to filter employees', isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
}))
