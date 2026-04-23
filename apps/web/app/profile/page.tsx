'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const API_BASE_URL =
  (process.env.BACKEND_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

type RefreshResponse = {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  accessTokenExpiresIn: string
  user: {
    id: string
    firstName: string
    lastName: string
    name: string
    email: string
  }
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<RefreshResponse['user'] | null>(null)
  const [accessTokenExpiresIn, setAccessTokenExpiresIn] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      const payload = (await response.json()) as RefreshResponse | { message?: string }

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'message' in payload
            ? payload.message
            : undefined
        throw new Error(message ?? 'Unable to load profile. Please login again.')
      }

      const authPayload = payload as RefreshResponse
      setProfile(authPayload.user)
      setAccessTokenExpiresIn(authPayload.accessTokenExpiresIn)
      setLastSyncedAt(new Date().toLocaleTimeString())
    } catch (err) {
      setProfile(null)
      setAccessTokenExpiresIn(null)
      setLastSyncedAt(null)
      setError(err instanceof Error ? err.message : 'Unable to load profile.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    void fetchProfile()
  }, [fetchProfile, mounted])

  if (!mounted) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
        <Card className="w-full border-zinc-200/80">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Preparing profile view...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <Card className="w-full border-zinc-200/80">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Loads current user details from your refresh session cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={() => void fetchProfile()} disabled={loading}>
            {loading ? 'Refreshing session...' : 'Refresh profile'}
          </Button>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{error}</p>
              <p className="mt-1">
                <Link className="font-semibold text-red-900 underline" href="/login">
                  Go to login
                </Link>
              </p>
            </div>
          ) : null}

          {profile ? (
            <dl className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Name</dt>
                <dd className="font-medium text-zinc-900">{profile.name}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="font-medium text-zinc-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">First name</dt>
                <dd className="font-medium text-zinc-900">{profile.firstName}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Last name</dt>
                <dd className="font-medium text-zinc-900">{profile.lastName}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Access token expiry</dt>
                <dd className="font-medium text-zinc-900">{accessTokenExpiresIn ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Last synced</dt>
                <dd className="font-medium text-zinc-900">{lastSyncedAt ?? '-'}</dd>
              </div>
            </dl>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}