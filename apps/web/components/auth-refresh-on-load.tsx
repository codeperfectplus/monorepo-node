'use client'

import { useEffect } from 'react'

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

export function AuthRefreshOnLoad() {
  useEffect(() => {
    let isCancelled = false

    const rotateRefreshToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (isCancelled) {
          return
        }

        if (response.ok) {
          window.dispatchEvent(new Event('auth:changed'))
        }
      } catch {
        // Ignore network/auth errors for unauthenticated sessions.
      }
    }

    void rotateRefreshToken()

    return () => {
      isCancelled = true
    }
  }, [])

  return null
}