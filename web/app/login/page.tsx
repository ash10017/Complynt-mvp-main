'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

type View = 'login' | 'signup' | 'forgot'

const AUTH_ERRORS: Record<string, string> = {
  'auth/user-not-found':         'No account found with this email.',
  'auth/wrong-password':         'Incorrect password. Try again.',
  'auth/email-already-in-use':   'An account with this email already exists.',
  'auth/weak-password':          'Password must be at least 6 characters.',
  'auth/invalid-email':          'Please enter a valid email address.',
  'auth/too-many-requests':      'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/invalid-credential':     'Incorrect email or password.',
}

function authMsg(err: { code?: string }) {
  return AUTH_ERRORS[err.code || ''] ?? 'Something went wrong. Please try again.'
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const btnPrimary = 'flex justify-center items-center w-full py-3 bg-[#0071e3] text-white border-0 rounded-[10px] text-[15px] font-semibold cursor-pointer mt-3 disabled:opacity-60 hover:bg-[#0058b0] transition-colors'

export default function LoginPage() {
  const router = useRouter()
  const [view,           setView]           = useState<View>('login')
  const [loginEmail,     setLoginEmail]     = useState('')
  const [loginPassword,  setLoginPassword]  = useState('')
  const [signupName,     setSignupName]     = useState('')
  const [signupEmail,    setSignupEmail]    = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [forgotEmail,    setForgotEmail]    = useState('')
  const [forgotSent,     setForgotSent]     = useState(false)
  const [error,          setError]          = useState('')
  const [loading,        setLoading]        = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) router.replace('/dashboard')
    })
    return unsub
  }, [router])

  const clearError = () => setError('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      router.replace('/dashboard')
    } catch (err: unknown) { setError(authMsg(err as { code?: string })) }
    finally { setLoading(false) }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    if (!signupName || !signupEmail || !signupPassword) { setError('Please fill in all fields.'); return }
    if (signupPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      await updateProfile(cred.user, { displayName: signupName })
      router.replace('/onboarding')
    } catch (err: unknown) { setError(authMsg(err as { code?: string })) }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    clearError()
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      router.replace('/dashboard')
    } catch (err: unknown) { setError(authMsg(err as { code?: string })) }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    if (!forgotEmail) { setError('Please enter your email.'); return }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, forgotEmail)
      setForgotSent(true)
    } catch (err: unknown) { setError(authMsg(err as { code?: string })) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen">

      {/* Left panel — hidden on small screens */}
      <div className="hidden lg:flex flex-col w-[400px] shrink-0 bg-gradient-to-br from-[#0071e3] to-[#0058b0] p-10 text-white">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-[9px] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="text-base font-bold">Complynt</span>
        </a>

        <div className="flex-1 flex items-center">
          <div>
            <h2 className="text-[28px] font-extrabold leading-tight">
              Your compliance,<br />always under control.
            </h2>
            <p className="text-[15px] text-white/75 leading-relaxed mt-3.5">
              Every licence, deadline, and document — tracked, documented, and alerted before deadlines become disasters.
            </p>
          </div>
        </div>

        <div className="flex gap-6 pt-5 border-t border-white/15 mt-auto">
          <div>
            <div className="text-[22px] font-extrabold">8+</div>
            <div className="text-[11px] text-white/65 mt-0.5">Licences managed</div>
          </div>
          <div>
            <div className="text-[22px] font-extrabold">0</div>
            <div className="text-[11px] text-white/65 mt-0.5">Missed deadlines</div>
          </div>
          <div>
            <div className="text-[22px] font-extrabold">£20K+</div>
            <div className="text-[11px] text-white/65 mt-0.5">Fines prevented</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7] p-8 lg:p-10">
        <div className="bg-white rounded-[20px] p-9 w-full max-w-[380px] shadow-[0_8px_40px_rgba(0,0,0,.08)]">

          {/* ── Login view ── */}
          {view === 'login' && (
            <>
              <h1 className="text-[22px] font-bold text-[#1d1d1f] mb-1">Welcome back</h1>
              <p className="text-sm text-[#6e6e73] mb-6">Log in to your account to continue.</p>

              <button
                className="flex items-center justify-center gap-2.5 w-full py-[11px] border-[1.5px] border-[#e5e5ea] rounded-[10px] bg-white text-sm font-medium text-[#1d1d1f] cursor-pointer mb-4 hover:border-[#d2d2d7] transition-colors"
                onClick={handleGoogle}
              >
                <GoogleIcon /> Continue with Google
              </button>
              <div className="login-divider">or continue with email</div>

              <form onSubmit={handleLogin} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Email</label>
                  <input className="form-input" id="login-email" type="email" placeholder="you@business.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" required />
                </div>
                <div className="form-group">
                  <div className="form-row">
                    <label className="form-label" htmlFor="login-password">Password</label>
                    <button type="button" className="form-link" onClick={() => { clearError(); setView('forgot') }}>Forgot password?</button>
                  </div>
                  <input className="form-input" id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="current-password" required />
                </div>
                {error && <p className="form-error visible">{error}</p>}
                <button type="submit" className={btnPrimary} disabled={loading}>
                  {loading ? 'Please wait…' : 'Log in'}
                </button>
              </form>

              <p className="text-center text-[13px] text-[#a1a1a6] mt-5">
                Don&apos;t have an account?{' '}
                <button type="button" className="text-[#0071e3] font-medium bg-transparent border-0 cursor-pointer text-[13px]" onClick={() => { clearError(); setView('signup') }}>
                  Sign up free →
                </button>
              </p>
            </>
          )}

          {/* ── Signup view ── */}
          {view === 'signup' && (
            <>
              <h1 className="text-[22px] font-bold text-[#1d1d1f] mb-1">Create your account</h1>
              <p className="text-sm text-[#6e6e73] mb-6">Free forever. No credit card needed.</p>

              <button
                className="flex items-center justify-center gap-2.5 w-full py-[11px] border-[1.5px] border-[#e5e5ea] rounded-[10px] bg-white text-sm font-medium text-[#1d1d1f] cursor-pointer mb-4 hover:border-[#d2d2d7] transition-colors"
                onClick={handleGoogle}
              >
                <GoogleIcon /> Sign up with Google
              </button>
              <div className="login-divider">or sign up with email</div>

              <form onSubmit={handleSignup} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-name">Full name</label>
                  <input className="form-input" id="signup-name" type="text" placeholder="Your name" value={signupName} onChange={e => setSignupName(e.target.value)} autoComplete="name" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-email">Email</label>
                  <input className="form-input" id="signup-email" type="email" placeholder="you@business.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} autoComplete="email" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-password">Password</label>
                  <input className="form-input" id="signup-password" type="password" placeholder="Min. 8 characters" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} autoComplete="new-password" required />
                </div>
                {error && <p className="form-error visible">{error}</p>}
                <button type="submit" className={btnPrimary} disabled={loading}>
                  {loading ? 'Please wait…' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-[13px] text-[#a1a1a6] mt-5">
                Already have an account?{' '}
                <button type="button" className="text-[#0071e3] font-medium bg-transparent border-0 cursor-pointer text-[13px]" onClick={() => { clearError(); setView('login') }}>
                  Log in →
                </button>
              </p>
            </>
          )}

          {/* ── Forgot password view ── */}
          {view === 'forgot' && (
            <>
              <h1 className="text-[22px] font-bold text-[#1d1d1f] mb-1">Reset your password</h1>
              <p className="text-sm text-[#6e6e73] mb-6">Enter your email and we&apos;ll send you a reset link.</p>

              {forgotSent ? (
                <p className="text-sm text-[#1a7a34] bg-[rgba(52,199,89,0.10)] px-4 py-3 rounded-[10px] mb-4">
                  Reset link sent — check your inbox.
                </p>
              ) : (
                <form onSubmit={handleForgot} noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="forgot-email">Email</label>
                    <input className="form-input" id="forgot-email" type="email" placeholder="you@business.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} autoComplete="email" required />
                  </div>
                  {error && <p className="form-error visible">{error}</p>}
                  <button type="submit" className={btnPrimary} disabled={loading}>
                    {loading ? 'Please wait…' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <p className="text-center text-[13px] text-[#a1a1a6] mt-5">
                <button type="button" className="text-[#0071e3] font-medium bg-transparent border-0 cursor-pointer text-[13px]" onClick={() => { clearError(); setView('login') }}>
                  ← Back to log in
                </button>
              </p>
            </>
          )}

          <p className="text-[11.5px] text-[#a1a1a6] text-center mt-6">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-[#0071e3]">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-[#0071e3]">Privacy Policy</a>.
          </p>
        </div>
      </div>

    </div>
  )
}
