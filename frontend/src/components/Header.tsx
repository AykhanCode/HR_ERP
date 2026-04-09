import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface HeaderProps {
  onToggleSidebar: () => void
}

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leaves': 'Leaves',
  '/reports': 'Reports',
  '/devices': 'Devices',
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const breadcrumb = BREADCRUMBS[location.pathname] ?? ''

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm">
            <li className="text-gray-400">HR ERP</li>
            {breadcrumb && (
              <>
                <li className="text-gray-400">/</li>
                <li className="font-medium text-gray-900">{breadcrumb}</li>
              </>
            )}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="hidden sm:inline">{user?.username}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              role="menu"
            >
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  navigate('/profile')
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                role="menuitem"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


