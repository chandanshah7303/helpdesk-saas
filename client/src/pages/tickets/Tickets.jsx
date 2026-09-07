import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    ChevronRight,
    Ticket as TicketIcon,
    SlidersHorizontal,
    X,
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

    // ============================================================
    // LOAD TICKETS
    // ============================================================

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getTickets({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search.trim() || undefined,
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
        }, search ? 400 : 0);

        return () => clearTimeout(timer);
    }, [
        pagination.page,
        pagination.limit,
        search,
        status,
        priority,
    ]);

    // ============================================================
    // SEARCH
    // ============================================================

    const handleSearchChange = (event) => {
        const value = event.target.value;

        setSearch(value);

        if (pagination.page !== 1) {
            setPagination((previous) => ({
                ...previous,
                page: 1,
            }));
        }
    };

    // ============================================================
    // STATUS
    // ============================================================

    const handleStatusChange = (event) => {
        setStatus(event.target.value);

        setPagination((previous) => ({
            ...previous,
            page: 1,
        }));
    };

    // ============================================================
    // PRIORITY
    // ============================================================

    const handlePriorityChange = (event) => {
        setPriority(event.target.value);

        setPagination((previous) => ({
            ...previous,
            page: 1,
        }));
    };

    // ============================================================
    // CLEAR FILTERS
    // ============================================================

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setPriority("");

        setPagination((previous) => ({
            ...previous,
            page: 1,
        }));
    };

    const hasFilters =
        search.trim() !== "" ||
        status !== "" ||
        priority !== "";

    // ============================================================
    // STATUS STYLE
    // ============================================================

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
            "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20"
        );
    };

    // ============================================================
    // PRIORITY STYLE
    // ============================================================

    const getPriorityStyle = (ticketPriority) => {
        const styles = {
            low: "text-slate-400",
            medium: "text-blue-400",
            high: "text-orange-400",
            urgent: "text-red-400",
        };

        return styles[ticketPriority] || "text-slate-400";
    };

    // ============================================================
    // FORMAT STATUS
    // ============================================================

    const formatStatus = (value = "") => {
        return value
            .replace("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="space-y-6">

                {/* Header Skeleton */}

                <div className="flex items-center justify-between">
                    <div className="space-y-3">
                        <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-800" />
                        <div className="h-4 w-64 animate-pulse rounded-lg bg-slate-900" />
                    </div>

                    <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-800" />
                </div>

                {/* Filter Skeleton */}

                <div className="h-20 animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />

                {/* Table Skeleton */}

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                    <div className="h-12 border-b border-slate-800 bg-slate-900/80" />

                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="h-20 animate-pulse border-b border-slate-800/70"
                        />
                    ))}

                </div>
            </div>
        );
    }

    return (
        <div className="space-y-7">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-950/30">
                            <TicketIcon
                                size={20}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>

                            <h1 className="text-3xl font-bold tracking-[-0.03em] text-white">
                                Tickets
                            </h1>

                            <p className="mt-1.5 text-sm text-slate-400">
                                Manage and track support requests
                            </p>

                        </div>

                    </div>

                </div>

                {(user?.role === "admin" ||
                    user?.role === "requester") && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/tickets/create")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 active:scale-[0.98]"
                    >
                        <Plus size={18} />
                        Create Ticket
                    </button>
                )}

            </div>

            {/* =====================================================
                FILTER BAR
            ====================================================== */}

            <div className="rounded-2xl border border-white/7 bg-slate-900/80 p-4 shadow-xl shadow-black/10 ring-1 ring-white/2">

                <div className="flex flex-col gap-3 lg:flex-row">

                    {/* Search */}

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search tickets by title..."
                            className="h-11 w-full rounded-xl border border-white/8 bg-slate-950/70 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/14 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setPagination((previous) => ({
                                        ...previous,
                                        page: 1,
                                    }));
                                }}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                            >
                                <X size={14} />
                            </button>
                        )}

                    </div>

                    {/* Status */}

                    <div className="flex items-center gap-2">

                        <SlidersHorizontal
                            size={16}
                            className="hidden text-slate-600 lg:block"
                        />

                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="h-11 min-w-36 rounded-xl border border-white/8 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none transition hover:border-white/14 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10"
                        >
                            <option value="">
                                All Status
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="in_progress">
                                In Progress
                            </option>

                            <option value="resolved">
                                Resolved
                            </option>

                            <option value="closed">
                                Closed
                            </option>
                        </select>

                    </div>

                    {/* Priority */}

                    <select
                        value={priority}
                        onChange={handlePriorityChange}
                        className="h-11 min-w-36 rounded-xl border border-white/8 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none transition hover:border-white/14 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10"
                    >
                        <option value="">
                            All Priority
                        </option>

                        <option value="low">
                            Low
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="high">
                            High
                        </option>

                        <option value="urgent">
                            Urgent
                        </option>
                    </select>

                    {/* Clear */}

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="h-11 rounded-xl border border-white/8 px-4 text-sm font-medium text-slate-400 transition hover:border-white/14 hover:bg-white/4 hover:text-white"
                        >
                            Clear
                        </button>
                    )}

                </div>

            </div>

            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* =====================================================
                TICKET LIST
            ====================================================== */}

            <div className="overflow-hidden rounded-2xl border border-white/7 bg-slate-900/80 shadow-xl shadow-black/10 ring-1 ring-white/2">

                {/* Desktop Header */}

                <div className="hidden grid-cols-[2fr_1.2fr_0.8fr_1fr_32px] gap-5 border-b border-white/6 bg-white/2.5 px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:grid">

                    <span>Ticket</span>

                    <span>Requester</span>

                    <span>Priority</span>

                    <span>Status</span>

                    <span />

                </div>

                {/* Empty State */}

                {tickets.length === 0 ? (

                    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
                            <TicketIcon
                                size={24}
                                strokeWidth={1.7}
                            />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-white">
                            No tickets found
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            {hasFilters
                                ? "Try changing your search or filters."
                                : "There are no tickets in your workspace yet."}
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-4 text-xs font-semibold text-indigo-400 transition hover:text-indigo-300"
                            >
                                Clear all filters
                            </button>
                        )}

                    </div>

                ) : (

                    tickets.map((ticket) => (

                        <button
                            key={ticket._id}
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/tickets/${ticket._id}`,
                                )
                            }
                            className="group block w-full cursor-pointer border-b border-white/5.5 px-5 py-4 text-left transition last:border-b-0 hover:bg-indigo-500/4.5 focus:bg-indigo-500/4.5 focus:outline-none"
                        >

                            <div className="grid gap-4 md:grid-cols-[2fr_1.2fr_0.8fr_1fr_32px] md:items-center">

                                {/* Ticket */}

                                <div className="min-w-0">

                                    <div className="flex items-start gap-3">

                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/10 text-indigo-300 transition group-hover:border-indigo-400/20 group-hover:bg-indigo-500/15">
                                            <TicketIcon
                                                size={17}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-slate-100 transition group-hover:text-indigo-100">
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

                                <div className="min-w-0">

                                    <p className="truncate text-sm text-slate-300">
                                        {ticket.createdBy?.name ||
                                            "Unknown"}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-slate-600">
                                        {ticket.createdBy?.email ||
                                            "No email"}
                                    </p>

                                </div>

                                {/* Priority */}

                                <div>

                                    <span
                                        className={`text-[11px] font-bold uppercase tracking-wide ${getPriorityStyle(
                                            ticket.priority,
                                        )}`}
                                    >
                                        {ticket.priority ||
                                            "Normal"}
                                    </span>

                                </div>

                                {/* Status */}

                                <div>

                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                                            ticket.status,
                                        )}`}
                                    >
                                        {formatStatus(
                                            ticket.status,
                                        )}
                                    </span>

                                </div>

                                {/* Arrow */}

                                <div className="hidden justify-end md:flex">

                                    <ChevronRight
                                        size={17}
                                        className="text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-slate-300"
                                    />

                                </div>

                            </div>

                        </button>

                    ))
                )}

                {/* =================================================
                    FOOTER
                ================================================== */}

                <div className="flex flex-col gap-3 border-t border-white/6 bg-white/2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-500">

                        Showing{" "}

                        <span className="font-semibold text-slate-300">
                            {tickets.length}
                        </span>{" "}

                        of{" "}

                        <span className="font-semibold text-slate-300">
                            {pagination.total}
                        </span>{" "}
                        tickets

                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                setPagination((previous) => ({
                                    ...previous,
                                    page:
                                        previous.page - 1,
                                }))
                            }
                            className="rounded-lg border border-white/8 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/14 hover:bg-white/4 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            Previous
                        </button>

                        <span className="min-w-8 rounded-lg border border-indigo-400/15 bg-indigo-500/10 px-3 py-1.5 text-center text-xs font-semibold text-indigo-300">
                            {pagination.page}
                        </span>

                        <button
                            type="button"
                            disabled={
                                pagination.page >=
                                pagination.totalPages
                            }
                            onClick={() =>
                                setPagination((previous) => ({
                                    ...previous,
                                    page:
                                        previous.page + 1,
                                }))
                            }
                            className="rounded-lg border border-white/8 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/14 hover:bg-white/4 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
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