import { useState, useEffect } from 'react'
import { adminGetAllBookings } from '../../api'

const STATUS = {
  confirmed: { dot: '#22c55e', bg: '#f0fdf4', text: '#15803d' },
  pending:   { dot: '#eab308', bg: '#fefce8', text: '#a16207' },
  cancelled: { dot: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
}

const sportEmoji = { football:'⚽', cricket:'🏏', basketball:'🏀', badminton:'🏸', tennis:'🎾' }

function fmt(t) {
  if (!t) return ''
  const h = parseInt(t.split(':')[0])
  return `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`
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

  const filtered = bookings.filter(b =>
    (filter === 'all' || b.status === filter) &&
    (search === '' ||
      b.turf_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_phone?.includes(search))
  )

  return (
    <div className="p-8">

      <div className="mb-7">
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.03em' }}>
          Bookings
        </h1>
        <p style={{ fontSize: 13, color: '#999', marginTop: 4, fontWeight: 500 }}>
          {bookings.length} total bookings
        </p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex p-1 rounded-xl gap-0.5" style={{ background: '#E8E8E4' }}>
          {['all','confirmed','pending','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg capitalize transition-all"
              style={{
                fontSize: 12, fontWeight: 700,
                background: filter === f ? '#0F0F0F' : 'transparent',
                color:      filter === f ? '#fff'    : '#777',
              }}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 rounded-xl flex-1 max-w-xs"
          style={{ background: '#fff', border: '1px solid #E8E8E4', height: 38 }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings..."
            style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#0F0F0F', background: 'transparent', outline: 'none', border: 'none' }}
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E8E8E4' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: '#999', fontSize: 13 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center" style={{ color: '#bbb', fontSize: 13 }}>No bookings found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F4F4F0' }}>
                {['ID', 'Customer', 'Turf', 'Date & Time', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5"
                    style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const s = STATUS[b.status] || STATUS.pending
                return (
                  <tr key={b.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F4F4F0' : 'none' }}
                    className="transition-colors hover:bg-stone-50">
                    <td className="px-5 py-4">
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', fontFamily: 'monospace' }}>
                        #{b.id.slice(0,8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>{b.user_name}</p>
                      <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{b.user_phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>{b.turf_name}</p>
                      <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                        {sportEmoji[b.sport]} {b.sport}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>
                        {new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                      <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                        {fmt(b.start_time)} – {fmt(b.end_time)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#0F0F0F' }}>₹{b.total_amount}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: s.bg, fontSize: 11, fontWeight: 700, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }}/>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}