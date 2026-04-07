import { useState, useEffect } from 'react'
import { adminGetAllBookings } from '../../api'

const statusConfig = {
  confirmed: { bg:'bg-lime-50',   text:'text-lime-700',   border:'border-lime-200',   dot:'bg-lime-500'   },
  pending:   { bg:'bg-yellow-50', text:'text-yellow-700', border:'border-yellow-200', dot:'bg-yellow-500' },
  cancelled: { bg:'bg-red-50',    text:'text-red-700',    border:'border-red-200',    dot:'bg-red-500'    },
}

const sportEmoji = { football:'⚽', cricket:'🏏', basketball:'🏀', badminton:'🏸', tennis:'🎾' }

function formatTime(t) {
  if (!t) return ''
  const [h] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:00 ${ampm}`
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    adminGetAllBookings()
      .then(r => setBookings(r.data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter
    const matchSearch = search === '' ||
      b.turf_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_phone?.includes(search)
    return matchFilter && matchSearch
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl text-ink-900">All Bookings</h1>
        <p className="text-ink-400 font-medium text-sm mt-1">{bookings.length} total bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-1 bg-white border border-ink-200 rounded-2xl p-1">
          {['all','confirmed','pending','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                filter === f ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-800'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white border border-ink-200 rounded-2xl px-4">
          <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by turf, user name or phone..."
            className="flex-1 py-2.5 text-sm font-medium text-ink-800 placeholder-ink-300 focus:outline-none bg-transparent"/>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-3xl border border-ink-100 h-24 animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-bold text-ink-700">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  {['Booking', 'User', 'Turf & Sport', 'Date & Time', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-ink-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(b => {
                  const cfg = statusConfig[b.status] || statusConfig.pending
                  return (
                    <tr key={b.id} className="hover:bg-ink-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-ink-500 font-mono">{b.id.slice(0,8).toUpperCase()}</p>
                        <p className="text-[10px] text-ink-400 font-medium mt-0.5">
                          {new Date(b.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-ink-800">{b.user_name}</p>
                        <p className="text-xs text-ink-400 font-medium">{b.user_phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-ink-800">{b.turf_name}</p>
                        <p className="text-xs text-ink-400 font-medium capitalize">
                          {sportEmoji[b.sport]} {b.sport}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-ink-800">
                          {new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                        <p className="text-xs text-ink-400 font-medium">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-ink-900">₹{b.total_amount}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}