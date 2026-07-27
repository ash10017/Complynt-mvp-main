'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// India market not active — redirect to homepage
export default function IndiaPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/') }, [router])
  return null
}
