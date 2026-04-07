import { useState, useEffect } from 'react'
import { adminGetAllUsers, adminUpdateUserRole } from '../../api'

const roleConfig = {
  admin: { bg:'bg-purple-50', text:'text-purple-700', border:'border-purple-200' },
  owner: { bg:'bg-brand-50',  text:'text-brand-700',  border:'border-brand-200'  },
  user:  { bg:'bg-ink-50',    text:'text-ink-700',    border:'border-ink-200'    },
}

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [search, setSearch]   = useState('')

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
    } catch (err) {
      console.error(err)
    }
    setUpdating(null)
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl text-ink-900">Users</h1>
        <p className="text-ink-400 font-medium text-sm mt-1">{users.length} total users</p>
      </div>

      <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-2xl px-4 mb-5 max-w-sm">
        <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="flex-1 py-2.5 text-sm font-medium text-ink-800 placeholder-ink-300 focus:outline-none bg-transparent"/>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-3xl border border-ink-100 h-20 animate-pulse"/>)}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100">
                {['User', 'Phone', 'Bookings', 'Spent', 'Role', 'Joined'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-ink-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map(u => {
                const cfg = roleConfig[u.role] || roleConfig.user
                return (
                  <tr key={u.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-ink-100 rounded-xl flex items-center justify-center text-sm font-black text-ink-600">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink-800">{u.name}</p>
                          {u.email && <p className="text-xs text-ink-400">{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-ink-600 font-mono">{u.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-ink-800">{u.total_bookings || 0}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-ink-900">₹{Number(u.total_spent||0).toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                        className={`text-xs font-black px-2.5 py-1.5 rounded-xl border-2 focus:outline-none cursor-pointer disabled:opacity-50 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-ink-400 font-medium">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}