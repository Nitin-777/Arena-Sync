import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTurfById, getAvailableSlots, createBooking } from '../api'
import { createPaymentOrder, verifyPayment } from '../api'

const sports = {
  football:   { emoji: '⚽', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cricket:    { emoji: '🏏', color: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-200'     },
  basketball: { emoji: '🏀', color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200'  },
  badminton:  { emoji: '🏸', color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-200'  },
  tennis:     { emoji: '🎾', color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-200'  },
}

const amenityIcons = {
  parking: '🅿', lights: '💡', 'changing rooms': '🚿',
  cafeteria: '☕', wifi: '📶', washrooms: '🚻',
}

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
    }
  })
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export default function TurfDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const days = getNext7Days()

  const [turf, setTurf]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [selectedSport, setSelectedSport] = useState(null)
  const [selectedDate, setSelectedDate]   = useState(days[0].value)
  const [slots, setSlots]             = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState([])
  const [booking, setBooking]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  useEffect(() => {
    getTurfById(id)
      .then(r => {
        setTurf(r.data.turf)
        if (r.data.turf.sports?.length > 0) {
          setSelectedSport(r.data.turf.sports.filter(Boolean)[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedSport || !selectedDate) return
    setSlotsLoading(true)
    setSelectedSlots([])
    getAvailableSlots(selectedSport.id, selectedDate)
      .then(r => setSlots(r.data.slots))
      .catch(console.error)
      .finally(() => setSlotsLoading(false))
  }, [selectedSport, selectedDate])

  const handleSlotClick = (slot) => {
    const isSelected = selectedSlots.find(s => s.id === slot.id)

    if (isSelected) {
      const idx = selectedSlots.findIndex(s => s.id === slot.id)
      if (idx === 0 && selectedSlots.length > 1) {
        setSelectedSlots(selectedSlots.slice(1))
      } else {
        setSelectedSlots(selectedSlots.slice(0, idx))
      }
      return
    }

    if (selectedSlots.length === 0) {
      setSelectedSlots([slot])
      return
    }

    const sorted = [...selectedSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
    const last = sorted[sorted.length - 1]
    const first = sorted[0]

    if (slot.start_time === last.end_time) {
      setSelectedSlots([...selectedSlots, slot])
    } else if (slot.end_time === first.start_time) {
      setSelectedSlots([slot, ...selectedSlots])
    } else {
      setSelectedSlots([slot])
    }
  }

  const totalAmount = selectedSlots.length * (selectedSport?.base_price || 0)

const handleBooking = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    navigate('/login')
    return
  }

  if (selectedSlots.length === 0) {
    setError('Please select at least one slot')
    return
  }

  setBooking(true)
  setError('')

  try {
    const sorted = [...selectedSlots].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    )

    const bookingRes = await createBooking({
      turf_sport_id: selectedSport.id,
      slot_ids: sorted.map(s => s.id),
      date: selectedDate,
    })

    const { booking } = bookingRes.data

    const orderRes = await createPaymentOrder(booking.id)
    const { order_id, amount, currency, key_id } = orderRes.data

    const options = {
      key: key_id,
      amount,
      currency,
      name: 'ArenaSync',
      description: `${selectedSport.sport} booking at ${turf.name}`,
      order_id,
      handler: async (response) => {
        try {
          await verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            booking_id:          booking.id,
          })
          setSuccess('Payment successful! Booking confirmed.')
          setTimeout(() => navigate('/my-bookings'), 2000)
        } catch {
          setError('Payment verification failed. Contact support.')
        }
      },
      prefill: {
        name:  JSON.parse(localStorage.getItem('user') || '{}').name || '',
        contact: JSON.parse(localStorage.getItem('user') || '{}').phone || '',
      },
      theme: { color: '#f97316' },
      modal: {
        ondismiss: () => {
          setError('Payment cancelled. Your slots are held for 10 minutes.')
          setBooking(false)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (err) {
    setError(err.response?.data?.message || 'Booking failed. Try again.')
    setBooking(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-ink-400 font-semibold text-sm">Loading turf details...</p>
        </div>
      </div>
    )
  }

  if (!turf) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏟</div>
          <h2 className="font-display font-bold text-2xl text-ink-800 mb-2">Turf not found</h2>
          <button onClick={() => navigate('/')} className="mt-4 bg-ink-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold">
            Back to Discover
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50">

      <div className="relative h-72 bg-ink-900 overflow-hidden noise">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(249,115,22,0.15)_0%,transparent_70%)]"/>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[200px] opacity-[0.04] select-none">🏟</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent"/>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-ink-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
              </svg>
              Back to Discover
            </button>

            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-lime-400/20 border border-lime-400/30 text-lime-400 text-[11px] font-black px-2.5 py-1 rounded-xl mb-3 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse"/>
                  Open Now
                </span>
                <h1 className="font-display font-black text-4xl text-white tracking-tight">{turf.name}</h1>
                <div className="flex items-center gap-1.5 mt-2 text-ink-400 text-sm font-medium">
                  <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {turf.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">

            <div className="bg-white rounded-3xl border border-ink-100 p-5">
              <h2 className="font-display font-bold text-base text-ink-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-xs">1</span>
                Select Sport
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {turf.sports?.filter(Boolean).map((s, i) => {
                  const cfg = sports[s.sport] || { emoji:'🏅', color:'text-ink-700', bg:'bg-ink-50', border:'border-ink-200' }
                  const isActive = selectedSport?.id === s.id
                  return (
                    <button key={i} onClick={() => setSelectedSport(s)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        isActive
                          ? 'border-ink-900 bg-ink-900 text-white'
                          : `${cfg.bg} ${cfg.border} hover:border-ink-400`
                      }`}>
                      <span className="text-2xl">{cfg.emoji}</span>
                      <div>
                        <p className={`text-sm font-black capitalize ${isActive ? 'text-white' : cfg.color}`}>{s.sport}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-ink-300' : 'text-ink-400'}`}>
                          ₹{s.base_price}/hr
                        </p>
                      </div>
                      {isActive && (
                        <div className="ml-auto w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-ink-100 p-5">
              <h2 className="font-display font-bold text-base text-ink-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-xs">2</span>
                Select Date
              </h2>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {days.map(d => (
                  <button key={d.value} onClick={() => setSelectedDate(d.value)}
                    className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all flex-shrink-0 min-w-[72px] ${
                      selectedDate === d.value
                        ? 'bg-ink-900 border-ink-900 text-white'
                        : 'bg-ink-50 border-ink-200 text-ink-600 hover:border-ink-400'
                    }`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedDate === d.value ? 'text-ink-400' : 'text-ink-400'}`}>
                      {d.day}
                    </span>
                    <span className={`font-display font-black text-xl mt-0.5 ${selectedDate === d.value ? 'text-white' : 'text-ink-900'}`}>
                      {d.date}
                    </span>
                    <span className={`text-[10px] font-bold ${selectedDate === d.value ? 'text-ink-400' : 'text-ink-400'}`}>
                      {d.month}
                    </span>
                    {d.label === 'Today' && (
                      <span className={`text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-md ${selectedDate === d.value ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-700'}`}>
                        TODAY
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-ink-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-base text-ink-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-xs">3</span>
                  Select Slots
                </h2>
                {selectedSlots.length > 0 && (
                  <button onClick={() => setSelectedSlots([])}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-ink-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-ink-100 border border-ink-200 rounded"/>
                  Available
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-ink-900 rounded"/>
                  Selected
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-ink-300 rounded"/>
                  Booked
                </div>
              </div>

              {slotsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-14 bg-ink-100 rounded-2xl animate-pulse"/>
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="font-bold text-ink-700 text-sm">No slots available</p>
                  <p className="text-ink-400 text-xs font-medium mt-1">Try another date</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(slot => {
                    const isSelected = selectedSlots.find(s => s.id === slot.id)
                    return (
                      <button key={slot.id} onClick={() => handleSlotClick(slot)}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 transition-all text-center ${
                          isSelected
                            ? 'bg-ink-900 border-ink-900 text-white scale-[0.97]'
                            : 'bg-ink-50 border-ink-200 text-ink-700 hover:border-brand-400 hover:bg-brand-50'
                        }`}>
                        <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-ink-800'}`}>
                          {formatTime(slot.start_time)}
                        </span>
                        <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-ink-400' : 'text-ink-400'}`}>
                          to {formatTime(slot.end_time)}
                        </span>
                        {isSelected && (
                          <div className="mt-1.5 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedSlots.length > 0 && (
                <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-brand-700">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected —
                  {' '}{formatTime([...selectedSlots].sort((a,b)=>a.start_time.localeCompare(b.start_time))[0].start_time)}
                  {' '}to{' '}
                  {formatTime([...selectedSlots].sort((a,b)=>a.start_time.localeCompare(b.start_time))[selectedSlots.length-1].end_time)}
                  {' '}· {selectedSlots.length} hr{selectedSlots.length > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {turf.amenities?.length > 0 && (
              <div className="bg-white rounded-3xl border border-ink-100 p-5">
                <h2 className="font-display font-bold text-base text-ink-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {turf.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-ink-50 rounded-2xl border border-ink-100">
                      <span className="text-xl">{amenityIcons[a] || '✓'}</span>
                      <span className="text-sm font-semibold text-ink-700 capitalize">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              <div className="bg-white rounded-3xl border border-ink-100 p-5">
                <h2 className="font-display font-bold text-base text-ink-900 mb-4">Booking Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400 font-medium">Sport</span>
                    <span className="font-bold text-ink-800 capitalize">
                      {selectedSport ? `${sports[selectedSport.sport]?.emoji || ''} ${selectedSport.sport}` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400 font-medium">Date</span>
                    <span className="font-bold text-ink-800">
                      {new Date(selectedDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400 font-medium">Duration</span>
                    <span className="font-bold text-ink-800">
                      {selectedSlots.length > 0 ? `${selectedSlots.length} hr${selectedSlots.length > 1 ? 's' : ''}` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400 font-medium">Time</span>
                    <span className="font-bold text-ink-800">
                      {selectedSlots.length > 0
                        ? `${formatTime([...selectedSlots].sort((a,b)=>a.start_time.localeCompare(b.start_time))[0].start_time)} – ${formatTime([...selectedSlots].sort((a,b)=>a.start_time.localeCompare(b.start_time))[selectedSlots.length-1].end_time)}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400 font-medium">Rate</span>
                    <span className="font-bold text-ink-800">₹{selectedSport?.base_price || 0}/hr</span>
                  </div>

                  <div className="h-px bg-ink-100 my-1"/>

                  <div className="flex items-center justify-between">
                    <span className="font-black text-ink-900">Total</span>
                    <div className="text-right">
                      <span className="font-display font-black text-2xl text-ink-900">₹{totalAmount}</span>
                      {selectedSlots.length > 1 && (
                        <p className="text-[10px] text-ink-400 font-medium">₹{selectedSport?.base_price} × {selectedSlots.length} hrs</p>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2.5 rounded-xl mb-4 text-xs font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                    </svg>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 bg-lime-50 border border-lime-200 text-lime-700 px-3 py-2.5 rounded-xl mb-4 text-xs font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {success}
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={booking || selectedSlots.length === 0}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-ink-200 disabled:text-ink-400 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group">
                  {booking
                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Booking...</>
                    : selectedSlots.length === 0
                    ? 'Select slots to book'
                    : <><span>Confirm Booking · ₹{totalAmount}</span><svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                  }
                </button>

                <p className="text-center text-ink-400 text-[10px] font-semibold mt-3 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  Slots locked for 10 mins after booking
                </p>
              </div>

              <div className="bg-ink-900 noise rounded-3xl p-5">
                <h3 className="font-display font-bold text-sm text-white mb-3">Cancellation Policy</h3>
                <div className="space-y-2.5">
                  {[
                    { time: '24+ hrs before', refund: '100% refund', color: 'text-lime-400' },
                    { time: '6–24 hrs before', refund: '50% refund',  color: 'text-yellow-400' },
                    { time: 'Less than 6 hrs', refund: 'No refund',   color: 'text-red-400'    },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-ink-400 text-xs font-medium">{p.time}</span>
                      <span className={`text-xs font-black ${p.color}`}>{p.refund}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}