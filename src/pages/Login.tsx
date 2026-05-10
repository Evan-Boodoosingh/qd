import API from '../services/api'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const existingUser = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (existingUser) {
      window.location.href = '/home'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      if (keepLoggedIn) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('user', JSON.stringify(data.user))
      }

      window.location.href = '/home'

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">

        <div className="flex items-center justify-center mb-8">
          <img
            src="/queued.png"
            alt="Queued"
            className="h-12 object-contain cursor-pointer"
            onClick={() => window.location.href = '/'}
          />
        </div>

        <div className="bg-[#1a1815] border border-white/7 rounded-2xl p-6 sm:p-10">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1 text-center">Welcome back</h1>
          <p className="text-[13px] text-[#9a9590] mb-8 text-center">Sign in to your Queued account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
              <p className="text-red-400 text-[13px]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[11px] text-[#9a9590] mb-2 ml-2 block cursor-pointer">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-[#0f0e0d] border border-white/10 rounded-full px-5 py-3 text-[14px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] cursor-text"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-[#9a9590] mb-2 ml-2 block cursor-pointer">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0f0e0d] border border-white/10 rounded-full px-5 py-3 text-[14px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] cursor-text pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all text-[11px]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input
                type="checkbox"
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 rounded accent-[#D13924] cursor-pointer"
              />
              <label htmlFor="keepLoggedIn" className="text-[12px] text-[#9a9590] cursor-pointer">
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-3 rounded-full text-sm hover:opacity-90 disabled:opacity-50 mt-1 cursor-pointer transition-all"
              style={{ backgroundColor: '#D13924' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] text-[#5a5650]">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* <button className="w-full bg-transparent border border-white/10 rounded-full py-3 text-[13px] text-[#c8c4be] hover:bg-white/5 cursor-pointer transition-all flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button> */}

          <p className="text-[12px] text-[#9a9590] text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#D13924] hover:underline cursor-pointer">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login