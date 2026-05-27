import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '概述', icon: '📊' },
  { path: '/day/1', label: 'Day 1 推日', icon: '🏋️' },
  { path: '/day/2', label: 'Day 2 拉日', icon: '🔙' },
  { path: '/day/3', label: 'Day 3 腿日', icon: '🦵' },
  { path: '/principles', label: '训练原则', icon: '📋' }
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f0f0f]/80 border-b border-[#2a2a2a]">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#ff6b35]/15 text-[#ff8c5a]'
                  : 'text-[#999] hover:text-[#e8e6e3] hover:bg-[#ffffff08]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
