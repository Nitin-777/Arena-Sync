import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const nav = [
  {
    to: '/admin',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    )
  },
  {
    to: '/admin/bookings',
    label: 'Bookings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    )
  },
  {
    to: '/admin/turfs',
    label: 'Turfs',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z"/>
      </svg>
    )
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    )
  },
]

export default function AdminLayout() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const user      = JSON.parse(localStorage.getItem('user') || '{}')
  const [collapsed, setCollapsed] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F4F0', fontFamily: "'Inter', sans-serif" }}>

      <aside className={`flex-shrink-0 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}
        style={{ background: '#0F0F0F', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>

        <div className={`flex items-center h-14 px-4 border-b ${collapsed ? 'justify-center' : 'justify-between'}`}
          style={{ borderColor: '#1a1a1a' }}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: '#F97316' }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.02em' }}>
                arena<span style={{ color: '#F97316' }}>sync</span>
              </span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 flex items-center justify-center rounded-md transition-colors"
            style={{ color: '#555' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}/>
            </svg>
          </button>
        </div>

        {!collapsed && (
          <div className="px-3 pt-4 pb-2">
            <p style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 8 }}>
              Menu
            </p>
          </div>
        )}

        <nav className="flex-1 px-2 space-y-0.5">
          {nav.map(item => {
            const active = isActive(item.to)
            return (
              <Link key={item.to} to={item.to}
                title={collapsed ? item.label : ''}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${collapsed ? 'justify-center' : ''}`}
                style={{
                  background:  active ? '#1a1a1a' : 'transparent',
                  color:       active ? '#fff'    : '#666',
                  fontWeight:  active ? 600       : 500,
                  fontSize:    13,
                }}>
                <span style={{ color: active ? '#F97316' : 'inherit', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#F97316' }}/>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-2 pb-4 space-y-0.5">
          <div style={{ height: 1, background: '#1a1a1a', margin: '8px 8px 12px' }}/>

          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: '#141414' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: '#F97316' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }} className="truncate">{user.name}</p>
                <p style={{ fontSize: 10, color: '#555', marginTop: 2, fontWeight: 500 }}>Administrator</p>
              </div>
            </div>
          )}

          <Link to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''}`}
            style={{ color: '#555', fontSize: 13, fontWeight: 500 }}
            title={collapsed ? 'View Site' : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            {!collapsed && 'View Site'}
          </Link>

          <button onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''}`}
            style={{ color: '#555', fontSize: 13, fontWeight: 500 }}
            title={collapsed ? 'Sign out' : ''}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'} min-h-screen`}
        style={{ background: '#F4F4F0' }}>
        <Outlet />
      </main>
    </div>
  )
}