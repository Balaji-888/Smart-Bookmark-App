'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [router])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg"
      >
        Login with Google
      </button>
    </div>
  )
}

