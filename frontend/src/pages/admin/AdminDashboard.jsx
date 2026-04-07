import { useState, useEffect } from 'react'
import { adminGetStats } from '../../api'

const statCards = [
  { key: 'revenue',   label: 'Total Revenue',   prefix: '₹', color: 'text-brand-600', bg: 'bg-brand-50',  border: 'border-brand-100', icon: '💰' },
  { key: 'bookings',  label: 'Total Bookings',  prefix: '',  color: 'text-sky-600',   bg: 'bg-sky-50',    border: 'border-sky-100',   icon: '📅' },
  { key: 'turfs',     label: 'Active Turfs',    prefix: '',  color: 'text-lime-600',  bg: 'bg-lime-50',   border: 'border-lime-100',  icon: '🏟' },
  { key: 'users',     label: 'Total Users',     prefix: '',  color: 'text-purple-600',bg: 'bg-purple-50', border: 'border-purple-100',icon: '👥' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-ink-100 p-5 animate-pulse h-28"/>
          ))}
        </div>
      </div>
    )
  }

  const bookingStats = stats?.bookings || {}
  const turfStats = stats?.turfs || {}
  const userStats = stats?.users || {}

  const statValues = {
    revenue:  Number(stats?.revenue || 0).toLocaleString('en-IN'),
    bookings: bookingStats.total || 0,
    turfs:    turfStats.active || 0,
    users:    userStats.total || 0,
  }

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-ink-900">Dashboard</h1>
        <p className="text-ink-400 font-medium text-sm mt-1">Welcome back — here's what's happening</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.key} className={`bg-white rounded-3xl border ${card.border} p-5`}>
            <div className={`w-10 h-10 ${card.bg} rounded-2xl flex items-center justify-center text-xl mb-3`}>
              {card.icon}
            </div>
            <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className={`font-display font-black text-2xl ${card.color}`}>
              {card.prefix}{statValues[card.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        <div className="lg:col-span-2 bg-white rounded-3xl border border-ink-100 p-5">
          <h2 className="font-display font-bold text-base text-ink-900 mb-5">Booking Status Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Confirmed', value: bookingStats.confirmed || 0, color: 'bg-lime-500', text: 'text-lime-700', bg: 'bg-lime-50' },
              { label: 'Pending',   value: bookingStats.pending   || 0, color: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
              { label: 'Cancelled', value: bookingStats.cancelled || 0, color: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                <p className={`font-display font-black text-3xl ${s.text}`}>{s.value}</p>
                <p className="text-xs font-bold text-ink-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden">
              {[
                { value: Number(bookingStats.confirmed || 0), color: 'bg-lime-500' },
                { value: Number(bookingStats.pending   || 0), color: 'bg-yellow-400' },
                { value: Number(bookingStats.cancelled || 0), color: 'bg-red-400' },
              ].map((s, i) => {
                const total = Number(bookingStats.total || 1)
                const pct = total > 0 ? (s.value / total) * 100 : 0
                return pct > 0 ? (
                  <div key={i} className={`${s.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }}/>
                ) : null
              })}
            </div>
            <div className="flex items-center gap-4 mt-2">
              {[
                { label:'Confirmed', color:'bg-lime-500' },
                { label:'Pending',   color:'bg-yellow-400' },
                { label:'Cancelled', color:'bg-red-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
                  <div className={`w-2 h-2 rounded-full ${s.color}`}/>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-ink-100 p-5">
          <h2 className="font-display font-bold text-base text-ink-900 mb-4">Top Turfs</h2>
          {stats?.topTurfs?.length === 0 ? (
            <p className="text-ink-400 text-sm font-medium text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.topTurfs?.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-ink-100 rounded-xl flex items-center justify-center text-xs font-black text-ink-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-800 truncate">{t.name}</p>
                    <p className="text-xs text-ink-400 font-medium">{t.bookings} bookings</p>
                  </div>
                  <p className="text-sm font-black text-brand-600">₹{Number(t.revenue).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ink-100 p-5">
        <h2 className="font-display font-bold text-base text-ink-900 mb-4">Revenue — Last 7 Days</h2>
        {stats?.revenueByDay?.length === 0 ? (
          <p className="text-ink-400 text-sm font-medium text-center py-8">No revenue data yet</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {stats?.revenueByDay?.map((d, i) => {
              const max = Math.max(...stats.revenueByDay.map(x => Number(x.revenue)))
              const pct = max > 0 ? (Number(d.revenue) / max) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-[9px] font-bold text-ink-400">₹{Number(d.revenue).toLocaleString('en-IN')}</p>
                  <div className="w-full bg-ink-100 rounded-xl overflow-hidden" style={{ height: '80px' }}>
                    <div className="w-full bg-brand-500 rounded-xl transition-all duration-500"
                      style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}/>
                  </div>
                  <p className="text-[9px] font-bold text-ink-400">
                    {new Date(d.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}