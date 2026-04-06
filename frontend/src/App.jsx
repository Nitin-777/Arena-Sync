import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Discover from './pages/Discover'
import TurfDetail from './pages/TurfDetail'
import MyBookings from './pages/MyBookings'
import Navbar from './components/Navbar'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Discover />} />
        <Route path="/turf/:id" element={<TurfDetail />} />
        <Route
          path="/my-bookings"
          element={<PrivateRoute><MyBookings /></PrivateRoute>}
        />
      </Routes>
    </div>
  )
}