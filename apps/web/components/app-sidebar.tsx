'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  Home,
  User,
  Key,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const API_BASE_URL = (
  process.env.BACKEND_API_URL ?? 'http://localhost:8000/api/v1'
).replace(/\/$/, '')

type SessionUser = {
  id: string
  name: string
  email: string
  role: string
}

type SessionResponse = {
  authenticated: boolean
  user: SessionUser | null
}

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User, requiresAuth: true },
  { href: '/tokens', label: 'Tokens', icon: Key, requiresAuth: true },
  {
    href: '/admin',
    label: 'Admin',
    icon: ShieldCheck,
    requiresAuth: true,
    adminOnly: true,
  },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        setIsSignedIn(false)
        setUser(null)
        return
      }
      const payload = (await res.json()) as SessionResponse
      setIsSignedIn(payload.authenticated)
      setUser(payload.user)
    } catch {
      setIsSignedIn(false)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    void checkSession()
  }, [checkSession, pathname])

  useEffect(() => {
    const onAuthChanged = () => void checkSession()
    window.addEventListener('auth:changed', onAuthChanged)
    return () => window.removeEventListener('auth:changed', onAuthChanged)
  }, [checkSession])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const onLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setIsSignedIn(false)
      setUser(null)
      window.dispatchEvent(new Event('auth:changed'))
      router.push('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if ('adminOnly' in item && item.adminOnly) return user?.role === 'ADMIN'
    if ('requiresAuth' in item && item.requiresAuth) return isSignedIn === true
    return true
  })

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold select-none">
          A
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          Auth Starter
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-sidebar-primary'
                    : 'text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground',
                )}
              />
              {item.label}
            </Link>
          )
        })}

        {isSignedIn === false && (
          <>
            <div className="my-2 h-px bg-sidebar-border" />
            {[
              { href: '/login', label: 'Login', Icon: LogIn },
              { href: '/signup', label: 'Sign up', Icon: UserPlus },
            ].map(({ href, label, Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground" />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      {isSignedIn && user && (
        <div className="shrink-0 border-t border-sidebar-border p-2">
          <div className="mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/50">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {loggingOut ? 'Signing out…' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — fixed, always visible */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        {navContent}
      </aside>

      {/* Mobile: scrim */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile: slide-in sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3.5 rounded-md p-1 text-sidebar-foreground/40 hover:text-sidebar-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-border bg-white/80 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="mr-3 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          Auth Starter
        </span>
      </header>
    </>
  )
}
