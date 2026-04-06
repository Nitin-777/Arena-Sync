import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { sendOtp, verifyOtp } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async () => {
    if (phone.length !== 10) return setError('Enter a valid 10 digit number')
    setLoading(true); setError('')
    try {
      await sendOtp(phone)
      setStep(2)
    } catch { setError('Failed to send OTP. Try again.') }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setError('Enter a valid 6 digit OTP')
    setLoading(true); setError('')
    try {
      const res = await verifyOtp(phone, otp, name)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch { setError('Invalid OTP. Try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border-2 border-white"
              style={{
                width: `${(i+1)*120}px`, height: `${(i+1)*120}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 1 - i * 0.15
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-white">ArenaSync</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Your game,<br />your turf,<br />your time.
          </h2>
          <p className="text-primary-200 text-lg leading-relaxed mb-8">
            Book premium sports turfs in seconds. No calls, no waiting — just play.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '500+', label: 'Turfs' },
              { value: '50K+', label: 'Players' },
              { value: '4.9★', label: 'Rating' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-primary-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md fade-in">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-slate-900">ArenaSync</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
              {step === 1 ? 'Sign in to your account' : 'Verify your number'}
            </h1>
            <p className="text-slate-500">
              {step === 1
                ? "Enter your phone number to get started"
                : `We sent a 6-digit OTP to +91 ${phone}`}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {['Phone', 'Verify'].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > i + 1 ? 'bg-primary-600 text-white'
                  : step === i + 1 ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                  : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-semibold ${step === i + 1 ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                {i === 0 && <div className={`flex-1 h-0.5 ml-2 rounded ${step > 1 ? 'bg-primary-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-primary-500 transition-all bg-white">
                  <div className="flex items-center gap-2 px-4 bg-slate-50 border-r-2 border-slate-200">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-sm font-bold text-slate-600">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your phone number"
                    maxLength={10}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    className="flex-1 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none font-medium bg-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold text-base transition shadow-green disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending...</>
                ) : (
                  <> Send OTP <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border-2 border-slate-200 focus:border-primary-500 text-slate-900 placeholder-slate-400 px-4 py-3.5 rounded-xl focus:outline-none transition font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">OTP Code</label>
                <input
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  className="w-full border-2 border-slate-200 focus:border-primary-500 text-slate-900 placeholder-slate-300 px-4 py-3.5 rounded-xl focus:outline-none transition text-center text-3xl tracking-[1rem] font-bold bg-white"
                />
                <p className="text-center text-slate-400 text-xs mt-2 font-medium">
                  Check your VS Code terminal for the OTP (dev mode)
                </p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold text-base transition shadow-green disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : <><span>Verify & Continue</span> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>}
              </button>

              <button
                onClick={() => { setStep(1); setError(''); setOtp('') }}
                className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm font-semibold transition flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
                Change phone number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}