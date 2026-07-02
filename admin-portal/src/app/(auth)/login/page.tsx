'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'


function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <header className="bg-surface fixed top-0 w-full z-50">
        <div className="flex justify-between items-center w-full px-10 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-xl font-semibold text-on-surface">
            <img src="/web_logo.svg" alt="EaziHR logo" className="h-8 w-8 object-contain" />
            EaziHR
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Support</a>
            <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Terms</a>
          </nav>
          <div>
            <button className="text-sm text-primary hover:underline">Help Center</button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-[440px] animate-[fadeIn_0.7s_ease]">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 md:p-10 shadow-[0_4px_40px_-10px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl text-white" style={{fontVariationSettings: "'FILL' 1"}}>corporate_fare</span>
              </div>
              <h1 className="text-[32px] font-semibold tracking-tight text-on-surface text-center mb-2">
                Sign in to eazihr
              </h1>
              <p className="text-sm text-on-surface-variant text-center">
                Manage your workforce with executive precision.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-xl absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-xl absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer w-5 h-5 cursor-pointer appearance-none rounded border border-outline-variant bg-white checked:bg-primary checked:border-primary transition-all duration-200"
                    />
                    <span className="material-symbols-outlined text-base text-white opacity-0 peer-checked:opacity-100 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">check</span>
                  </div>
                  <span className="ml-2 text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Remember Me
                  </span>
                </label>
                <a href="#" className="text-sm text-primary font-semibold hover:underline">
                  Forgot Password?
                </a>
              </div>

              {error && (
                <div className="text-sm text-error bg-error-container rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-on-background active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {registered === 'true' && (
              <div className="mt-6 text-sm text-secondary bg-secondary-container rounded-lg px-4 py-3 text-center">
                Account created! Check your email to confirm, then sign in.
              </div>
            )}

            <div className="mt-6 text-center">
              <span className="text-sm text-on-surface-variant">Don't have an account? </span>
              <Link href="/signup" className="text-sm text-primary font-semibold hover:underline">
                Create Account
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center">
              <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">help</span>
                Trouble logging in? Contact IT Support
              </a>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 opacity-40 grayscale hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1 text-xs font-semibold tracking-wider text-on-surface">
              <span className="material-symbols-outlined text-base">verified</span>
              SOC2 COMPLIANT
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold tracking-wider text-on-surface">
              <span className="material-symbols-outlined text-base">verified</span>
              SSL SECURED
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface border-t border-outline-variant/50">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-10 py-8 max-w-[1440px] mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-on-surface mb-4 md:mb-0">
            eazihr Enterprise
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6">
              <a href="#" className="text-xs text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-all">
                Security Policy
              </a>
              <a href="#" className="text-xs text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-all">
                System Status
              </a>
              <a href="#" className="text-xs text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-all">
                Contact Admin
              </a>
            </div>
            <div className="text-xs text-on-surface-variant opacity-60">
              &copy; 2026 eazihr. All rights reserved.
            </div>
          </div>
          <div className="hidden md:block" />
        </div>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
