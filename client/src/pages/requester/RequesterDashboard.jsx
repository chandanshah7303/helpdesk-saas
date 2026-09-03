import { useEffect, useState } from "react";
import {
  Ticket,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getRequesterDashboard } from "../../services/dashboard.service.js";
import { getTickets } from "../../services/ticket.service.js";

function RequesterDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [dashboardResult, ticketsResult] =
          await Promise.all([
            getRequesterDashboard(),
            getTickets({ page: 1, limit: 5 }),
          ]);

        console.log(
          "REQUESTER DASHBOARD:",
          dashboardResult,
        );

        console.log(
          "REQUESTER TICKETS:",
          ticketsResult,
        );

        setDashboard(dashboardResult.data);

        setRecentTickets(
          ticketsResult.data.tickets || [],
        );
      } catch (error) {
        console.error(
          "Requester dashboard error:",
          error,
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to load requester dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">

        <div>
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-800" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-900"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-2xl bg-slate-900" />
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { tickets } = dashboard;

  const stats = [
    {
      label: "Total Tickets",
      value: tickets.total,
      icon: Ticket,
      description: "All your support requests",
    },
    {
      label: "Pending",
      value: tickets.pending,
      icon: Clock3,
      description: "Waiting for an agent",
    },
    {
      label: "In Progress",
      value: tickets.inProgress,
      icon: LoaderCircle,
      description: "Currently being handled",
    },
    {
      label: "Resolved",
      value: tickets.resolved,
      icon: CheckCircle2,
      description: "Successfully resolved",
    },
    {
      label: "Closed",
      value: tickets.closed,
      icon: Lock,
      description: "Completed requests",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-400">
            Support Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Requester Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your support requests and their progress.
          </p>
        </div>

        <button
          onClick={() => navigate("/tickets/create")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
        >
          <Plus size={17} />
          Create Ticket
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Tickets */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60">

        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              My Recent Tickets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest support requests.
            </p>
          </div>

          <button
            onClick={() => navigate("/tickets")}
            className="hidden items-center gap-2 text-sm font-medium text-indigo-400 transition hover:text-indigo-300 sm:flex"
          >
            View all
            <ArrowRight size={16} />
          </button>
        </div>

        {recentTickets.length === 0 ? (
          <div className="p-10 text-center">
            <Ticket
              size={32}
              className="mx-auto text-slate-700"
            />

            <p className="mt-3 text-sm text-slate-500">
              You haven't created any tickets yet.
            </p>

            <button
              onClick={() =>
                navigate("/tickets/create")
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <Plus size={16} />
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentTickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() =>
                  navigate(
                    `/tickets/${ticket._id}`,
                  )
                }
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-800/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                      #{ticket._id.slice(-6)}
                    </span>

                    <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">
                      {ticket.priority}
                    </span>
                  </div>

                  <h3 className="mt-2 truncate text-sm font-medium text-white">
                    {ticket.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    {ticket.categoryId?.name ||
                      "Uncategorized"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${ticket.status ===
                        "pending"
                        ? "bg-amber-500/10 text-amber-400"
                        : ticket.status ===
                          "in_progress"
                          ? "bg-blue-500/10 text-blue-400"
                          : ticket.status ===
                            "resolved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-700/50 text-slate-400"
                      }`}
                  >
                    {ticket.status.replace(
                      "_",
                      " ",
                    )}
                  </span>

                  <ArrowRight
                    size={16}
                    className="text-slate-600"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-slate-800 p-4 sm:hidden">
          <button
            onClick={() =>
              navigate("/tickets")
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            View all tickets
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequesterDashboard;