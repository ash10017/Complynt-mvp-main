'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/onboarding') }, [router])
  return (
    <div style={{ minHeight: '100vh', background: '#020c15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}
