import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    ChevronRight,
    Ticket as TicketIcon,
} from "lucide-react";

import { getTickets } from "../../services/ticket.service";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Tickets() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getTickets({
                page: pagination.page,
                limit: pagination.limit,
                search: search || undefined,
                status: status || undefined,
                priority: priority || undefined,
            });

            setTickets(result.data.tickets);
            setPagination(result.data.pagination);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load tickets.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, [pagination.page, status, priority]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.page === 1) {
                loadTickets();
            } else {
                setPagination((prev) => ({
                    ...prev,
                    page: 1,
                }));
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const getStatusStyle = (ticketStatus) => {
        const styles = {
            pending:
                "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",

            in_progress:
                "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",

            resolved:
                "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",

            closed:
                "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20",
        };

        return (
            styles[ticketStatus] ||
            "bg-slate-500/10 text-slate-400"
        );
    };

    const getPriorityStyle = (ticketPriority) => {
        const styles = {
            low: "text-slate-400",
            medium: "text-blue-400",
            high: "text-orange-400",
            urgent: "text-red-400",
        };

        return styles[ticketPriority] || "text-slate-400";
    };

    const formatStatus = (value) => {
        return value
            .replace("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-800" />

                <div className="h-16 animate-pulse rounded-2xl bg-slate-900" />

                <div className="h-72 animate-pulse rounded-2xl bg-slate-900" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                            <TicketIcon size={20} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">
                                Tickets
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage and track support requests
                            </p>
                        </div>
                    </div>
                </div>

                {(user?.role === "admin" ||
                    user?.role === "requester") && (
                        <button
                            type="button"
                            onClick={() => navigate("/tickets/create")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                        >
                            <Plus size={18} />
                            Create Ticket
                        </button>
                    )}
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search tickets..."
                            className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);

                            setPagination((prev) => ({
                                ...prev,
                                page: 1,
                            }));
                        }}
                        className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-300 outline-none focus:border-indigo-500/50"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">
                            In Progress
                        </option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>

                    {/* Priority */}
                    <select
                        value={priority}
                        onChange={(event) => {
                            setPriority(event.target.value);

                            setPagination((prev) => ({
                                ...prev,
                                page: 1,
                            }));
                        }}
                        className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-300 outline-none focus:border-indigo-500/50"
                    >
                        <option value="">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Tickets */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                {/* Desktop Header */}
                <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_40px] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
                    <span>Ticket</span>
                    <span>Requester</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span />
                </div>

                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                            <TicketIcon size={22} />
                        </div>

                        <h3 className="text-sm font-semibold text-white">
                            No tickets found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or filters.
                        </p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div
                            key={ticket._id}
                            onClick={() => navigate(`/tickets/${ticket._id}`)}
                            className="group cursor-pointer border-b border-slate-800/80 px-5 py-4 transition last:border-b-0 hover:bg-slate-800/30"
                        >
                            <div className="grid gap-4 md:grid-cols-[2fr_1.2fr_1fr_1fr_40px] md:items-center">
                                {/* Ticket */}
                                <div className="min-w-0">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                                            <TicketIcon size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-white">
                                                {ticket.title}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                {ticket.categoryId?.name ||
                                                    "Uncategorized"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Requester */}
                                <div>
                                    <p className="text-sm text-slate-300">
                                        {ticket.createdBy?.name ||
                                            "Unknown"}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-slate-600">
                                        {ticket.createdBy?.email}
                                    </p>
                                </div>

                                {/* Priority */}
                                <div>
                                    <span
                                        className={`text-xs font-semibold uppercase ${getPriorityStyle(
                                            ticket.priority,
                                        )}`}
                                    >
                                        {ticket.priority}
                                    </span>
                                </div>

                                {/* Status */}
                                <div>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                                            ticket.status,
                                        )}`}
                                    >
                                        {formatStatus(ticket.status)}
                                    </span>
                                </div>

                                {/* Arrow */}
                                <div className="hidden justify-end md:flex">
                                    <ChevronRight
                                        size={18}
                                        className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300"
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-slate-500">
                        Showing{" "}
                        <span className="font-medium text-slate-300">
                            {tickets.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-slate-300">
                            {pagination.total}
                        </span>{" "}
                        tickets
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: prev.page - 1,
                                }))
                            }
                            className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
                            {pagination.page}
                        </span>

                        <button
                            type="button"
                            disabled={
                                pagination.page >=
                                pagination.totalPages
                            }
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: prev.page + 1,
                                }))
                            }
                            className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tickets;