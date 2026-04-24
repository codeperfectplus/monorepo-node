'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const API_BASE_URL =
  (process.env.BACKEND_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

type SessionResponse = {
  authenticated: boolean
}

export function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        setIsSignedIn(false)
        return
      }

      const payload = (await response.json()) as SessionResponse
      setIsSignedIn(payload.authenticated)
    } catch {
      setIsSignedIn(false)
    }
  }, [])

  useEffect(() => {
    void checkSession()
  }, [checkSession, pathname])

  useEffect(() => {
    const onAuthChanged = () => {
      void checkSession()
    }

    window.addEventListener('auth:changed', onAuthChanged)
    return () => {
      window.removeEventListener('auth:changed', onAuthChanged)
    }
  }, [checkSession])

  const onLogout = async () => {
    setIsLoggingOut(true)
    setMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setIsSignedIn(false)
      setMessage('Signed out from this device.')
      window.dispatchEvent(new Event('auth:changed'))
      router.push('/login')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Logout failed')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-sm font-semibold tracking-tight text-zinc-900" href="/">
          Auth Starter
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({
                size: 'sm',
                variant: pathname === '/' ? 'default' : 'ghost',
              }),
            )}
          >
            Home
          </Link>

          {isSignedIn ? (
            <Link
              href="/profile"
              className={cn(
                buttonVariants({
                  size: 'sm',
                  variant: pathname === '/profile' ? 'default' : 'ghost',
                }),
              )}
            >
              Profile
            </Link>
          ) : null}

          {isSignedIn ? (
            <Link
              href="/tokens"
              className={cn(
                buttonVariants({
                  size: 'sm',
                  variant: pathname === '/tokens' ? 'default' : 'ghost',
                }),
              )}
            >
              Tokens
            </Link>
          ) : null}

          {isSignedIn ? (
            <Link
              href="/admin"
              className={cn(
                buttonVariants({
                  size: 'sm',
                  variant: pathname === '/admin' ? 'default' : 'ghost',
                }),
              )}
            >
              Admin
            </Link>
          ) : null}

          {isSignedIn === false ? (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({
                    size: 'sm',
                    variant: pathname === '/login' ? 'default' : 'ghost',
                  }),
                )}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({
                    size: 'sm',
                    variant: pathname === '/signup' ? 'default' : 'ghost',
                  }),
                )}
              >
                Signup
              </Link>
            </>
          ) : null}

          {isSignedIn ? (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </Button>
          ) : null}
        </nav>
      </div>

      {message ? (
        <p className="mx-auto w-full max-w-5xl px-4 pb-3 text-xs text-zinc-600">{message}</p>
      ) : null}
    </header>
  )
}