import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getAdminDashboard } from "../../services/dashboard.service";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getAdminDashboard();

                setDashboard(response.data);
            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load dashboard",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const tickets = dashboard?.tickets;
    const users = dashboard?.users;

    const totalTickets = tickets?.total ?? 0;
    const pendingTickets = tickets?.pending ?? 0;
    const inProgressTickets = tickets?.inProgress ?? 0;
    const resolvedTickets = tickets?.resolved ?? 0;
    const closedTickets = tickets?.closed ?? 0;

    return (
        <div className="min-h-full">
            <div className="mx-auto max-w-[1600px] space-y-7">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                            <span className="h-2 w-2 rounded-full bg-indigo-400" />
                            Admin Dashboard
                        </div>

                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Welcome back, {user?.name}
                        </h1>

                        <p className="mt-1.5 text-sm text-slate-400">
                            Here's an overview of your organization's support activity.
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3.5 py-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>

                        <span className="text-xs font-semibold text-emerald-300">
                            Live data
                        </span>
                    </div>
                </div>

                {/* ==================================================
                    KPI CARDS
                ================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <KpiCard
                        title="Total Tickets"
                        value={totalTickets}
                        description="All support requests"
                        icon={<TicketIcon />}
                        iconWrapper="bg-indigo-50 text-indigo-600"
                    />

                    <KpiCard
                        title="Pending"
                        value={pendingTickets}
                        description="Waiting for action"
                        icon={<ClockIcon />}
                        iconWrapper="bg-amber-50 text-amber-600"
                    />

                    <KpiCard
                        title="In Progress"
                        value={inProgressTickets}
                        description="Currently being handled"
                        icon={<ProgressIcon />}
                        iconWrapper="bg-violet-50 text-violet-600"
                    />

                    <KpiCard
                        title="Resolved"
                        value={resolvedTickets}
                        description="Successfully resolved"
                        icon={<CheckIcon />}
                        iconWrapper="bg-emerald-50 text-emerald-600"
                    />

                </div>

                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">

                    {/* ==================================================
                        TICKET OVERVIEW
                    ================================================== */}

                    <section className="rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">

                        <div className="border-b border-white/[0.06] px-6 py-5">

                            <div className="flex items-center justify-between gap-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <ChartIcon />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-white">
                                            Ticket Overview
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Current distribution of support tickets
                                        </p>
                                    </div>

                                </div>

                                <span className="hidden text-xs font-medium text-slate-500 sm:block">
                                    {totalTickets} total
                                </span>

                            </div>
                        </div>

                        <div className="space-y-6 px-6 py-6">

                            <TicketProgress
                                label="Pending"
                                value={pendingTickets}
                                total={totalTickets}
                                icon={<ClockIcon />}
                                iconClass="bg-amber-50 text-amber-600"
                                barClass="bg-amber-500"
                            />

                            <TicketProgress
                                label="In Progress"
                                value={inProgressTickets}
                                total={totalTickets}
                                icon={<ProgressIcon />}
                                iconClass="bg-violet-50 text-violet-600"
                                barClass="bg-violet-500"
                            />

                            <TicketProgress
                                label="Resolved"
                                value={resolvedTickets}
                                total={totalTickets}
                                icon={<CheckIcon />}
                                iconClass="bg-emerald-50 text-emerald-600"
                                barClass="bg-emerald-500"
                            />

                            <TicketProgress
                                label="Closed"
                                value={closedTickets}
                                total={totalTickets}
                                icon={<LockIcon />}
                                iconClass="bg-slate-100 text-slate-600"
                                barClass="bg-slate-500"
                            />

                        </div>

                        {/* Bottom Summary */}

                        <div className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-4">

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

                                <SummaryItem
                                    label="Total"
                                    value={totalTickets}
                                />

                                <SummaryItem
                                    label="Pending"
                                    value={pendingTickets}
                                />

                                <SummaryItem
                                    label="Resolved"
                                    value={resolvedTickets}
                                />

                                <SummaryItem
                                    label="Closed"
                                    value={closedTickets}
                                />

                            </div>

                        </div>
                    </section>

                    {/* ==================================================
                        TEAM OVERVIEW
                    ================================================== */}

                    <section className="rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">

                        <div className="border-b border-white/[0.06] px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                    <UsersIcon />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-white">
                                        Team Overview
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        People in your workspace
                                    </p>
                                </div>

                            </div>

                        </div>

                        <div className="space-y-4 p-6">

                            {/* Agents */}

                            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-indigo-400/20 hover:bg-indigo-500/[0.05]">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                        <UsersIcon />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Support Agents
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Active support team
                                        </p>
                                    </div>

                                </div>

                                <p className="text-2xl font-bold text-white">
                                    {users?.agents ?? 0}
                                </p>

                            </div>

                            {/* Requesters */}

                            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-indigo-400/20 hover:bg-indigo-500/[0.05]">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                        <UserIcon />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Requesters
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Users raising tickets
                                        </p>
                                    </div>

                                </div>

                                <p className="text-2xl font-bold text-white">
                                    {users?.requesters ?? 0}
                                </p>

                            </div>

                            {/* Team Distribution */}

                            <div className="rounded-xl border border-white/[0.06] p-4">

                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-400">
                                        Workspace members
                                    </p>

                                    <p className="text-sm font-bold text-white">
                                        {(users?.agents ?? 0) +
                                            (users?.requesters ?? 0)}
                                    </p>
                                </div>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

                                    <div
                                        className="h-full rounded-full bg-violet-500 transition-all"
                                        style={{
                                            width: getPercentage(
                                                users?.agents ?? 0,
                                                (users?.agents ?? 0) +
                                                (users?.requesters ?? 0),
                                            ),
                                        }}
                                    />

                                </div>

                                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">

                                    <span>
                                        Agents
                                    </span>

                                    <span>
                                        Requesters
                                    </span>

                                </div>

                            </div>

                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}

