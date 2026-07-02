import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const orgId = user.user_metadata?.organization_id as string | undefined

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <Shield className="w-16 h-16 text-primary mb-6" />
      <h1 className="text-3xl font-semibold text-on-surface mb-2">
        Welcome to EasyHR
      </h1>
      <p className="text-on-surface-variant">
        {user.email}
      </p>
      {orgId && (
        <p className="text-xs text-on-surface-variant mt-2">
          Organization: {orgId}
        </p>
      )}
    </div>
  )
}
