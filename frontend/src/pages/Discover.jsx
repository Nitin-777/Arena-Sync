import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAllTurfs } from '../api'

const sports = {
  football:   { emoji: '⚽', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  cricket:    { emoji: '🏏', bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-500'     },
  basketball: { emoji: '🏀', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500'  },
  badminton:  { emoji: '🏸', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500'  },
  tennis:     { emoji: '🎾', bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-500'  },
}

const amenityIcons = {
  parking: '🅿', lights: '💡', 'changing rooms': '🚿',
  cafeteria: '☕', wifi: '📶', washrooms: '🚻',
}

function Skeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-ink-100 animate-pulse">
      <div className="h-56 bg-ink-100"/>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-ink-100 rounded-xl w-3/4"/>
        <div className="h-3.5 bg-ink-100 rounded-xl w-1/2"/>
        <div className="flex gap-2 pt-1">
          <div className="h-7 w-20 bg-ink-100 rounded-xl"/>
          <div className="h-7 w-20 bg-ink-100 rounded-xl"/>
        </div>
        <div className="h-px bg-ink-100 my-1"/>
        <div className="flex justify-between items-center">
          <div className="h-7 w-24 bg-ink-100 rounded-xl"/>
          <div className="h-9 w-28 bg-ink-100 rounded-xl"/>
        </div>
      </div>
    </div>
  )
}

function TurfCard({ turf }) {
  const minPrice = turf.sports?.filter(Boolean).length > 0
    ? Math.min(...turf.sports.filter(Boolean).map(s => Number(s.base_price)))
    : 0

  return (
    <Link to={`/turf/${turf.id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-ink-100 hover:border-brand-200 transition-all duration-300 hover:shadow-lifted hover:-translate-y-1 flex flex-col">

      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-ink-100 to-ink-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[100px] opacity-[0.07] group-hover:scale-110 group-hover:opacity-[0.1] transition-all duration-500 select-none">🏟</span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-[11px] font-black px-2.5 py-1.5 rounded-xl border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
            Open Now
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="bg-ink-900/80 backdrop-blur text-white text-[11px] font-black px-2.5 py-1.5 rounded-xl">
            ₹{minPrice}/hr
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/90 backdrop-blur rounded-xl px-3 py-2 text-xs font-bold text-ink-800 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              View slots
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-display font-bold text-[17px] text-ink-900 group-hover:text-brand-600 transition-colors leading-snug">
            {turf.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-ink-400 text-xs font-semibold mb-3">
          <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span className="truncate">{turf.address}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {turf.sports?.filter(Boolean).map((s, i) => {
            const cfg = sports[s.sport] || { emoji:'🏅', bg:'bg-ink-50', text:'text-ink-600', border:'border-ink-200' }
            return (
              <span key={i} className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                {cfg.emoji} {s.sport}
              </span>
            )
          })}
        </div>

        {turf.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {turf.amenities.slice(0, 4).map((a, i) => (
              <span key={i} className="text-[10px] font-semibold text-ink-400 bg-ink-50 border border-ink-100 px-2 py-0.5 rounded-lg">
                {amenityIcons[a] || '•'} {a}
              </span>
            ))}
            {turf.amenities.length > 4 && (
              <span className="text-[10px] font-semibold text-ink-400 bg-ink-50 border border-ink-100 px-2 py-0.5 rounded-lg">
                +{turf.amenities.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-ink-300 uppercase tracking-wider">Starting from</p>
            <p className="font-display font-black text-xl text-ink-900">
              ₹{minPrice}
              <span className="text-sm font-semibold text-ink-400">/hr</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-brand-500 group-hover:bg-brand-600 text-white text-xs font-black px-4 py-2.5 rounded-2xl transition-colors">
            Book Now
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Discover() {
  const [turfs, setTurfs]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sport, setSport]         = useState('all')
  const [sort, setSort]           = useState('default')
  const [view, setView]           = useState('grid')
  const searchRef = useRef(null)

  useEffect(() => {
    getAllTurfs()
      .then(r => setTurfs(r.data.turfs))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = turfs
    .filter(t =>
      (t.name+t.address).toLowerCase().includes(search.toLowerCase()) &&
      (sport === 'all' || t.sports?.some(s => s?.sport === sport))
    )
    .sort((a, b) => {
      const aP = Math.min(...(a.sports||[]).filter(Boolean).map(s=>+s.base_price))
      const bP = Math.min(...(b.sports||[]).filter(Boolean).map(s=>+s.base_price))
      if (sort === 'asc') return aP - bP
      if (sort === 'desc') return bP - aP
      return 0
    })

  return (
    <div className="min-h-screen bg-ink-50">

      <div className="relative overflow-hidden bg-ink-900 noise">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(249,115,22,0.18)_0%,transparent_65%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_100%,rgba(132,204,22,0.1)_0%,transparent_60%)]"/>
        <div className="absolute right-0 top-0 w-96 h-96 border border-white/5 rounded-full translate-x-1/2 -translate-y-1/2"/>
        <div className="absolute right-20 top-20 w-64 h-64 border border-white/5 rounded-full"/>

        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-ink-300 text-[11px] font-black px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse"/>
              Slots available right now
            </div>

            <h1 className="font-display font-black text-5xl md:text-6xl text-white leading-[1.04] tracking-tight mb-4">
              Your game.<br/>
              <span className="text-brand-400">Your turf.</span><br/>
              Right now.
            </h1>

            <p className="text-ink-400 text-lg font-medium leading-relaxed mb-8 max-w-lg">
              Book premium sports venues instantly — no calls, no waiting. Just show up and play.
            </p>

            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
              <div className="flex-1 flex items-center gap-3 pl-3">
                <svg className="w-4 h-4 text-ink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input ref={searchRef} type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search turf name or area..."
                  className="flex-1 py-3 bg-transparent text-white placeholder-ink-500 focus:outline-none text-sm font-semibold"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-ink-500 hover:text-ink-300 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              <button className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-black transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/5">
          <div className="max-w-6xl mx-auto px-5 py-4 grid grid-cols-4 divide-x divide-white/5">
            {[
              { v:'500+', l:'Turfs Listed' },
              { v:'50K+', l:'Active Players' },
              { v:'20+',  l:'Cities' },
              { v:'4.9★', l:'Avg Rating' },
            ].map(s => (
              <div key={s.l} className="px-6 first:pl-0 last:pr-0">
                <p className="font-display font-black text-2xl text-white">{s.v}</p>
                <p className="text-ink-500 text-xs font-semibold mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button onClick={() => setSport('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 ${
                sport === 'all'
                  ? 'bg-ink-900 text-white border-ink-900'
                  : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400'
              }`}>
              All Sports
            </button>
            {Object.entries(sports).map(([key, cfg]) => (
              <button key={key} onClick={() => setSport(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 ${
                  sport === key
                    ? 'bg-ink-900 text-white border-ink-900'
                    : `bg-white ${cfg.text} ${cfg.border} hover:border-ink-400`
                }`}>
                {cfg.emoji} {key.charAt(0).toUpperCase()+key.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-xs font-bold text-ink-700 bg-white border-2 border-ink-200 px-3 py-2 rounded-xl focus:outline-none focus:border-ink-900 cursor-pointer transition-all">
              <option value="default">Sort: Featured</option>
              <option value="asc">Price: Low → High</option>
              <option value="desc">Price: High → Low</option>
            </select>

            <div className="flex bg-white border-2 border-ink-200 rounded-xl overflow-hidden">
              {['grid','list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 transition-all ${view===v ? 'bg-ink-900 text-white' : 'text-ink-400 hover:text-ink-700'}`}>
                  {v === 'grid'
                    ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>

        {!loading && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">
              {filtered.length === 0 ? 'No results' : `${filtered.length} turf${filtered.length !== 1 ? 's' : ''} found`}
            </p>
            {(search || sport !== 'all') && (
              <button onClick={() => { setSearch(''); setSport('all') }}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'flex flex-col gap-4'}>
            {[1,2,3].map(i => <Skeleton key={i}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-20 h-20 bg-ink-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl">🔍</div>
            <h3 className="font-display font-bold text-xl text-ink-800 mb-2">No turfs found</h3>
            <p className="text-ink-400 text-sm font-medium mb-5">Try a different search term or sport</p>
            <button onClick={() => { setSearch(''); setSport('all') }}
              className="inline-flex items-center gap-2 bg-ink-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-ink-700 transition-colors">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'flex flex-col gap-4'}>
            {filtered.map(turf => <TurfCard key={turf.id} turf={turf}/>)}
          </div>
        )}
      </div>
    </div>
  )
}