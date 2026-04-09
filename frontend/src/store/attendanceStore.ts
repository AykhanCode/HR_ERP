import { create } from 'zustand'
import { attendanceService } from '../api/services'
import type { AttendanceLog, DailyAttendanceSummary } from '../types'

interface AttendanceState {
  logs: AttendanceLog[]
  summary: DailyAttendanceSummary[]
  isLoading: boolean
  error: string | null
  fetchByRange: (params: { startDate: string; endDate: string; employeeId?: number }) => Promise<void>
  fetchByEmployee: (employeeId: number, params?: { page?: number; size?: number }) => Promise<void>
  fetchSummary: (employeeId: number, params?: { startDate?: string; endDate?: string }) => Promise<void>
  clearError: () => void
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  logs: [],
  summary: [],
  isLoading: false,
  error: null,

  fetchByRange: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const res = await attendanceService.getByRange(params)
      set({ logs: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch attendance', isLoading: false })
    }
  },

  fetchByEmployee: async (employeeId, params) => {
    set({ isLoading: true, error: null })
    try {
      const res = await attendanceService.getByEmployee(employeeId, params)
      set({ logs: res.data.data.content, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch attendance', isLoading: false })
    }
  },

  fetchSummary: async (employeeId, params) => {
    set({ isLoading: true, error: null })
    try {
      const res = await attendanceService.getSummary(employeeId, params)
      set({ summary: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch summary', isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