/* ================================================================
   KPI CARD
================================================================ */

function KpiCard({
    title,
    value,
    description,
    icon,
    iconWrapper,
}) {
    return (
        <div className="group rounded-2xl border border-white/[0.07] bg-slate-900/80 p-5 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/20 hover:bg-slate-900">

            <div className="flex items-start justify-between">

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconWrapper}`}
                >
                    {icon}
                </div>

            </div>

            <p className="mt-5 text-sm font-medium text-slate-400">
                {title}
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-white">
                {value}
            </p>

            <p className="mt-1.5 text-xs text-slate-400">
                {description}
            </p>

        </div>
    );
}

/* ================================================================
   TICKET PROGRESS
================================================================ */

function TicketProgress({
    label,
    value,
    total,
    icon,
    iconClass,
    barClass,
}) {
    const percentage =
        total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>

            <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
                    >
                        {icon}
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-200">
                            {label}
                        </p>

                        <p className="text-xs text-slate-400">
                            {percentage}% of all tickets
                        </p>
                    </div>

                </div>

                <p className="text-sm font-bold text-white">
                    {value}
                </p>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

                <div
                    className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                    style={{
                        width: `${percentage}%`,
                    }}
                />

            </div>

        </div>
    );
}

/* ================================================================
   SUMMARY ITEM
================================================================ */

function SummaryItem({ label, value }) {
    return (
        <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-lg font-bold text-white">
                {value}
            </p>
        </div>
    );
}

/* ================================================================
   LOADING SKELETON
================================================================ */

function DashboardSkeleton() {
    return (
        <div className="min-h-full">
            <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-6 lg:p-8">

                {/* Header */}

                <div className="animate-pulse">
                    <div className="h-3 w-28 rounded bg-slate-800" />

                    <div className="mt-3 h-8 w-72 rounded-lg bg-slate-800" />

                    <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-800" />
                </div>

                {/* KPI Cards */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="animate-pulse rounded-2xl border border-white/[0.07] bg-slate-900 p-5"
                        >
                            <div className="h-11 w-11 rounded-xl bg-slate-800" />

                            <div className="mt-5 h-3 w-24 rounded bg-slate-800" />

                            <div className="mt-2 h-8 w-16 rounded bg-slate-800" />

                            <div className="mt-2 h-3 w-32 rounded bg-slate-800" />
                        </div>
                    ))}

                </div>

                {/* Main */}

                <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">

                    <div className="h-[480px] animate-pulse rounded-2xl border border-white/[0.07] bg-slate-900" />

                    <div className="h-[480px] animate-pulse rounded-2xl border border-white/[0.07] bg-slate-900" />

                </div>

            </div>
        </div>
    );
}

/* ================================================================
   HELPERS
================================================================ */

function getPercentage(value, total) {
    if (!total) {
        return "0%";
    }

    return `${Math.round((value / total) * 100)}%`;
}

/* ================================================================
   ICONS
================================================================ */

function TicketIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 4h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 1 2-2Z"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 8h6M9 12h6M9 16h4"
            />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="12" cy="12" r="9" />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7v5l3 2"
            />
        </svg>
    );
}

function ProgressIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 17h4V7H4v10ZM10 17h4V4h-4v13ZM16 17h4v-7h-4v7Z"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5 12 4 4L19 6"
            />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                width="18"
                height="11"
                x="3"
                y="11"
                rx="2"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 11V7a5 5 0 0 1 10 0v4"
            />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            />

            <circle
                cx="9"
                cy="7"
                r="4"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 21v-2a4 4 0 0 0-3-3.87"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 3.13a4 4 0 0 1 0 7.75"
            />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle
                cx="12"
                cy="8"
                r="4"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 21a8 8 0 0 1 16 0"
            />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19V5M4 19h16"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m7 15 4-4 3 2 5-6"
            />
        </svg>
    );
}

export default AdminDashboard;