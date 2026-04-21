'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
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

type SignupResponse = {
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

export default function SignupPage() {
  const [mounted, setMounted] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SignupResponse | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fullName = useMemo(
    () => `${firstName.trim()} ${lastName.trim()}`.trim(),
    [firstName, lastName],
  )

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
          name: fullName,
          email,
          password,
        }),
      })

      const payload = (await response.json()) as SignupResponse | { message?: string }

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'message' in payload
            ? payload.message
            : undefined
        throw new Error(message ?? 'Signup failed')
      }

      setResult(payload as SignupResponse)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
        <Card className="w-full border-zinc-200/80">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Preparing the signup form...
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
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Register with your first name, last name, email, and strong password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="text-xs text-zinc-500">
                Must include uppercase, lowercase, number, symbol, and at least 8 characters.
              </p>
            </div>

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? 'Creating account...' : 'Sign up'}
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
                Account created for <strong>{result.user.email}</strong>
              </p>
              <p className="break-all">Access token: {result.accessToken}</p>
              <p className="break-all">Refresh token: {result.refreshToken}</p>
            </div>
          ) : null}

          <p className="mt-6 text-sm text-zinc-600">
            Already have an account?{' '}
            <Link className="font-semibold text-zinc-900 hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
