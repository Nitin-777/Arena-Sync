import { useState, useEffect } from 'react'
import { adminGetAllTurfs, adminUpdateTurfStatus } from '../../api'
import AddTurfModal from './AddTurfModal'

export default function AdminTurfs() {
  const [turfs, setTurfs]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch]       = useState('')

  const fetchTurfs = () => {
    setLoading(true)
    adminGetAllTurfs()
      .then(r => setTurfs(r.data.turfs))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTurfs() }, [])

  const toggleStatus = async (id, current) => {
    const next = current === 'active' ? 'inactive' : 'active'
    setUpdating(id)
    try {
      await adminUpdateTurfStatus(id, next)
      setTurfs(prev => prev.map(t => t.id === id ? { ...t, status: next } : t))
    } catch (err) { console.error(err) }
    setUpdating(null)
  }

  const filtered = turfs.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">

      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.03em' }}>
            Turfs
          </h1>
          <p style={{ fontSize: 13, color: '#999', marginTop: 4, fontWeight: 500 }}>
            {turfs.length} venues registered
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors"
          style={{ background: '#0F0F0F', color: '#fff', fontSize: 13, fontWeight: 700 }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Add Turf
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 rounded-xl mb-5 max-w-xs"
        style={{ background: '#fff', border: '1px solid #E8E8E4', height: 38 }}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search turfs..."
          style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#0F0F0F', background: 'transparent', outline: 'none', border: 'none' }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: '#E8E8E4', height: 160 }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: '#fff', border: '1px solid #E8E8E4' }}>
          <p style={{ fontSize: 13, color: '#bbb' }}>No turfs found</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 rounded-xl"
            style={{ background: '#0F0F0F', color: '#fff', fontSize: 13, fontWeight: 700 }}>
            Add your first turf
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(turf => (
            <div key={turf.id} className="rounded-2xl p-5 transition-all"
              style={{ background: '#fff', border: '1px solid #E8E8E4' }}>

              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F0F0F' }} className="truncate">
                      {turf.name}
                    </h3>
                  </div>
                  <p style={{ fontSize: 12, color: '#999', fontWeight: 500 }} className="truncate">
                    {turf.address}
                  </p>
                  {turf.owner_name && (
                    <p style={{ fontSize: 11, color: '#ccc', marginTop: 3 }}>
                      Owner: {turf.owner_name}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleStatus(turf.id, turf.status)}
                  disabled={updating === turf.id}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    fontSize: 11, fontWeight: 700,
                    background: turf.status === 'active' ? '#f0fdf4' : '#fef2f2',
                    color:      turf.status === 'active' ? '#15803d' : '#b91c1c',
                    border:     `1px solid ${turf.status === 'active' ? '#bbf7d0' : '#fecaca'}`,
                    opacity: updating === turf.id ? 0.5 : 1,
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: turf.status === 'active' ? '#22c55e' : '#ef4444' }}/>
                  {updating === turf.id ? '...' : turf.status === 'active' ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Sports',   value: turf.sport_count    || 0 },
                  { label: 'Bookings', value: turf.total_bookings || 0 },
                  { label: 'Revenue',  value: `₹${Number(turf.total_revenue||0).toLocaleString('en-IN')}` },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: '#F4F4F0' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#0F0F0F', marginTop: 3 }} className="truncate">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddTurfModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchTurfs() }}
        />
      )}
    </div>
  )
}