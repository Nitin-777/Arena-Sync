import { useState } from 'react'
import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:3000/api' })
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const sportOptions = ['football', 'cricket', 'basketball', 'badminton', 'tennis']
const amenityOptions = ['parking', 'lights', 'changing rooms', 'cafeteria', 'wifi', 'washrooms']

export default function AddTurfModal({ onClose, onSuccess }) {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    amenities: [],
  })

  const [sports, setSports] = useState([
    {
      sport: 'football',
      base_price: '',
      open_time: '06:00',
      close_time: '22:00',
      slot_duration_min: 60,
    },
  ])

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }))
  }

  const addSport = () => {
    setSports(prev => [
      ...prev,
      {
        sport: 'cricket',
        base_price: '',
        open_time: '06:00',
        close_time: '22:00',
        slot_duration_min: 60,
      },
    ])
  }

  const removeSport = (i) => {
    setSports(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateSport = (i, field, value) => {
    setSports(prev =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    )
  }

  const goToStep2 = () => {
    if (!form.name.trim()) return setError('Turf name is required')
    if (!form.address.trim()) return setError('Address is required')
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    if (sports.length === 0) return setError('Add at least one sport')
    for (const s of sports) {
      if (!s.base_price || isNaN(Number(s.base_price)) || Number(s.base_price) <= 0) {
        return setError(`Enter a valid base price for ${s.sport}`)
      }
    }

    setLoading(true)
    setError('')

    try {
      await API.post('/turfs', {
        name:      form.name.trim(),
        address:   form.address.trim(),
        latitude:  form.latitude  ? Number(form.latitude)  : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        amenities: form.amenities,
        images:    [],
        sports:    sports.map(s => ({
          sport:            s.sport,
          base_price:       Number(s.base_price),
          open_time:        s.open_time,
          close_time:       s.close_time,
          slot_duration_min: Number(s.slot_duration_min),
        })),
      })
      onSuccess()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to create turf. Try again.')
    }

    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="flex items-center justify-between p-6 border-b border-ink-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="font-display font-black text-xl text-ink-900">Add New Turf</h2>
            <div className="flex items-center gap-2 mt-1.5">
              {[1, 2].map(s => (
                <div key={s} className={`h-1 rounded-full transition-all ${
                  step >= s ? 'bg-brand-500 w-8' : 'bg-ink-200 w-4'
                }`}/>
              ))}
              <span className="text-xs font-bold text-ink-400">Step {step} of 2</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-ink-100 hover:bg-ink-200 transition text-ink-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-4 text-xs font-bold">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-1.5">
                  Turf Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Green Field Arena"
                  className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 placeholder-ink-300 px-4 py-3 rounded-2xl focus:outline-none transition text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-1.5">
                  Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Full address including city"
                  rows={2}
                  className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 placeholder-ink-300 px-4 py-3 rounded-2xl focus:outline-none transition text-sm font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    value={form.latitude}
                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                    placeholder="28.6139"
                    className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 placeholder-ink-300 px-4 py-3 rounded-2xl focus:outline-none transition text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    value={form.longitude}
                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                    placeholder="77.2090"
                    className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 placeholder-ink-300 px-4 py-3 rounded-2xl focus:outline-none transition text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-2">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all capitalize ${
                        form.amenities.includes(a)
                          ? 'bg-ink-900 text-white border-ink-900'
                          : 'bg-ink-50 text-ink-600 border-ink-200 hover:border-ink-400'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={goToStep2}
                className="w-full bg-ink-900 hover:bg-ink-700 text-white py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group"
              >
                Next: Add Sports
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {sports.map((s, i) => (
                <div key={i} className="bg-ink-50 border-2 border-ink-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-ink-700 uppercase tracking-widest">
                      Sport {i + 1}
                    </p>
                    {sports.length > 1 && (
                      <button
                        onClick={() => removeSport(i)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-ink-500 uppercase tracking-widest mb-1">Sport</label>
                      <select
                        value={s.sport}
                        onChange={e => updateSport(i, 'sport', e.target.value)}
                        className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-800 px-3 py-2.5 rounded-xl focus:outline-none text-sm font-bold bg-white"
                      >
                        {sportOptions.map(opt => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-ink-500 uppercase tracking-widest mb-1">
                        Base Price (₹/hr)
                      </label>
                      <input
                        type="number"
                        value={s.base_price}
                        onChange={e => updateSport(i, 'base_price', e.target.value)}
                        placeholder="800"
                        min="0"
                        className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 placeholder-ink-300 px-3 py-2.5 rounded-xl focus:outline-none text-sm font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-ink-500 uppercase tracking-widest mb-1">
                        Open Time
                      </label>
                      <input
                        type="time"
                        value={s.open_time}
                        onChange={e => updateSport(i, 'open_time', e.target.value)}
                        className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 px-3 py-2.5 rounded-xl focus:outline-none text-sm font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-ink-500 uppercase tracking-widest mb-1">
                        Close Time
                      </label>
                      <input
                        type="time"
                        value={s.close_time}
                        onChange={e => updateSport(i, 'close_time', e.target.value)}
                        className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 px-3 py-2.5 rounded-xl focus:outline-none text-sm font-bold bg-white"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-ink-500 uppercase tracking-widest mb-1">
                        Slot Duration (minutes)
                      </label>
                      <select
                        value={s.slot_duration_min}
                        onChange={e => updateSport(i, 'slot_duration_min', Number(e.target.value))}
                        className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-800 px-3 py-2.5 rounded-xl focus:outline-none text-sm font-bold bg-white"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes (1 hour)</option>
                        <option value={90}>90 minutes</option>
                        <option value={120}>120 minutes (2 hours)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addSport}
                type="button"
                className="w-full border-2 border-dashed border-ink-300 hover:border-ink-500 text-ink-500 hover:text-ink-700 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                </svg>
                Add Another Sport
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(1); setError('') }}
                  className="flex-1 border-2 border-ink-200 hover:border-ink-400 text-ink-600 py-3.5 rounded-2xl font-black text-sm transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Turf'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}