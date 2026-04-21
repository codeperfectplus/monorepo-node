'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

type LoginResponse = {
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

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LoginResponse | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const payload = (await response.json()) as LoginResponse | { message?: string }

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'message' in payload
            ? payload.message
            : undefined
        throw new Error(message ?? 'Login failed')
      }

      setResult(payload as LoginResponse)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
        <Card className="w-full border-zinc-200/80">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Preparing the login form...
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
      <Card className="w-full border-zinc-200/80">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sign in to receive a new access token and refresh cookie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <p>
                Logged in as <strong>{result.user.email}</strong>
              </p>
              <p className="break-all">Access token: {result.accessToken}</p>
              <p className="break-all">Refresh token: {result.refreshToken}</p>
            </div>
          ) : null}

          <p className="mt-6 text-sm text-zinc-600">
            New here?{' '}
            <Link className="font-semibold text-zinc-900 hover:underline" href="/signup">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
