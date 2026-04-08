import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  BarChart3,
  Monitor,
  X,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees', roles: ['ADMIN', 'HR'] },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/leaves', icon: Calendar, label: 'Leaves' },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['ADMIN', 'HR'] },
  { to: '/devices', icon: Monitor, label: 'Devices', roles: ['ADMIN'] },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const visible = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.userType))
  )

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-gray-900 transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white"
            aria-label="Go to dashboard"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">HR ERP</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visible.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info */}
        {user && (
          <div className="border-t border-gray-700 px-4 py-4">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="truncate text-sm font-medium text-white">{user.username}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-400">
              {user.userType}
            </span>
          </div>
        )}
      </aside>
    </>
  )
}
