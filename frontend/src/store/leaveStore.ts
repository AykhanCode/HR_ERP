import { create } from 'zustand'
import { leaveService } from '../api/services'
import type { LeaveRequest, LeaveRequestDTO, LeaveType, LeaveStatus, PaginatedResponse } from '../types'

interface LeaveState {
  leaves: PaginatedResponse<LeaveRequest> | null
  leaveTypes: LeaveType[]
  isLoading: boolean
  error: string | null
  fetchLeaves: (params?: { page?: number; size?: number }) => Promise<void>
  fetchByStatus: (status: LeaveStatus) => Promise<void>
  fetchByEmployee: (employeeId: number) => Promise<void>
  fetchLeaveTypes: () => Promise<void>
  createLeave: (data: LeaveRequestDTO) => Promise<void>
  approveLeave: (id: number, approverId: number) => Promise<void>
  rejectLeave: (id: number, approverId: number) => Promise<void>
  deleteLeave: (id: number) => Promise<void>
  clearError: () => void
}

export const useLeaveStore = create<LeaveState>((set) => ({
  leaves: null,
  leaveTypes: [],
  isLoading: false,
  error: null,

  fetchLeaves: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const res = await leaveService.list(params)
      set({ leaves: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch leaves', isLoading: false })
    }
  },

  fetchByStatus: async (status) => {
    set({ isLoading: true, error: null })
    try {
      const res = await leaveService.getByStatus(status)
      const data = res.data.data
      set({
        leaves: { content: data, totalElements: data.length, totalPages: 1, currentPage: 0, pageSize: data.length },
        isLoading: false,
      })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch leaves', isLoading: false })
    }
  },

  fetchByEmployee: async (employeeId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await leaveService.getByEmployee(employeeId)
      const data = res.data.data
      set({
        leaves: { content: data, totalElements: data.length, totalPages: 1, currentPage: 0, pageSize: data.length },
        isLoading: false,
      })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch leaves', isLoading: false })
    }
  },

  fetchLeaveTypes: async () => {
    try {
      const res = await leaveService.getTypes()
      set({ leaveTypes: res.data.data })
    } catch {
      // silently fail
    }
  },

  createLeave: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await leaveService.create(data)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to create leave request', isLoading: false })
      throw err
    }
  },

  approveLeave: async (id, approverId) => {
    set({ isLoading: true, error: null })
    try {
      await leaveService.approve(id, approverId)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to approve leave', isLoading: false })
      throw err
    }
  },

  rejectLeave: async (id, approverId) => {
    set({ isLoading: true, error: null })
    try {
      await leaveService.reject(id, approverId)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to reject leave', isLoading: false })
      throw err
    }
  },

  deleteLeave: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await leaveService.delete(id)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to delete leave', isLoading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
