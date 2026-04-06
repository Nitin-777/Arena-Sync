import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (p) => location.pathname === p

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-card' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <div className="w-8 h-8 bg-brand-500 rounded-xl rotate-3 group-hover:rotate-6 transition-transform" />
              <svg className="absolute inset-0 w-8 h-8 p-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="font-display font-black text-xl text-ink-900 tracking-tight">
              arena<span className="text-brand-500">sync</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 p-1 bg-ink-100 rounded-2xl">
            {[
              { to: '/', label: 'Discover' },
              ...(token ? [{ to: '/my-bookings', label: 'My Bookings' }] : [])
            ].map(item => (
              <Link key={item.to} to={item.to}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.to)
                    ? 'bg-white text-ink-900 shadow-card'
                    : 'text-ink-500 hover:text-ink-800'
                }`}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <div className="flex items-center gap-2.5 py-1.5 px-3 bg-ink-100 rounded-2xl">
                  <div className="w-7 h-7 rounded-xl bg-brand-500 flex items-center justify-center text-white text-xs font-black">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-none">
                    <p className="text-xs font-bold text-ink-800">{user.name}</p>
                    <p className="text-[10px] text-ink-400 mt-0.5 capitalize font-medium">{user.role}</p>
                  </div>
                </div>
                <button onClick={logout}
                  className="h-9 px-4 rounded-xl text-sm font-semibold text-ink-500 hover:text-red-500 hover:bg-red-50 transition-all">
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="h-9 px-4 rounded-xl text-sm font-semibold text-ink-600 hover:text-ink-900 transition">
                  Sign in
                </Link>
                <Link to="/login"
                  className="h-9 px-4 rounded-xl text-sm font-black text-white bg-ink-900 hover:bg-ink-700 transition flex items-center gap-1.5">
                  Get Started
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-ink-100 text-ink-600"
            onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/>
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-ink-100 px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-50">Discover</Link>
            {token && <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-50">My Bookings</Link>}
            {token
              ? <button onClick={logout} className="w-full text-left flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">Sign out</button>
              : <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50">Sign in</Link>
            }
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  )
}