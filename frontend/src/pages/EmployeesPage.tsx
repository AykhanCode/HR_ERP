import { useEffect, useState, useRef, useCallback } from 'react'
import Layout from '../components/Layout'
import { useEmployeeStore } from '../store/employeeStore'
import { Employee, Department, Position } from '../types'
import { departmentApi } from '../api/departmentApi'
import { positionApi } from '../api/positionApi'
import { employeeApi } from '../api/employeeApi'

interface EmployeeFormData {
  firstName: string
  lastName: string
  fatherName: string
  email: string
  mobilePhone: string
  gender: string
  departmentId: number | ''
  positionId: number | ''
  finNumber: string
  hireDate: string
  area: string
  shiftType: string
  employmentStatus: string
}

const defaultForm: EmployeeFormData = {
  firstName: '',
  lastName: '',
  fatherName: '',
  email: '',
  mobilePhone: '',
  gender: '',
  departmentId: '',
  positionId: '',
  finNumber: '',
  hireDate: new Date().toISOString().split('T')[0],
  area: '',
  shiftType: '',
  employmentStatus: 'ACTIVE',
}

const AVATAR_COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function EmployeesPage() {
  const { employees, loading, error, fetchEmployees, filterEmployees, createEmployee, updateEmployee, deleteEmployee, totalPages, currentPage, totalElements } = useEmployeeStore()
  const [search, setSearch] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [filterDept, setFilterDept] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterShift, setFilterShift] = useState<string>('')
  const [filterArea, setFilterArea] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeeFormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const uniqueAreas = Array.from(new Set(employees.map(e => e.area).filter(Boolean))) as string[]
  const uniqueShifts = Array.from(new Set(employees.map(e => e.shiftType).filter(Boolean))) as string[]

  const activeCount = employees.filter(e => e.employmentStatus === 'ACTIVE').length
  const onLeaveCount = employees.filter(e => e.employmentStatus === 'ON_LEAVE').length

  const applyFilters = useCallback((page = 0, searchOverride?: string) => {
    const s = searchOverride !== undefined ? searchOverride : search
    const hasFilters = s || filterDept || filterStatus || filterShift || filterArea
    if (hasFilters) {
      filterEmployees({
        search: s || undefined,
        department: filterDept || undefined,
        status: filterStatus || undefined,
        shift: filterShift || undefined,
        area: filterArea || undefined,
        page,
        size: 20,
      })
    } else {
      fetchEmployees(page, 20)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterDept, filterStatus, filterShift, filterArea])

  useEffect(() => {
    fetchEmployees(0, 20)
    departmentApi.getAll().then((res) => setDepartments(res.data?.data ?? []))
    positionApi.getAll().then((res) => setPositions(res.data?.data ?? []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyFilters(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDept, filterStatus, filterShift, filterArea])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      applyFilters(0, value)
    }, 400)
  }

  const clearSearch = () => {
    setSearch('')
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    applyFilters(0, '')
  }

  const openCreate = () => {
    setEditingEmployee(null)
    setForm(defaultForm)
    setFormError(null)
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowModal(true)
  }

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp)
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      fatherName: emp.fatherName || '',
      email: emp.email || '',
      mobilePhone: emp.mobilePhone || '',
      gender: emp.gender || '',
      departmentId: emp.departmentId || '',
      positionId: emp.positionId || '',
      finNumber: emp.finNumber || '',
      hireDate: emp.hireDate || defaultForm.hireDate,
      area: emp.area || '',
      shiftType: emp.shiftType || '',
      employmentStatus: emp.employmentStatus || 'ACTIVE',
    })
    setFormError(null)
    setPhotoFile(null)
    setPhotoPreview(emp.photoUrl ? getPhotoSrc(emp) : null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('Ad və soyad mütləqdir.')
      return
    }
    if (!form.departmentId) {
      setFormError('Departament mütləqdir.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const payload: Partial<Employee> = {
        firstName: form.firstName,
        lastName: form.lastName,
        fatherName: form.fatherName,
        email: form.email,
        mobilePhone: form.mobilePhone,
        gender: form.gender,
        departmentId: Number(form.departmentId),
        positionId: form.positionId ? Number(form.positionId) : undefined,
        finNumber: form.finNumber,
        hireDate: form.hireDate,
        area: form.area,
        shiftType: form.shiftType,
        employmentStatus: form.employmentStatus as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE',
      }
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, payload)
        if (photoFile) {
          setUploadingPhoto(true)
          try {
            await employeeApi.uploadPhoto(editingEmployee.id, photoFile)
            applyFilters(currentPage)
          } finally {
            setUploadingPhoto(false)
          }
        }
      } else {
        await createEmployee(payload)
        if (photoFile) {
          const currentEmployees = useEmployeeStore.getState().employees
          const newEmp = currentEmployees.find(
            e => e.firstName === form.firstName && e.lastName === form.lastName
          )
          if (newEmp) {
            setUploadingPhoto(true)
            try {
              await employeeApi.uploadPhoto(newEmp.id, photoFile)
              applyFilters(currentPage)
            } finally {
              setUploadingPhoto(false)
            }
          }
        }
      }
      setShowModal(false)
    } catch (e: unknown) {
      setFormError((e as Error).message || 'Saxlamaq alınmadı')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteEmployee(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch {
      // handled by store
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const getPhotoSrc = (emp: Employee) => {
    if (!emp.photoUrl) return null
    if (emp.photoUrl.startsWith('http')) return emp.photoUrl
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:8080'
    return `${base}${emp.photoUrl}`
  }

  return (
    <Layout>
      <div className="p-8" style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bütün əməkdaşlar</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{totalElements ?? employees.length}</span> ümumi ·&nbsp;
              <span className="text-green-600 font-medium">{activeCount} aktiv</span> ·&nbsp;
              <span className="text-yellow-600 font-medium">{onLeaveCount} məzuniyyətdə</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyFilters(currentPage)}
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
              + Əməkdaş əlavə et
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Əməkdaş axtar..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-400">
            <option value="">Bütün departamentlər</option>
            {departments.map(d => <option key={d.id} value={String(d.id)}>{d.departmentName}</option>)}
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-400">
            <option value="">Bütün statuslar</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="INACTIVE">Deaktiv</option>
            <option value="ON_LEAVE">Məzuniyyətdə</option>
          </select>

          <select value={filterShift} onChange={e => setFilterShift(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-400">
            <option value="">Bütün növbələr</option>
            {uniqueShifts.length > 0
              ? uniqueShifts.map(s => <option key={s} value={s}>{s}</option>)
              : <>
                  <option value="Day">Gündüz</option>
                  <option value="Night">Gecə</option>
                  <option value="Flexible">Çevik</option>
                </>
            }
          </select>

          <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-400">
            <option value="">Bütün ərazilər</option>
            {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
            Yüklənir...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">{error}</div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            {search || filterDept || filterStatus || filterShift || filterArea ? 'Filtrə uyğun əməkdaş tapılmadı.' : 'Hələ heç bir əməkdaş yoxdur.'}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ƏMƏLİYYATLAR</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ŞƏKİL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">EMPLOYEE ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AD VƏ SOYAD</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ATA ADI</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DEPARTAMENT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">VƏZİFƏ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ƏRAZİ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp: Employee) => {
                  const name = `${emp.firstName} ${emp.lastName}`
                  const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase()
                  const avatarColor = getAvatarColor(name)
                  const photoSrc = getPhotoSrc(emp)
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-1.5 rounded hover:bg-purple-50 transition-colors"
                            title="Redaktə et"
                          >
                            <svg className="w-4 h-4" style={{ color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(emp)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Sil"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt={name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarColor }}>
                            {initials}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{emp.employeeId}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{name}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.fatherName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.departmentName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.positionName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.area || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={emp.employmentStatus === 'ACTIVE'
                            ? { background: '#d1fae5', color: '#065f46' }
                            : emp.employmentStatus === 'ON_LEAVE'
                            ? { background: '#fef3c7', color: '#92400e' }
                            : { background: '#fee2e2', color: '#991b1b' }}
                        >
                          {emp.employmentStatus === 'ACTIVE' ? 'Aktiv' : emp.employmentStatus === 'ON_LEAVE' ? 'Məzuniyyətdə' : 'Deaktiv'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => applyFilters(currentPage - 1)} disabled={currentPage === 0} className="px-4 py-2 text-sm border border-gray-300 bg-white rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Əvvəlki
            </button>
            <span className="text-sm text-gray-500">Səhifə {currentPage + 1} / {totalPages}</span>
            <button onClick={() => applyFilters(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="px-4 py-2 text-sm border border-gray-300 bg-white rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Növbəti
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingEmployee ? 'Əməkdaşı redaktə et' : 'Əməkdaş əlavə et'}
            </h2>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">{formError}</div>
            )}

            {/* Photo Upload */}
            <div className="mb-4 flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors flex-shrink-0"
                style={!photoPreview ? { background: '#f3f4f6' } : undefined}
                onClick={() => photoInputRef.current?.click()}
                title="Şəkil yükləyin"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {photoPreview ? 'Şəkli dəyişin' : 'Şəkil yükləyin'}
                </button>
                {photoFile && (
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(editingEmployee?.photoUrl ? getPhotoSrc(editingEmployee) : null) }}
                    className="ml-2 text-sm text-red-500 hover:text-red-700"
                  >
                    Ləğv et
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (maks. 5MB)</p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Ad *', key: 'firstName', type: 'text' },
                { label: 'Soyad *', key: 'lastName', type: 'text' },
                { label: 'Ata adı', key: 'fatherName', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Telefon', key: 'mobilePhone', type: 'text' },
                { label: 'FIN nömrə', key: 'finNumber', type: 'text' },
                { label: 'İşə başlama tarixi', key: 'hireDate', type: 'date' },
                { label: 'Ərazi', key: 'area', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as unknown as Record<string, string>)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cins</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="">Seçin...</option>
                  <option value="MALE">Kişi</option>
                  <option value="FEMALE">Qadın</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departament *</label>
                <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : '' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="">Seçin...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vəzifə</label>
                <select value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value ? Number(e.target.value) : '' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="">Seçin...</option>
                  {positions.filter(p => !form.departmentId || p.departmentId === Number(form.departmentId)).map(p => <option key={p.id} value={p.id}>{p.positionName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Növbə</label>
                <select value={form.shiftType} onChange={(e) => setForm({ ...form, shiftType: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="">Seçin...</option>
                  <option value="Day">Gündüz</option>
                  <option value="Night">Gecə</option>
                  <option value="Flexible">Çevik</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.employmentStatus} onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="ACTIVE">Aktiv</option>
                  <option value="INACTIVE">Deaktiv</option>
                  <option value="ON_LEAVE">Məzuniyyətdə</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Ləğv et</button>
              <button onClick={handleSave} disabled={saving || uploadingPhoto} className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ background: '#a855f7' }}>
                {saving || uploadingPhoto ? 'Saxlanılır...' : editingEmployee ? 'Yenilə' : 'Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Əməkdaşı sil</h2>
            <p className="text-gray-600 mb-6 text-sm">
              <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong> adlı əməkdaşı silmək istədiyinizdən əminsiniz? Bu əməliyyat geri alına bilməz.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Ləğv et</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
