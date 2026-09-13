import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardList, Users } from "lucide-react";

function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Helpdesk SaaS home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-600/20">
              H
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900">Helpdesk SaaS</span>
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Sign in
          </Link>
        </header>

        <section className="relative flex flex-1 items-center py-16 lg:py-24">
          <div className="pointer-events-none absolute -right-32 top-16 h-96 w-96 rounded-full bg-indigo-100/80 blur-3xl" />
          <div className="pointer-events-none absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />

          <div className="relative grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.24em] text-indigo-600">
                Support, organized
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Every request deserves a clear next step.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500">
                Helpdesk SaaS gives your organization one calm place to collect,
                assign, and resolve support tickets.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/organization/create"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Create a workspace <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Your workspace</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">Support overview</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">Live</span>
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
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/50">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>
      <p className="font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

export default Home;