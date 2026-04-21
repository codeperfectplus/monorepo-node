import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const capabilityCards = [
  {
    title: 'Auto-join every meeting',
    description:
      'Connect calendars once and the AI joins Zoom, Meet, and Teams automatically with your team rules.',
  },
  {
    title: 'Speaker-aware transcript',
    description:
      'Get clean transcripts with speaker labels, timestamps, and searchable moments in seconds.',
  },
  {
    title: 'Action items that are real',
    description:
      'The assistant extracts owners, deadlines, and dependencies so nothing is lost in follow-up.',
  },
  {
    title: 'Meeting quality feedback',
    description:
      'Measure talk ratio, interruption patterns, and decision clarity with practical coaching feedback.',
  },
  {
    title: 'Knowledge base over time',
    description:
      'Every meeting updates a living project memory, so your team can ask what changed and why.',
  },
  {
    title: 'Works with your stack',
    description:
      'Sync action items to project tools and push summaries to docs and chat channels automatically.',
  },
]

const meetingFlow = [
  {
    step: '01',
    title: 'Connect calendars',
    detail: 'Choose which meetings the bot can join and define privacy rules by team or folder.',
  },
  {
    step: '02',
    title: 'Record + transcribe',
    detail: 'It joins silently, captures context, and builds a transcript with confidence scoring.',
  },
  {
    step: '03',
    title: 'Summarize + assign',
    detail: 'AI summary ships with owner-tagged action items, risks, blockers, and key decisions.',
  },
  {
    step: '04',
    title: 'Grow team memory',
    detail: 'Each call links to previous decisions so the system becomes smarter every week.',
  },
]

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10 sm:pt-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <p className="inline-flex rounded-full border border-zinc-300 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Meeting Intelligence Platform
          </p>

          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            Your AI teammate that joins meetings, writes transcripts, and ships decisions.
          </h1>

          <p className="max-w-2xl text-pretty text-base text-zinc-700 sm:text-lg">
            Replace messy notes with an AI copilot that records calls, creates actionable summaries, scores
            meeting quality, and builds a searchable knowledge database over time.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'px-6')}>
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'bg-white/70 px-6')}
            >
              Book Live Demo
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Meetings analyzed</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">18,420+</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Avg summary time</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">42 sec</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Action capture rate</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">96%</p>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          <Card className="h-full overflow-hidden border-zinc-200/90 bg-white/85 backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="inline-flex w-fit rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-100">
                Live Meeting Snapshot
              </div>
              <CardTitle className="text-xl">Weekly Product Sync</CardTitle>
              <CardDescription>
                AI already joined and is processing transcript, sentiment, and decision quality in real time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Transcript cue</p>
                <p className="mt-2 text-sm text-zinc-700">
                  "We will launch the onboarding revamp on Friday, and Mia owns the final QA checklist."
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Action items</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900">5 assigned</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Feedback score</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900">8.7 / 10</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-zinc-100">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Knowledge update</p>
                <p className="mt-2 text-sm text-zinc-200">
                  Added new decision: onboarding release date moved from Q3-W2 to Q3-W1 with owner dependency on
                  growth engineering.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-14 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Why teams switch</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {capabilityCards.map((item) => (
            <Card key={item.title} className="border-zinc-200/90 bg-white/75">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg tracking-tight">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">How it works</p>
        <div className="grid gap-4 lg:grid-cols-4">
          {meetingFlow.map((item) => (
            <Card key={item.step} className="border-zinc-200 bg-white/80">
              <CardHeader className="space-y-3">
                <p className="font-mono text-xs tracking-[0.2em] text-zinc-500">STEP {item.step}</p>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white/80">
          <CardHeader>
            <CardTitle>What ships after every meeting</CardTitle>
            <CardDescription>Structured outputs your team can act on immediately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-700">
            <p>Summary: decisions, blockers, and unresolved questions with confidence indicators.</p>
            <p>Action log: owner, due date, and linked context for each commitment made in the call.</p>
            <p>Feedback: speaking-time balance, clarity score, and facilitation recommendations.</p>
            <p>Searchable transcript: find any promise, requirement, or metric in seconds.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-900/20 bg-zinc-900 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-zinc-100">Knowledge graph that compounds</CardTitle>
            <CardDescription className="text-zinc-300">
              The more meetings you run, the better your institutional memory becomes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-200">
            <p>Track evolving decisions by project, customer, and milestone across months.</p>
            <p>Ask AI: "Why did we change launch date?" and get evidence-backed answers.</p>
            <p>Onboard new hires faster with instant context from past discussions.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-14 rounded-3xl border border-zinc-200 bg-white/80 p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Ready to replace manual notes?</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Launch your AI meeting assistant this week and turn conversations into execution.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-700">
          Start with one team, sync your calendar, and ship action-oriented summaries from day one.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'px-6')}>
            Create Workspace
          </Link>
          <Link href="/profile" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'px-6')}>
            View Product Preview
          </Link>
        </div>
      </section>
    </main>
  )
}
