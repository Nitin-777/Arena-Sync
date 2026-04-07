import { useState, useEffect } from 'react'
import { adminGetAllTurfs, adminUpdateTurfStatus } from '../../api'

export default function AdminTurfs() {
  const [turfs, setTurfs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    adminGetAllTurfs()
      .then(r => setTurfs(r.data.turfs))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (id, current) => {
    const next = current === 'active' ? 'inactive' : 'active'
    setUpdating(id)
    try {
      await adminUpdateTurfStatus(id, next)
      setTurfs(prev => prev.map(t => t.id === id ? { ...t, status: next } : t))
    } catch (err) {
      console.error(err)
    }
    setUpdating(null)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl text-ink-900">Turfs</h1>
        <p className="text-ink-400 font-medium text-sm mt-1">{turfs.length} turfs registered</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-3xl border border-ink-100 h-40 animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {turfs.map(turf => (
            <div key={turf.id} className="bg-white rounded-3xl border border-ink-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-ink-900">{turf.name}</h3>
                  <p className="text-ink-400 text-xs font-medium mt-0.5">{turf.address}</p>
                </div>
                <button
                  onClick={() => toggleStatus(turf.id, turf.status)}
                  disabled={updating === turf.id}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 disabled:opacity-50 ${
                    turf.status === 'active'
                      ? 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-200'
                  }`}>
                  {updating === turf.id ? '...' : turf.status === 'active' ? '● Active' : '○ Inactive'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'Owner',    value: turf.owner_name || 'N/A' },
                  { label:'Bookings', value: turf.total_bookings || 0 },
                  { label:'Revenue',  value: `₹${Number(turf.total_revenue||0).toLocaleString('en-IN')}` },
                ].map(s => (
                  <div key={s.label} className="bg-ink-50 rounded-2xl p-3 border border-ink-100">
                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-black text-ink-800 mt-0.5 truncate">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}