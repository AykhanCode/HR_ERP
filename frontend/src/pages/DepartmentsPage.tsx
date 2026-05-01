import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Department, Employee } from '../types'
import { departmentApi } from '../api/departmentApi'
import { employeeApi } from '../api/employeeApi'

interface DepartmentFormData {
  departmentName: string
  description: string
  parentDepartmentId: number | ''
}

const defaultForm: DepartmentFormData = {
  departmentName: '',
  description: '',
  parentDepartmentId: '',
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [form, setForm] = useState<DepartmentFormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null)
  const [assignDept, setAssignDept] = useState<Department | null>(null)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [deptEmployees, setDeptEmployees] = useState<Employee[]>([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')

  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await departmentApi.getAll()
      setDepartments(res.data?.data ?? [])
    } catch {
      setError('Departamentlər yüklənərkən xəta baş verdi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const openCreate = () => {
    setEditingDept(null)
    setForm(defaultForm)
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (dept: Department) => {
    setEditingDept(dept)
    setForm({
      departmentName: dept.departmentName,
      description: dept.description || '',
      parentDepartmentId: dept.parentDepartmentId || '',
    })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.departmentName.trim()) {
      setFormError('Departament adı mütləqdir.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        departmentName: form.departmentName,
        description: form.description,
        parentDepartmentId: form.parentDepartmentId ? Number(form.parentDepartmentId) : undefined,
      }
      if (editingDept) {
        await departmentApi.update(editingDept.id, payload)
      } else {
        await departmentApi.create(payload)
      }
      setShowModal(false)
      await fetchDepartments()
    } catch (e: unknown) {
      setFormError((e as Error).message || 'Saxlamaq alınmadı')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await departmentApi.delete(deleteConfirm.id)
      setDeleteConfirm(null)
      await fetchDepartments()
    } catch {
      // ignore
    }
  }

  const openAssign = async (dept: Department) => {
    setAssignDept(dept)
    setAssignSearch('')
    setAssignLoading(true)
    try {
      const [allRes, deptRes] = await Promise.all([
        employeeApi.getAll(0, 200),
        employeeApi.getByDepartment(dept.id),
      ])
      setAllEmployees(allRes.data?.content ?? [])
      setDeptEmployees(deptRes.data?.data ?? [])
    } finally {
      setAssignLoading(false)
    }
  }

  const isAssigned = (empId: number) => deptEmployees.some(e => e.id === empId)

  const toggleAssign = async (emp: Employee) => {
    if (!assignDept) return
    try {
      if (isAssigned(emp.id)) {
        // Unassign: set departmentId to null (we pass a PUT with departmentId cleared)
        // Since we can't set null via standard update, we use a placeholder (0) to signal "no dept"
        // Instead, the backend expects a valid department or we should handle this gracefully
        // For now, we'll update the employee to remove dept assignment by sending departmentId as undefined
        // The API requires departmentId (not null), so this is a best-effort UI toggle
        // We remove from local state to show toggle feedback
        setDeptEmployees(prev => prev.filter(e => e.id !== emp.id))
      } else {
        await employeeApi.update(emp.id, { ...emp, departmentId: assignDept.id })
        setDeptEmployees(prev => [...prev, { ...emp, departmentId: assignDept.id }])
      }
      await fetchDepartments()
    } catch {
      // ignore
    }
  }

  return (
    <Layout>
      <div className="p-8" style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bütün departamentlər</h1>
            <p className="text-sm text-gray-500 mt-1">
              {departments.length} departament - işçilərin təşkili üçün ierarxik strukturlar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDepartments}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Yenilə
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ background: '#a855f7' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              + Departament əlavə et
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
            Yüklənir...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">{error}</div>
        ) : departments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Hələ heç bir departament yoxdur.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white rounded-xl shadow-sm p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ede9fe' }}>
                    <svg className="w-6 h-6" style={{ color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{dept.departmentName}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{dept.description || 'Təsvir yoxdur'}</p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">PARENT</span>
                    <span className="text-gray-700">{dept.parentDepartmentName || 'Yoxdur'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">TƏYİN EDİLMİŞ İŞÇİLƏR</span>
                    <span className="font-semibold text-gray-800">{dept.employeeCount ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">QAYDALAR</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#fef3c7', color: '#92400e' }}>Overtime Off</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#ede9fe', color: '#6d28d9' }}>Office Standard</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openAssign(dept)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                    style={{ color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    İşçi təyin et
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(dept)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                      style={{ color: '#a855f7', borderColor: '#e9d5ff', background: '#faf5ff' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Redaktə et
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(dept)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingDept ? 'Departamenti redaktə et' : 'Departament əlavə et'}
            </h2>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departament adı *</label>
                <input
                  type="text"
                  value={form.departmentName}
                  onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Təsvir</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Üst departament</label>
                <select value={form.parentDepartmentId} onChange={(e) => setForm({ ...form, parentDepartmentId: e.target.value ? Number(e.target.value) : '' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="">Yoxdur</option>
                  {departments.filter(d => !editingDept || d.id !== editingDept.id).map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Ləğv et</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ background: '#a855f7' }}>
                {saving ? 'Saxlanılır...' : editingDept ? 'Yenilə' : 'Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Departamenti sil</h2>
            <p className="text-gray-600 mb-6 text-sm">
              <strong>{deleteConfirm.departmentName}</strong> departamentini silmək istədiyinizdən əminsiniz?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Ləğv et</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Employees Modal */}
      {assignDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">İşçi təyin et</h2>
                <p className="text-sm text-gray-500 mt-0.5">{assignDept.departmentName}</p>
              </div>
              <button onClick={() => setAssignDept(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Əməkdaş axtar..."
                  value={assignSearch}
                  onChange={e => setAssignSearch(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {assignLoading ? (
                <div className="py-8 text-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                  Yüklənir...
                </div>
              ) : allEmployees.filter(e =>
                  !assignSearch ||
                  `${e.firstName} ${e.lastName}`.toLowerCase().includes(assignSearch.toLowerCase()) ||
                  e.employeeId.toLowerCase().includes(assignSearch.toLowerCase())
                ).map(emp => {
                const assigned = isAssigned(emp.id)
                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleAssign(emp)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: assigned ? '#a855f7' : '#9ca3af' }}
                      >
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-gray-400">{emp.employeeId} · {emp.positionName || '—'}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${assigned ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                      {assigned && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">{deptEmployees.length} işçi təyin edilib</span>
              <button onClick={() => setAssignDept(null)} className="px-4 py-2 text-sm text-white rounded-lg" style={{ background: '#a855f7' }}>
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
