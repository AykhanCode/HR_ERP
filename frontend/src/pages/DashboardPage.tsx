import { useEffect, useState } from 'react'
import { Users, Clock, Calendar, Monitor } from 'lucide-react'
import { employeeService, attendanceService, leaveService, deviceService } from '../api/services'
import LoadingSpinner from '../components/LoadingSpinner'

interface Stats {
  totalEmployees: number
  presentToday: number
  pendingLeaves: number
  activeDevices: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    activeDevices: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const [empRes, attendanceRes, leaveRes, deviceRes] = await Promise.allSettled([
          employeeService.list({ size: 1 }),
          attendanceService.getByRange({ startDate: today, endDate: today }),
          leaveService.getByStatus('PENDING'),
          deviceService.list(),
        ])

        setStats({
          totalEmployees:
            empRes.status === 'fulfilled' ? empRes.value.data.data.totalElements : 0,
          presentToday:
            attendanceRes.status === 'fulfilled' ? attendanceRes.value.data.data.length : 0,
          pendingLeaves:
            leaveRes.status === 'fulfilled' ? leaveRes.value.data.data.length : 0,
          activeDevices:
            deviceRes.status === 'fulfilled'
              ? deviceRes.value.data.data.filter((d) => d.isActive).length
              : 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: Clock,
      color: 'bg-green-500',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: Calendar,
      color: 'bg-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Active Devices',
      value: stats.activeDevices,
      icon: Monitor,
      color: 'bg-purple-500',
      bg: 'bg-purple-50',
    },
  ]

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." size="lg" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, color, bg }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 text-white`} style={{ color: undefined }}
                  aria-hidden="true"
                />
                {/* Use the color class via wrapping div */}
                <span className="sr-only">{title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Employee Management</p>
                <p className="text-xs text-blue-600">{stats.totalEmployees} total employees</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-yellow-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-900">Pending Approvals</p>
                <p className="text-xs text-yellow-600">{stats.pendingLeaves} leave requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
