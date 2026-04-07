import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendOtp = (phone) => API.post('/auth/send-otp', { phone });
export const verifyOtp = (phone, otp, name) => API.post('/auth/verify-otp', { phone, otp, name });
export const getAllTurfs = () => API.get('/turfs');
export const getTurfById = (id) => API.get(`/turfs/${id}`);
export const getAvailableSlots = (turf_sport_id, date) =>
  API.get(`/slots/availability?turf_sport_id=${turf_sport_id}&date=${date}`);
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const cancelBooking = (id, reason) => API.post(`/bookings/${id}/cancel`, { reason });
export const createPaymentOrder = (booking_id) =>
  API.post('/payments/create-order', { booking_id });
export const verifyPayment = (data) => API.post('/payments/verify', data);
export const adminGetAllBookings = () => API.get('/admin/bookings')
export const adminGetAllTurfs = () => API.get('/admin/turfs')
export const adminGetAllUsers = () => API.get('/admin/users')
export const adminGetStats = () => API.get('/admin/stats')
export const adminUpdateTurfStatus = (id, status) => API.put(`/admin/turfs/${id}/status`, { status })
export const adminUpdateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role })