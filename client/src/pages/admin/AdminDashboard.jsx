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
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-400">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    const tickets = dashboard?.tickets;
    const users = dashboard?.users;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-sm font-medium text-indigo-400">
                    Admin Dashboard
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                    Welcome back, {user?.name}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                    Here's what's happening in your organization.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Tickets"
                    value={tickets?.total ?? 0}
                    description="All tickets"
                />

                <StatCard
                    title="Pending"
                    value={tickets?.pending ?? 0}
                    description="Waiting for action"
                />

                <StatCard
                    title="In Progress"
                    value={tickets?.inProgress ?? 0}
                    description="Currently being handled"
                />

                <StatCard
                    title="Resolved"
                    value={tickets?.resolved ?? 0}
                    description="Successfully resolved"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 lg:grid-cols-2">
                <StatCard
                    title="Agents"
                    value={users?.agents ?? 0}
                    description="Active support agents"
                />

                <StatCard
                    title="Requesters"
                    value={users?.requesters ?? 0}
                    description="Users raising tickets"
                />
            </div>

            {/* Ticket Summary */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Ticket Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Current ticket distribution
                        </p>
                    </div>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                        Live data
                    </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    <MiniStat label="Pending" value={tickets?.pending ?? 0} />
                    <MiniStat
                        label="In Progress"
                        value={tickets?.inProgress ?? 0}
                    />
                    <MiniStat
                        label="Resolved"
                        value={tickets?.resolved ?? 0}
                    />
                    <MiniStat label="Closed" value={tickets?.closed ?? 0} />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, description }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
            <p className="text-sm font-medium text-slate-400">
                {title}
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                {value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
                {description}
            </p>
        </div>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-950 p-4">
            <p className="text-xs font-medium text-slate-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
                {value}
            </p>
        </div>
    );
}

export default AdminDashboard;