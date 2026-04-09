import { useState, useEffect } from 'react'
import { adminGetAllUsers, adminUpdateUserRole } from '../../api'

const ROLE_STYLE = {
  admin: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
  owner: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  user:  { bg: '#F4F4F0', text: '#555',    border: '#E8E8E4' },
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    adminGetAllUsers()
      .then(r => setUsers(r.data.users))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (id, role) => {
    setUpdating(id)
    try {
      await adminUpdateUserRole(id, role)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    } catch (err) { console.error(err) }
    setUpdating(null)
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">

      <div className="mb-7">
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.03em' }}>
          Users
        </h1>
        <p style={{ fontSize: 13, color: '#999', marginTop: 4, fontWeight: 500 }}>
          {users.length} registered accounts
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 rounded-xl mb-5 max-w-xs"
        style={{ background: '#fff', border: '1px solid #E8E8E4', height: 38 }}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bbb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#0F0F0F', background: 'transparent', outline: 'none', border: 'none' }}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E8E8E4' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: '#bbb', fontSize: 13 }}>Loading...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F4F4F0' }}>
                {['User', 'Phone', 'Bookings', 'Total Spent', 'Role', 'Joined'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5"
                    style={{ fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rs = ROLE_STYLE[u.role] || ROLE_STYLE.user
                return (
                  <tr key={u.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F4F4F0' : 'none' }}
                    className="transition-colors hover:bg-stone-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                          style={{ background: '#0F0F0F' }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>{u.name}</p>
                          {u.email && <p style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#555', fontFamily: 'monospace' }}>{u.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F0F' }}>{u.total_bookings || 0}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#0F0F0F' }}>
                        ₹{Number(u.total_spent || 0).toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <select value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                        className="px-2.5 py-1 rounded-lg transition-all cursor-pointer focus:outline-none"
                        style={{
                          fontSize: 11, fontWeight: 700,
                          background: rs.bg,
                          color: rs.text,
                          border: `1px solid ${rs.border}`,
                          opacity: updating === u.id ? 0.5 : 1,
                        }}>
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <p style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
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