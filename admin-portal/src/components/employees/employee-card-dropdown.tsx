'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  onEdit: () => void
  onResetPassword: () => void
  onGenerateAccount: () => void
  hasAccount: boolean
}

export default function EmployeeCardDropdown({ onEdit, onResetPassword, onGenerateAccount, hasAccount }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        className="text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-lg">more_horiz</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-30 py-1">
          {!hasAccount && (
            <button
              onClick={e => { e.stopPropagation(); setOpen(false); onGenerateAccount() }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Generate Account
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit
          </button>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onResetPassword() }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container transition-colors text-left"
          >
            <span className="material-symbols-outlined text-base">lock_reset</span>
            Reset Password
          </button>
        </div>
      )}
    </div>
  )
}
