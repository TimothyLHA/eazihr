'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'


export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [orgId, setOrgId] = useState('45d4e8fd-bd88-4ae3-be50-b801ac86e18d')
  const [role, setRole] = useState('org_admin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          organization_id: orgId,
          role,
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/login?registered=true')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <header className="bg-surface fixed top-0 w-full z-50">
        <div className="flex justify-between items-center w-full px-10 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-xl font-semibold text-on-surface">
            <span className="material-symbols-outlined text-2xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>corporate_fare</span>
            eazihr
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
                Create Account
              </h1>
              <p className="text-sm text-on-surface-variant text-center">
                Set up your admin account for LynnSys.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-xl absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

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
                    placeholder="admin@lynnsys.com"
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
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="orgId">
                  Organization ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-xl absolute left-3 top-1/2 -translate-y-1/2 text-outline">corporate_fare</span>
                  <input
                    id="orgId"
                    type="text"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wider text-on-surface-variant" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="org_admin">Org Admin</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="employee">Employee</option>
                </select>
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
                    Create Account
                    <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-on-surface-variant">Already have an account? </span>
              <Link href="/login" className="text-sm text-primary font-semibold hover:underline">
                Sign In
              </Link>
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
