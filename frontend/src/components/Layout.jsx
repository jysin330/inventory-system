import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  TrendingUp, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products',  label: 'Products',  icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders',    label: 'Orders',    icon: ShoppingCart },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-ink-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-ink-800 border-r border-ink-600 transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-ink-600">
          <div className="w-8 h-8 bg-jade rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-ink-900" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">StockFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-jade/10 text-jade border border-jade/20'
                      : 'text-ink-300 hover:text-ink-100 hover:bg-ink-700'
                    }
                  `}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ink-600">
          <p className="text-xs text-ink-400">Inventory & Order Management</p>
          <p className="text-xs text-ink-500 mt-0.5">v1.0.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-ink-800 border-b border-ink-600 flex items-center px-6 gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-ink-300 hover:text-ink-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <CurrentPageTitle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function CurrentPageTitle() {
  const { pathname } = useLocation()
  const item = navItems.find(n => pathname.startsWith(n.to))
  return (
    <h1 className="font-display text-lg font-semibold text-white">
      {item?.label ?? 'StockFlow'}
    </h1>
  )
}
