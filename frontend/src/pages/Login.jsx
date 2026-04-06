import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendOtp, verifyOtp } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [otp, setOtp]     = useState('')
  const [name, setName]   = useState('')
  const [step, setStep]   = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async () => {
    if (phone.length !== 10) return setError('Enter a valid 10-digit number')
    setLoading(true); setError('')
    try { await sendOtp(phone); setStep(2) }
    catch { setError('Could not send OTP. Please try again.') }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setError('OTP must be 6 digits')
    setLoading(true); setError('')
    try {
      const res = await verifyOtp(phone, otp, name)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch { setError('Wrong OTP. Try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-ink-900 noise flex-col justify-between p-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(249,115,22,0.2)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />

        <div className="absolute top-32 right-20 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute top-48 right-32 w-40 h-40 rounded-full border border-white/5" />
        <div className="absolute bottom-40 left-20 w-80 h-80 rounded-full border border-white/5" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl rotate-3 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span className="font-display font-black text-xl text-white tracking-tight">
            arena<span className="text-brand-400">sync</span>
          </span>
        </div>

        <div className="relative z-10 space-y-10">
          <div>
            <p className="text-brand-400 font-bold text-sm tracking-widest uppercase mb-4">Your Sports Companion</p>
            <h2 className="font-display font-black text-6xl text-white leading-[1.05] text-balance">
              Book the<br />
              <span className="text-brand-400">perfect turf</span><br />
              in seconds.
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '500+', l: 'Turfs' },
              { n: '50K+', l: 'Players' },
              { n: '4.9', l: 'Rating' },
            ].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="font-display font-black text-3xl text-white">{s.n}</p>
                <p className="text-ink-400 text-xs font-semibold mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { icon: '⚡', text: 'Instant slot confirmation' },
              { icon: '🔒', text: 'Secure payments via Razorpay' },
              { icon: '↩', text: 'Easy cancellations & refunds' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-sm">{f.icon}</div>
                <p className="text-ink-300 text-sm font-medium">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <div className="flex items-center gap-1.5 mb-6 lg:hidden">
              <div className="w-7 h-7 bg-brand-500 rounded-lg rotate-3 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="font-display font-black text-lg text-ink-900">arena<span className="text-brand-500">sync</span></span>
            </div>
            <h1 className="font-display font-black text-4xl text-ink-900 leading-tight">
              {step === 1 ? 'Welcome\nback.' : 'Check your\nphone.'}
            </h1>
            <p className="text-ink-400 font-medium mt-2 text-sm">
              {step === 1
                ? 'Sign in to book your next game'
                : `Sent a 6-digit code to +91 ${phone}`}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {['Phone', 'Verify'].map((l, i) => (
              <div key={l} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  step > i+1 ? 'bg-lime-500 text-white'
                  : step === i+1 ? 'bg-ink-900 text-white ring-4 ring-ink-100'
                  : 'bg-ink-100 text-ink-400'
                }`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <span className={`text-xs font-bold ${step === i+1 ? 'text-ink-900' : 'text-ink-300'}`}>{l}</span>
                {i === 0 && <div className={`flex-1 h-px ml-1 rounded-full transition-all ${step > 1 ? 'bg-lime-500' : 'bg-ink-200'}`}/>}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-2xl mb-5 text-xs font-bold">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="flex rounded-2xl overflow-hidden border-2 border-ink-200 focus-within:border-ink-900 transition-all bg-white">
                  <div className="flex items-center gap-1.5 px-4 bg-ink-50 border-r-2 border-ink-200 flex-shrink-0">
                    <span>🇮🇳</span>
                    <span className="text-sm font-black text-ink-600">+91</span>
                  </div>
                  <input type="tel" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                    placeholder="98765 43210"
                    maxLength={10}
                    onKeyDown={e => e.key==='Enter' && handleSendOtp()}
                    className="flex-1 px-4 py-4 text-ink-900 placeholder-ink-300 focus:outline-none font-semibold text-sm bg-white"
                  />
                </div>
              </div>

              <button onClick={handleSendOtp} disabled={loading}
                className="w-full bg-ink-900 hover:bg-ink-700 text-white py-4 rounded-2xl font-black text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 group">
                {loading
                  ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Sending...</>
                  : <><span>Send OTP</span><svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                }
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-2">Your Name</label>
                <input type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 placeholder-ink-300 px-4 py-4 rounded-2xl focus:outline-none transition font-semibold text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink-700 uppercase tracking-widest mb-2">OTP Code</label>
                <input type="tel" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                  placeholder="000000"
                  maxLength={6}
                  onKeyDown={e => e.key==='Enter' && handleVerifyOtp()}
                  className="w-full border-2 border-ink-200 focus:border-ink-900 text-ink-900 placeholder-ink-200 px-4 py-4 rounded-2xl focus:outline-none transition text-center text-3xl tracking-[0.6em] font-black bg-white"
                />
                <p className="text-center text-ink-300 text-[11px] font-semibold mt-2">
                  Check VS Code terminal for OTP (dev mode)
                </p>
              </div>

              <button onClick={handleVerifyOtp} disabled={loading}
                className="w-full bg-ink-900 hover:bg-ink-700 text-white py-4 rounded-2xl font-black text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 group">
                {loading ? 'Verifying...' : <><span>Verify & Continue</span><svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>}
              </button>

              <button onClick={() => { setStep(1); setError(''); setOtp('') }}
                className="w-full py-3 text-ink-400 hover:text-ink-700 text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
                Change number
              </button>
            </div>
          )}

          <p className="text-center text-ink-300 text-[11px] font-medium mt-8 leading-relaxed">
            By continuing, you agree to our<br/>
            <span className="text-ink-500 underline underline-offset-2 cursor-pointer">Terms of Service</span> and <span className="text-ink-500 underline underline-offset-2 cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}