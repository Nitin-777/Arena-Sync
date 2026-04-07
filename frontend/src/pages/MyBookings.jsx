import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBookings, cancelBooking } from '../api'

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

const statusConfig = {
  confirmed:  { label: 'Confirmed',  bg: 'bg-lime-50',   text: 'text-lime-700',   border: 'border-lime-200',   dot: 'bg-lime-500'   },
  pending:    { label: 'Pending',    bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  cancelled:  { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
}

const sportEmoji = {
  football:'⚽', cricket:'🏏', basketball:'🏀', badminton:'🏸', tennis:'🎾'
}

export default function MyBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [cancelling, setCancelling] = useState(null)
  const [error, setError]       = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    getMyBookings()
      .then(r => setBookings(r.data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(id)
    setError('')
    try {
      await cancelBooking(id, 'Cancelled by user')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed')
    }
    setCancelling(null)
  }

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-ink-400 font-semibold text-sm">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-ink-900 noise">
        <div className="max-w-4xl mx-auto px-5 py-10">
          <h1 className="font-display font-black text-4xl text-white mb-1">My Bookings</h1>
          <p className="text-ink-400 font-medium text-sm">Your upcoming and past slot reservations</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-5 text-sm font-semibold">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 mb-6 bg-white border border-ink-200 rounded-2xl p-1 w-fit">
          {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                filter === f ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-800'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-ink-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl">📋</div>
            <h3 className="font-display font-bold text-xl text-ink-800 mb-2">No bookings yet</h3>
            <p className="text-ink-400 text-sm font-medium mb-5">Book a turf to get started</p>
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-ink-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-ink-700 transition-colors">
              Discover Turfs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const cfg = statusConfig[b.status] || statusConfig.pending
              return (
                <div key={b.id} className="bg-white rounded-3xl border border-ink-100 overflow-hidden hover:border-ink-200 transition-all">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ink-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                          {sportEmoji[b.sport] || '🏅'}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-ink-900">{b.turf_name}</h3>
                          <p className="text-ink-400 text-xs font-medium capitalize mt-0.5">{b.sport}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-xl border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        {
                          label: 'Date',
                          value: new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
                          icon: '📅'
                        },
                        {
                          label: 'Time',
                          value: `${formatTime(b.start_time)} – ${formatTime(b.end_time)}`,
                          icon: '⏰'
                        },
                        {
                          label: 'Duration',
                          value: `${b.slot_ids?.length || 1} hr${(b.slot_ids?.length || 1) > 1 ? 's' : ''}`,
                          icon: '⏱'
                        },
                        {
                          label: 'Amount',
                          value: `₹${b.total_amount}`,
                          icon: '💰'
                        },
                      ].map((item, i) => (
                        <div key={i} className="bg-ink-50 rounded-2xl p-3 border border-ink-100">
                          <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-sm font-black text-ink-800">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-ink-400 text-xs font-medium mb-4">
                      <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {b.turf_address}
                    </div>

                    {b.status !== 'cancelled' && (
                      <div className="flex items-center justify-between pt-4 border-t border-ink-100">
                        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                          Booking ID: {b.id.slice(0,8).toUpperCase()}
                        </p>
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelling === b.id}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-all disabled:opacity-50">
                          {cancelling === b.id
                            ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Cancelling...</>
                            : <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Cancel Booking
                              </>
                          }
                        </button>
                      </div>
                    )}

                    {b.status === 'cancelled' && b.cancelled_at && (
                      <div className="pt-4 border-t border-ink-100">
                        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                          Cancelled on {new Date(b.cancelled_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}