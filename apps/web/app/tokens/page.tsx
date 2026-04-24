'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const API_BASE_URL = (
  process.env.BACKEND_API_URL ?? 'http://localhost:8000/api/v1'
).replace(/\/$/, '')

type PatRecord = {
  id: string
  name: string
  expiresAt: string
  revokedAt: string | null
  createdAt: string
}

type CreatePatResponse = {
  token: string
  id: string
  name: string
  expiresAt: string
  createdAt: string
  message: string
}

type TestResponse = {
  message: string
  userId: string
  email: string
  role: string
}

type RefreshResponse = {
  accessToken: string
}

export default function TokensPage() {
  const [mounted, setMounted] = useState(false)
  // JWT access token obtained from the refresh cookie on mount
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const [tokens, setTokens] = useState<PatRecord[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Creation form state
  const [name, setName] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('90')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Revoke state
  const [revoking, setRevoking] = useState<string | null>(null)

  // PAT test state
  const [testToken, setTestToken] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Exchange the refresh cookie for a JWT access token once on mount
  const initAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        setAuthError('Not authenticated. Please log in.')
        return null
      }
      const body = (await res.json()) as RefreshResponse
      setAccessToken(body.accessToken)
      return body.accessToken
    } catch {
      setAuthError('Not authenticated. Please log in.')
      return null
    }
  }, [])

  const authHeaders = useCallback(
    (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` }),
    [],
  )

  const fetchTokens = useCallback(async (token: string) => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/tokens`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        throw new Error(body.message ?? 'Failed to load tokens.')
      }
      const data = (await res.json()) as PatRecord[]
      setTokens(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load tokens.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    void (async () => {
      const token = await initAccessToken()
      if (token) await fetchTokens(token)
    })()
  }, [mounted, initAccessToken, fetchTokens])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !accessToken) return
    setCreating(true)
    setCreateError(null)
    setNewToken(null)
    setCopied(false)

    try {
      const res = await fetch(`${API_BASE_URL}/tokens`, {
        method: 'POST',
        headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          expiresInDays: parseInt(expiresInDays, 10),
        }),
      })
      const body = (await res.json()) as CreatePatResponse | { message?: string }
      if (!res.ok) {
        const msg =
          typeof body === 'object' && 'message' in body ? body.message : undefined
        throw new Error(msg ?? 'Failed to create token.')
      }
      const created = body as CreatePatResponse
      setNewToken(created.token)
      setName('')
      setExpiresInDays('90')
      await fetchTokens(accessToken)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create token.')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (tokenId: string) => {
    if (!accessToken) return
    setRevoking(tokenId)
    try {
      await fetch(`${API_BASE_URL}/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: authHeaders(accessToken),
      })
      await fetchTokens(accessToken)
    } finally {
      setRevoking(null)
    }
  }

  const handleCopy = async () => {
    if (!newToken) return
    await navigator.clipboard.writeText(newToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setTesting(true)
    setTestResult(null)
    setTestError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/tokens/test`, {
        headers: { Authorization: `Bearer ${testToken}` },
      })
      const body = (await res.json()) as TestResponse | { message?: string }
      if (!res.ok) {
        const msg =
          typeof body === 'object' && 'message' in body ? body.message : undefined
        throw new Error(msg ?? 'PAT authentication failed.')
      }
      setTestResult(JSON.stringify(body, null, 2))
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'PAT test failed.')
    } finally {
      setTesting(false)
    }
  }

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <Card className="border-zinc-200/80">
          <CardHeader>
            <CardTitle>Personal Access Tokens</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  if (authError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <Card className="border-zinc-200/80">
          <CardHeader>
            <CardTitle>Personal Access Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {authError}{' '}
              <Link href="/login" className="font-semibold underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  const activeTokens = tokens.filter((t) => !t.revokedAt)
  const revokedTokens = tokens.filter((t) => t.revokedAt)

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      {/* Create token */}
      <Card className="border-zinc-200/80">
        <CardHeader>
          <CardTitle>Personal Access Tokens</CardTitle>
          <CardDescription>
            Generate tokens to authenticate API requests without a session cookie.
            Tokens are hashed before storage and shown only once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700" htmlFor="token-name">
                Token name
              </label>
              <input
                id="token-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CI pipeline, local dev"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700" htmlFor="expires">
                Expires in (days)
              </label>
              <select
                id="expires"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">365 days</option>
              </select>
            </div>
            <Button type="submit" disabled={creating || !name.trim() || !accessToken}>
              {creating ? 'Generating...' : 'Generate token'}
            </Button>
          </form>

          {createError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {createError}
            </div>
          ) : null}

          {newToken ? (
            <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                Token generated — copy it now, it won&apos;t be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded border border-green-200 bg-white px-2 py-1.5 font-mono text-xs text-zinc-800 select-all">
                  {newToken}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCopy()}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Active tokens list */}
      <Card className="border-zinc-200/80">
        <CardHeader>
          <CardTitle className="text-base">Active tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          ) : loading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : activeTokens.length === 0 ? (
            <p className="text-sm text-zinc-500">No active tokens.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {activeTokens.map((token) => (
                <li key={token.id} className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-zinc-900">{token.name}</p>
                    <p className="text-xs text-zinc-500">
                      Expires {new Date(token.expiresAt).toLocaleDateString('en-IN')}
                      {' · '}
                      Created {new Date(token.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="font-mono text-xs text-zinc-400">
                      {token.id.slice(0, 8)}...
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={revoking === token.id}
                    onClick={() => void handleRevoke(token.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {revoking === token.id ? 'Revoking...' : 'Revoke'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Revoked tokens */}
      {revokedTokens.length > 0 ? (
        <Card className="border-zinc-200/80">
          <CardHeader>
            <CardTitle className="text-base text-zinc-500">Revoked tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-zinc-100">
              {revokedTokens.map((token) => (
                <li
                  key={token.id}
                  className="flex items-center justify-between py-3 opacity-60"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-zinc-700 line-through">
                      {token.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Revoked {new Date(token.revokedAt!).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Test endpoint */}
      <Card className="border-zinc-200/80">
        <CardHeader>
          <CardTitle className="text-base">Test PAT authentication</CardTitle>
          <CardDescription>
            Paste a token to call{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">GET /api/v1/tokens/test</code>{' '}
            — requires a valid PAT, not a session cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={(e) => void handleTest(e)} className="space-y-3">
            <input
              type="text"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="pat_xxxxxxxx-..._..."
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            <Button
              type="submit"
              disabled={testing || !testToken.trim()}
              variant="outline"
            >
              {testing ? 'Testing...' : 'Test token'}
            </Button>
          </form>

          {testError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {testError}
            </div>
          ) : null}

          {testResult ? (
            <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800">
              {testResult}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
