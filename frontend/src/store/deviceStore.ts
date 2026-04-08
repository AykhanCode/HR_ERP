import { create } from 'zustand'
import { deviceService } from '../api/services'
import type { Device, DeviceDTO, DeviceSyncRecord } from '../types'

interface DeviceState {
  devices: Device[]
  syncHistory: DeviceSyncRecord[]
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  fetchDevices: () => Promise<void>
  createDevice: (data: DeviceDTO) => Promise<void>
  updateDevice: (id: number, data: DeviceDTO) => Promise<void>
  deleteDevice: (id: number) => Promise<void>
  syncDevice: (deviceId: number) => Promise<void>
  fetchSyncHistory: (deviceId: number) => Promise<void>
  fetchRecentSyncHistory: () => Promise<void>
  clearError: () => void
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  syncHistory: [],
  isLoading: false,
  isSyncing: false,
  error: null,

  fetchDevices: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await deviceService.list()
      set({ devices: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch devices', isLoading: false })
    }
  },

  createDevice: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await deviceService.create(data)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to create device', isLoading: false })
      throw err
    }
  },

  updateDevice: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await deviceService.update(id, data)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to update device', isLoading: false })
      throw err
    }
  },

  deleteDevice: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await deviceService.delete(id)
      set({ isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to delete device', isLoading: false })
      throw err
    }
  },

  syncDevice: async (deviceId) => {
    set({ isSyncing: true, error: null })
    try {
      await deviceService.sync(deviceId)
      set({ isSyncing: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Sync failed', isSyncing: false })
      throw err
    }
  },

  fetchSyncHistory: async (deviceId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await deviceService.getSyncHistory(deviceId)
      set({ syncHistory: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch sync history', isLoading: false })
    }
  },

  fetchRecentSyncHistory: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await deviceService.getRecentSyncHistory()
      set({ syncHistory: res.data.data, isLoading: false })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      set({ error: error.response?.data?.message ?? 'Failed to fetch sync history', isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
