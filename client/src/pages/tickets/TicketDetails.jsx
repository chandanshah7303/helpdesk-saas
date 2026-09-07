import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, User, MessageSquare, Activity, UserPlus } from "lucide-react";

import toast from "react-hot-toast";

import { getTicketDetails, assignTicket, updateTicketStatus, createComment } from "../../services/ticket.service";

import { getUsers } from "../../services/user.service";

function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Assignment states
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [commentMessage, setCommentMessage] = useState("");
    const [addingComment, setAddingComment] = useState(false);

    // Get current logged-in user
    const currentUser = JSON.parse(
        localStorage.getItem("user") || "null",
    );

    const isAdmin = currentUser?.role === "admin";

    // LOAD TICKET DETAILS
    const loadTicketDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getTicketDetails(id);

            setDetails(result.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load ticket details.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicketDetails();
    }, [id]);

    // LOAD ACTIVE AGENTS
    useEffect(() => {
        if (!isAdmin) return;

        const loadAgents = async () => {
            try {
                const result = await getUsers();

                const users = result.data?.users || [];

                const activeAgents = users.filter(
                    (user) =>
                        user.role === "agent" &&
                        user.isActive === true,
                );

                setAgents(activeAgents);
            } catch (error) {
                console.error(error);

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load agents",
                );
            }
        };

        loadAgents();
    }, [isAdmin]);

    // ASSIGN TICKET
    const handleAssignTicket = async () => {
        if (!selectedAgent) {
            toast.error("Please select an agent");
            return;
        }

        try {
            setAssigning(true);

            await assignTicket(id, selectedAgent);

            toast.success("Ticket assigned successfully");

            // Reload ticket details
            await loadTicketDetails();

            // Reset dropdown
            setSelectedAgent("");
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to assign ticket",
            );
        } finally {
            setAssigning(false);
        }
    };

    // UPDATE TICKET STATUS
    const handleStatusUpdate = async (status) => {
        try {
            setUpdatingStatus(true);

            await updateTicketStatus(id, status);

            toast.success("Ticket status updated successfully");

            await loadTicketDetails();
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update ticket status",
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentMessage.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        try {
            setAddingComment(true);

            await createComment(id, commentMessage.trim());

            toast.success("Comment added successfully");

            setCommentMessage("");

            await loadTicketDetails();
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to add comment",
            );
        } finally {
            setAddingComment(false);
        }
    };

    // LOADING
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />

                <div className="h-48 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />

                <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />
            </div>
        );
    }

    // ERROR
    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">
                    {error}
                </p>

                <button
                    onClick={() => navigate("/tickets")}
                    className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                    ← Back to Tickets
                </button>
            </div>
        );
    }
  
    if (!details) {
        return null;
    }

    const { ticket, comments, history } = details;

    return (
        <div className="mx-auto max-w-6xl space-y-6">

            {/* BACK */}
            <button
                onClick={() => navigate("/tickets")}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
                <ArrowLeft size={17} />
                Back to Tickets
            </button>

            {/* TICKET HEADER */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div>
                        <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                #{ticket._id.slice(-6)}
                            </span>

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                                {ticket.categoryId?.name}
                            </span>

                        </div>

                        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {ticket.title}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Created{" "}
                            {new Date(
                                ticket.createdAt,
                            ).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex gap-2">

                        <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-700 ring-1 ring-orange-200">
                            {ticket.priority}
                        </span>

                        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold capitalize text-indigo-700 ring-1 ring-indigo-100">
                            {ticket.status.replace(
                                "_",
                                " ",
                            )}
                        </span>

                    </div>

                </div>

                {/* DESCRIPTION */}
                <div className="mt-8 border-t border-slate-100 pt-6">

                    <h2 className="text-sm font-bold text-slate-900">
                        Description
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {ticket.description}
                    </p>

                </div>

                {/* PEOPLE */}
                <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">

                    {/* Requester */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <User size={15} />
                            Requester
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-900">
                            {ticket.createdBy?.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {ticket.createdBy?.email}
                        </p>

                    </div>

                    {/* Assigned Agent */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <User size={15} />
                            Assigned Agent
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-900">
                            {ticket.assignedTo?.name ||
                                "Not assigned"}
                        </p>

                        {ticket.assignedTo?.email && (
                            <p className="mt-1 text-xs text-slate-500">
                                {ticket.assignedTo.email}
                            </p>
                        )}

                    </div>

                </div>
            </div>

            {/* ADMIN — ASSIGN TICKET */}
            {isAdmin && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-7">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                            <UserPlus size={18} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-900">
                                Assign Ticket
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Assign this ticket to an active support agent.
                            </p>
                        </div>

                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                        <select
                            value={selectedAgent}
                            onChange={(event) =>
                                setSelectedAgent(
                                    event.target.value,
                                )
                            }
                            disabled={assigning}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            <option value="">
                                Select an agent
                            </option>

                            {agents.map((agent) => (
                                <option
                                    key={agent._id}
                                    value={agent._id}
                                >
                                    {agent.name} —{" "}
                                    {agent.email}
                                </option>
                            ))}

                        </select>

                        <button
                            type="button"
                            onClick={handleAssignTicket}
                            disabled={
                                assigning ||
                                !selectedAgent
                            }
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {assigning
                                ? "Assigning..."
                                : "Assign Ticket"}
                        </button>

                    </div>

                    {agents.length === 0 && (
                        <p className="mt-3 text-xs text-amber-400">
                            No active agents are available.
                        </p>
                    )}

                </div>
            )}

            {/* STATUS ACTIONS */}
            {(currentUser?.role === "admin" ||
                currentUser?.role === "agent") && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-7">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                <Clock size={18} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Ticket Status
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update the ticket status according to its current progress.
                                </p>
                            </div>

                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">

                            {/* IN PROGRESS */}
                            {ticket.status === "pending" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleStatusUpdate("in_progress")
                                    }
                                    disabled={updatingStatus}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updatingStatus
                                        ? "Updating..."
                                        : "Start Working"}
                                </button>
                            )}

                            {/* RESOLVED */}
                            {ticket.status === "in_progress" &&
                                (currentUser?.role === "admin" ||
                                    currentUser?.role === "agent") && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleStatusUpdate("resolved")
                                        }
                                        disabled={updatingStatus}
                                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updatingStatus
                                            ? "Updating..."
                                            : "Mark as Resolved"}
                                    </button>
                                )}

                            {/* CLOSE — ADMIN ONLY */}
                            {ticket.status === "resolved" &&
                                currentUser?.role === "admin" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleStatusUpdate("closed")
                                        }
                                        disabled={updatingStatus}
                                        className="rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updatingStatus
                                            ? "Updating..."
                                            : "Close Ticket"}
                                    </button>
                                )}

                        </div>

                    </div>
                )}

            {/* COMMENTS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-7">

                <div className="flex items-center gap-2">

                    <MessageSquare
                        size={18}
                        className="text-indigo-600"
                    />

                    <h2 className="font-bold text-slate-900">
                        Comments
                    </h2>

                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        {comments.length}
                    </span>

                </div>

                {/* EXISTING COMMENTS */}
                {comments.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">
                        No comments yet.
                    </p>
                ) : (
                    <div className="mt-6 space-y-5">

                        {comments.map((comment) => (
                            <div
                                key={comment._id}
                                className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0"
                            >

                                <div className="flex items-center justify-between gap-3">

                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {comment.authorId?.name}
                                        </p>

                                        <p className="text-xs capitalize text-slate-500">
                                            {comment.authorId?.role}
                                        </p>
                                    </div>

                                    <span className="text-xs text-slate-400">
                                        {new Date(
                                            comment.createdAt,
                                        ).toLocaleString()}
                                    </span>

                                </div>

                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {comment.message}
                                </p>

                            </div>
                        ))}

                    </div>
                )}

                {/* ADD COMMENT */}
                {ticket.status !== "closed" && (
                    <div className="mt-6 border-t border-slate-100 pt-6">

                        <label
                            htmlFor="comment"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Add a comment
                        </label>

                        <textarea
                            id="comment"
                            value={commentMessage}
                            onChange={(event) =>
                                setCommentMessage(event.target.value)
                            }
                            placeholder="Write your comment..."
                            rows={4}
                            disabled={addingComment}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div className="mt-3 flex justify-end">

                            <button
                                type="button"
                                onClick={handleAddComment}
                                disabled={
                                    addingComment ||
                                    !commentMessage.trim()
                                }
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {addingComment
                                    ? "Adding..."
                                    : "Add Comment"}
                            </button>

                        </div>

                    </div>
                )}

                {ticket.status === "closed" && (
                    <p className="mt-6 border-t border-slate-100 pt-6 text-sm text-slate-500">
                        This ticket is closed. New comments cannot be added.
                    </p>
                )}

            </div>

            {/* ACTIVITY */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-7">

                <div className="flex items-center gap-2">

                    <Activity
                        size={18}
                        className="text-indigo-600"
                    />

                    <h2 className="font-bold text-slate-900">
                        Activity History
                    </h2>

                </div>

                {history.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">
                        No activity recorded.
                    </p>
                ) : (
                    <div className="mt-6 space-y-5">

                        {history.map((item) => (
                            <div
                                key={item._id}
                                className="flex gap-4"
                            >

                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                    <Clock size={15} />
                                </div>

                                <div>

                                    <p className="text-sm font-semibold text-slate-900">
                                        {item.action
                                            ?.replaceAll(
                                                "_",
                                                " ",
                                            )
                                            .replace(
                                                /\b\w/g,
                                                (char) =>
                                                    char.toUpperCase(),
                                            )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        By{" "}
                                        {item.actorId?.name ||
                                            "System"}{" "}
                                        •{" "}
                                        {new Date(
                                            item.createdAt,
                                        ).toLocaleString()}
                                    </p>

                                    {item.oldValue &&
                                        item.newValue && (
                                            <p className="mt-2 text-xs text-slate-600">
                                                {
                                                    item.oldValue
                                                }{" "}
                                                →{" "}
                                                {
                                                    item.newValue
                                                }
                                            </p>
                                        )}

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default TicketDetails;
