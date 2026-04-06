import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllTurfs } from '../api'

const sportConfig = {
  football: { icon: '⚽', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', pill: 'bg-emerald-600' },
  cricket:  { icon: '🏏', color: 'bg-blue-50 text-blue-700 border-blue-200',    pill: 'bg-blue-600' },
  basketball:{ icon: '🏀', color: 'bg-orange-50 text-orange-700 border-orange-200', pill: 'bg-orange-500' },
  badminton: { icon: '🏸', color: 'bg-purple-50 text-purple-700 border-purple-200', pill: 'bg-purple-600' },
  tennis:   { icon: '🎾', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', pill: 'bg-yellow-500' },
}

const stats = [
  { value: '500+', label: 'Turfs Listed', icon: '🏟' },
  { value: '50K+', label: 'Happy Players', icon: '👥' },
  { value: '20+', label: 'Cities', icon: '📍' },
  { value: '4.9★', label: 'Avg Rating', icon: '⭐' },
]

function TurfCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-52 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
        <div className="flex gap-2">
          <div className="h-7 bg-slate-100 rounded-lg w-20" />
          <div className="h-7 bg-slate-100 rounded-lg w-20" />
        </div>
        <div className="h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  )
}

export default function Discover() {
  const [turfs, setTurfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    getAllTurfs()
      .then(res => setTurfs(res.data.turfs))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = turfs
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.address.toLowerCase().includes(search.toLowerCase())
      const matchSport = selectedSport === 'all' ||
        (t.sports && t.sports.some(s => s && s.sport === selectedSport))
      return matchSearch && matchSport
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') {
        const aMin = Math.min(...(a.sports || []).filter(Boolean).map(s => Number(s.base_price)))
        const bMin = Math.min(...(b.sports || []).filter(Boolean).map(s => Number(s.base_price)))
        return aMin - bMin
      }
      if (sortBy === 'price_desc') {
        const aMin = Math.min(...(a.sports || []).filter(Boolean).map(s => Number(s.base_price)))
        const bMin = Math.min(...(b.sports || []).filter(Boolean).map(s => Number(s.base_price)))
        return bMin - aMin
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full mb-6 border border-white/20 fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Slots available today
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white mb-5 leading-tight fade-in-delay-1">
            Find & Book
            <span className="block text-primary-200">Sports Turfs</span>
          </h1>

          <p className="text-primary-100 text-xl mb-10 max-w-xl mx-auto leading-relaxed fade-in-delay-2">
            Instant booking at top-rated venues. Cricket, football, badminton and more.
          </p>

          <div className="bg-white rounded-2xl p-1.5 flex items-center gap-2 max-w-2xl mx-auto shadow-2xl fade-in-delay-3">
            <div className="flex-1 flex items-center gap-3 pl-4">
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search turf name or location..."
                className="flex-1 py-3 text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-medium bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
              Search
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-display text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-primary-200 text-xs font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            <button
              onClick={() => setSelectedSport('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border-2 transition-all ${
                selectedSport === 'all'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              All Sports
            </button>
            {Object.entries(sportConfig).map(([sport, config]) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border-2 transition-all ${
                  selectedSport === sport
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                }`}
              >
                {config.icon} {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {!loading && (
          <p className="text-slate-500 text-sm font-medium mb-5">
            {filtered.length === 0 ? 'No turfs found' : (
              <>Showing <span className="font-bold text-slate-800">{filtered.length}</span> turf{filtered.length !== 1 ? 's' : ''}</>
            )}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [1,2,3].map(i => <TurfCardSkeleton key={i} />)
            : filtered.length === 0
            ? (
              <div className="col-span-3 text-center py-24">
                <div className="text-6xl mb-4">🏟</div>
                <h3 className="font-display text-xl font-bold text-slate-700 mb-2">No turfs found</h3>
                <p className="text-slate-400 font-medium">Try adjusting your search or filter</p>
                <button onClick={() => { setSearch(''); setSelectedSport('all') }}
                  className="mt-4 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition">
                  Clear filters
                </button>
              </div>
            )
            : filtered.map((turf, idx) => {
              const minPrice = turf.sports && turf.sports.filter(Boolean).length > 0
                ? Math.min(...turf.sports.filter(Boolean).map(s => Number(s.base_price)))
                : 0

              return (
                <Link
                  key={turf.id}
                  to={`/turf/${turf.id}`}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card card-hover group"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative h-52 bg-gradient-to-br from-primary-50 via-primary-100 to-emerald-100 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl opacity-20 group-hover:scale-110 transition-transform duration-500">🏟</span>
                    </div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-white/90 backdrop-blur text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                        ● Available
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                      From ₹{minPrice}/hr
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/80 to-transparent" />
                  </div>

                  <div className="p-5">
                    <h2 className="font-display text-lg font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition">
                      {turf.name}
                    </h2>

                    <div className="flex items-start gap-1.5 text-slate-400 text-sm mb-4 font-medium">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span className="line-clamp-1">{turf.address}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {turf.sports && turf.sports.filter(Boolean).map((sport, i) => {
                        const cfg = sportConfig[sport.sport] || { icon: '🏅', color: 'bg-slate-100 text-slate-600 border-slate-200' }
                        return (
                          <span key={i} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${cfg.color}`}>
                            {cfg.icon} {sport.sport}
                          </span>
                        )
                      })}
                    </div>

                    {turf.amenities && turf.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {turf.amenities.slice(0, 3).map((a, i) => (
                          <span key={i} className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-lg">
                            {a}
                          </span>
                        ))}
                        {turf.amenities.length > 3 && (
                          <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-lg">
                            +{turf.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Starting from</p>
                        <p className="font-display text-xl font-extrabold text-primary-600">
                          ₹{minPrice}
                          <span className="text-sm font-medium text-slate-400">/hr</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
                        Book Now
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}