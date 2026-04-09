import { useState, useEffect } from 'react'
import { adminGetStats } from '../../api'

function StatCard({ label, value, sub, trend }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: '#fff', border: '1px solid #E8E8E4' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{sub}</p>
      )}
    </div>
  )
}

function RevenueBar({ data }) {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-32" style={{ color: '#bbb', fontSize: 13 }}>
      No revenue data yet
    </div>
  )
  const max = Math.max(...data.map(d => Number(d.revenue)))
  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {data.map((d, i) => {
        const pct = max > 0 ? (Number(d.revenue) / max) * 100 : 0
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="relative w-full flex items-end" style={{ height: 80 }}>
              <div className="w-full rounded-xl transition-all duration-500 group-hover:opacity-80 cursor-pointer"
                style={{
                  height: `${Math.max(pct, 4)}%`,
                  background: pct > 70 ? '#0F0F0F' : pct > 40 ? '#555' : '#D1D1CB',
                }}
              />
            </div>
            <p style={{ fontSize: 10, color: '#999', fontWeight: 600 }}>
              {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: '#E8E8E4' }}/>
          ))}
        </div>
      </div>
    )
  }

  const b  = stats?.bookings    || {}
  const t  = stats?.turfs       || {}
  const u  = stats?.users       || {}
  const rt = stats?.revenueToday || {}

  return (
    <div className="p-8 max-w-6xl">

      <div className="mb-8">
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.03em' }}>
          Overview
        </h1>
        <p style={{ fontSize: 13, color: '#999', marginTop: 4, fontWeight: 500 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Total Revenue"
          value={`₹${Number(stats?.revenue || 0).toLocaleString('en-IN')}`}
          sub="All confirmed bookings"
        />
        <StatCard
          label="Total Bookings"
          value={b.total || 0}
          sub={`${b.confirmed || 0} confirmed`}
        />
        <StatCard
          label="Active Turfs"
          value={t.active || 0}
          sub={`${t.total || 0} total`}
        />
        <StatCard
          label="Users"
          value={u.total || 0}
          sub="Registered accounts"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: "Today",      value: `₹${Number(rt.today || 0).toLocaleString('en-IN')}` },
          { label: "This Week",  value: `₹${Number(rt.week  || 0).toLocaleString('en-IN')}` },
          { label: "This Month", value: `₹${Number(rt.month || 0).toLocaleString('en-IN')}` },
        ].map(item => (
          <div key={item.label} className="rounded-2xl p-5"
            style={{ background: '#0F0F0F', border: '1px solid #1a1a1a' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {item.label}
            </p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginTop: 10, lineHeight: 1 }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">

        <div className="col-span-2 rounded-2xl p-6"
          style={{ background: '#fff', border: '1px solid #E8E8E4' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F0F0F' }}>
                Revenue — Last 7 Days
              </p>
              <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Daily confirmed booking revenue</p>
            </div>
          </div>
          <RevenueBar data={stats?.revenueByDay} />
        </div>

        <div className="rounded-2xl p-6"
          style={{ background: '#fff', border: '1px solid #E8E8E4' }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F0F0F', marginBottom: 16 }}>
            Booking Status
          </p>
          <div className="space-y-3">
            {[
              { label: 'Confirmed', value: b.confirmed || 0, total: b.total || 1, color: '#0F0F0F' },
              { label: 'Pending',   value: b.pending   || 0, total: b.total || 1, color: '#D1D1CB' },
              { label: 'Cancelled', value: b.cancelled || 0, total: b.total || 1, color: '#E8E8E4' },
            ].map(s => {
              const pct = s.total > 0 ? Math.round((s.value / s.total) * 100) : 0
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{s.label}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0F0F0F' }}>{s.value}</p>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: '#F4F4F0' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: s.color }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6"
        style={{ background: '#fff', border: '1px solid #E8E8E4' }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F0F0F', marginBottom: 16 }}>
          Top Turfs by Revenue
        </p>
        {!stats?.topTurfs?.length ? (
          <p style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: '24px 0' }}>No data yet</p>
        ) : (
          <div className="space-y-2">
            {stats.topTurfs.map((t, i) => {
              const maxRev = Number(stats.topTurfs[0]?.revenue || 1)
              const pct = maxRev > 0 ? (Number(t.revenue) / maxRev) * 100 : 0
              return (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-colors"
                  style={{ background: i === 0 ? '#F4F4F0' : 'transparent' }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#ccc', width: 16, textAlign: 'center' }}>
                    {i + 1}
                  </p>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>{t.name}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#0F0F0F' }}>
                        ₹{Number(t.revenue).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: '#E8E8E4' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#0F0F0F' }}/>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#999', fontWeight: 600, width: 60, textAlign: 'right' }}>
                    {t.bookings} bookings
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