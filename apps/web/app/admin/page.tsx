'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const API_BASE_URL =
  (process.env.BACKEND_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

type RefreshResponse = {
  accessToken: string
  tokenType: 'Bearer'
  user: {
    id: string
    firstName: string
    lastName: string
    name: string
    email: string
    role: 'USER' | 'ADMIN'
  }
}

type AdminResponse = {
  message: string
}

type Status = 'idle' | 'loading' | 'success' | 'unauthenticated' | 'forbidden' | 'error'

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [user, setUser] = useState<RefreshResponse['user'] | null>(null)
  const [adminResponse, setAdminResponse] = useState<AdminResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [testedAt, setTestedAt] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const testAdminAccess = useCallback(async () => {
    setStatus('loading')
    setAdminResponse(null)
    setErrorMessage(null)

    // Step 1: get a fresh access token via the refresh cookie
    let accessToken: string
    let refreshedUser: RefreshResponse['user']

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshRes.status === 401) {
        setStatus('unauthenticated')
        setUser(null)
        return
      }

      if (!refreshRes.ok) {
        throw new Error(`Refresh failed (${refreshRes.status})`)
      }

      const refreshPayload = (await refreshRes.json()) as RefreshResponse
      accessToken = refreshPayload.accessToken
      refreshedUser = refreshPayload.user
      setUser(refreshedUser)
    } catch (err) {
      setStatus('unauthenticated')
      setUser(null)
      setErrorMessage(err instanceof Error ? err.message : 'Session check failed')
      return
    }

    // Step 2: call the admin-only endpoint with the access token
    try {
      const adminRes = await fetch(`${API_BASE_URL}/admin`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      })

      if (adminRes.status === 401) {
        setStatus('unauthenticated')
        return
      }

      if (adminRes.status === 403) {
        setStatus('forbidden')
        return
      }

      if (!adminRes.ok) {
        const body = (await adminRes.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? `Unexpected response (${adminRes.status})`)
      }

      const body = (await adminRes.json()) as AdminResponse
      setAdminResponse(body)
      setTestedAt(new Date().toLocaleTimeString())
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Request failed')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    void testAdminAccess()
  }, [mounted, testAdminAccess])

  if (!mounted) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <Card className="w-full border-zinc-200/80">
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Checking access…</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
      <Card className="w-full border-zinc-200/80">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <CardTitle>Admin Panel</CardTitle>
            <StatusBadge status={status} />
          </div>
          <CardDescription>
            Tests role-based access against{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-800">
              GET /api/v1/admin
            </code>
            . Requires a valid JWT with role <strong>ADMIN</strong>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            type="button"
            onClick={() => void testAdminAccess()}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Checking access…' : 'Re-test access'}
          </Button>

          {/* Unauthenticated */}
          {status === 'unauthenticated' && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">Not authenticated</p>
              <p className="mt-1 text-amber-700">
                You need an active session to reach this endpoint.
              </p>
              <p className="mt-2">
                <Link className="font-semibold text-amber-900 underline" href="/login">
                  Go to login
                </Link>
              </p>
            </div>
          )}

          {/* Forbidden */}
          {status === 'forbidden' && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-semibold">403 — Access Denied</p>
              <p className="mt-1 text-red-700">
                Your account has role <RoleBadge role={user?.role ?? 'USER'} /> — only{' '}
                <RoleBadge role="ADMIN" /> accounts can access this endpoint.
              </p>
              {user && (
                <p className="mt-2 text-red-600">
                  Signed in as <strong>{user.email}</strong>
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {status === 'error' && errorMessage && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-semibold">Error</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && adminResponse && (
            <div className="space-y-3">
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                <p className="font-semibold">Access granted</p>
                <p className="mt-1 text-green-700">{adminResponse.message}</p>
              </div>

              {user && (
                <dl className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-zinc-500">Name</dt>
                    <dd className="font-medium text-zinc-900">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Email</dt>
                    <dd className="font-medium text-zinc-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Role</dt>
                    <dd className="mt-0.5">
                      <RoleBadge role={user.role} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Tested at</dt>
                    <dd className="font-medium text-zinc-900">{testedAt ?? '-'}</dd>
                  </div>
                </dl>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; className: string }> = {
    idle: { label: 'Idle', className: 'bg-zinc-100 text-zinc-600' },
    loading: { label: 'Checking…', className: 'bg-zinc-100 text-zinc-600 animate-pulse' },
    success: { label: 'Authorized', className: 'bg-green-100 text-green-700' },
    unauthenticated: { label: '401 Unauthenticated', className: 'bg-amber-100 text-amber-700' },
    forbidden: { label: '403 Forbidden', className: 'bg-red-100 text-red-700' },
    error: { label: 'Error', className: 'bg-red-100 text-red-700' },
  }

  const { label, className } = map[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
        isAdmin
          ? 'bg-zinc-900 text-zinc-100'
          : 'bg-zinc-200 text-zinc-700'
      }`}
    >
      {role}
    </span>
  )
}
