import client from './client'
import { Employee, PaginatedResponse } from '../types'

export interface EmployeeFilterParams {
  status?: string
  department?: string
  shift?: string
  area?: string
  search?: string
  page?: number
  size?: number
}

export const employeeApi = {
  getAll: (page = 0, size = 20) =>
    client.get<PaginatedResponse<Employee>>(`/employees?page=${page}&size=${size}`),
  getById: (id: number) => client.get<{ data: Employee }>(`/employees/${id}`),
  create: (data: Partial<Employee>) => client.post<{ data: Employee }>('/employees', data),
  update: (id: number, data: Partial<Employee>) => client.put<{ data: Employee }>(`/employees/${id}`, data),
  delete: (id: number) => client.delete(`/employees/${id}`),
  search: (q: string, page = 0, size = 20) =>
    client.get<PaginatedResponse<Employee>>(`/employees/search?q=${q}&page=${page}&size=${size}`),
  getByBranch: (branchId: number, page = 0, size = 20) =>
    client.get<PaginatedResponse<Employee>>(`/employees/branch/${branchId}?page=${page}&size=${size}`),
  getByDepartment: (departmentId: number) =>
    client.get<{ data: Employee[] }>(`/employees/department/${departmentId}`),
  filter: (params: EmployeeFilterParams) => {
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    if (params.department) query.append('department', params.department)
    if (params.shift) query.append('shift', params.shift)
    if (params.area) query.append('area', params.area)
    if (params.search) query.append('search', params.search)
    query.append('page', String(params.page ?? 0))
    query.append('size', String(params.size ?? 20))
    return client.get<PaginatedResponse<Employee>>(`/employees/filter?${query.toString()}`)
  },
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post<{ data: Employee }>(`/employees/${id}/upload-photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
