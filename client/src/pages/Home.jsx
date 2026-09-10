import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardList, Users } from "lucide-react";

function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Helpdesk SaaS home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-black shadow-lg shadow-indigo-500/25">
              H
            </span>
            <span className="text-sm font-bold tracking-wide">Helpdesk SaaS</span>
          </Link>

          <Link
            to="/login"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-300 hover:text-white"
          >
            Sign in
          </Link>
        </header>

        <section className="relative flex flex-1 items-center py-20 lg:py-24">
          <div className="pointer-events-none absolute -right-32 top-16 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
                Support, organized
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Every request deserves a clear next step.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
                Helpdesk SaaS gives your organization one calm place to collect,
                assign, and resolve support tickets.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/organization/create"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-950/40 transition hover:bg-indigo-400"
                >
                  Create a workspace <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
                >
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Your workspace</p>
                  <p className="mt-1 text-xl font-bold">Support overview</p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-300">Live</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Feature icon={<ClipboardList size={19} />} title="Track every ticket" text="Keep requests visible from open to resolved." />
                <Feature icon={<Users size={19} />} title="Work as a team" text="Give each request a clear owner and priority." />
                <Feature icon={<CheckCircle2 size={19} />} title="Close the loop" text="Keep customers informed with a complete history." />
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-5 text-xs text-slate-500">
          A focused workspace for modern support teams.
        </footer>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/15 text-indigo-300">{icon}</div>
      <p className="font-bold text-slate-100">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

export default Home;