import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-4 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
          NestJS + Next.js + Prisma
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Authentication Starter
        </h1>
        <p className="max-w-2xl text-pretty text-zinc-700">
          Create an account, login, and refresh access tokens using HttpOnly same-site refresh cookies.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Create your account with first name, last name, email, and strong password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
            >
              Go to Signup
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in and get access token while refresh token is stored in secure cookie.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'w-full')}
            >
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
