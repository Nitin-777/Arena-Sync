import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Discover from './pages/Discover'
import TurfDetail from './pages/TurfDetail'
import MyBookings from './pages/MyBookings'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBookings from './pages/admin/AdminBookings'
import AdminTurfs from './pages/admin/AdminTurfs'
import AdminUsers from './pages/admin/AdminUsers'
import Navbar from './components/Navbar'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/" />
  return children
}

export default function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'

  return (
    <div className="min-h-screen bg-ink-50">
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Discover />} />
        <Route path="/turf/:id" element={<TurfDetail />} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="turfs" element={<AdminTurfs />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </div>
  )
}