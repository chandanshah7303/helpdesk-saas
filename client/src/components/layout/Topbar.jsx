import { useEffect, useRef, useState } from "react";
import {
    Bell,
    Search,
    Menu,
    CheckCheck,
    X,
    Ticket,
    Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { getTickets } from "../../services/ticket.service.js";

function Topbar({ onMenuClick }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ============================================================
    // STATE
    // ============================================================

    const [notificationOpen, setNotificationOpen] = useState(false);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // ============================================================
    // REFS
    // ============================================================

    const notificationRef = useRef(null);
    const searchRef = useRef(null);

    // ============================================================
    // USER INITIALS
    // ============================================================

    const initials =
        user?.name
            ?.split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

    // ============================================================
    // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    // ============================================================

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setNotificationOpen(false);
            }

            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, []);

    // ============================================================
    // SEARCH TICKETS
    // ============================================================

    useEffect(() => {
        const searchTickets = async () => {
            const value = searchText.trim();

            if (!value) {
                setSearchResults([]);
                setSearchLoading(false);
                return;
            }

            try {
                setSearchLoading(true);

                const response = await getTickets({
                    search: value,
                    page: 1,
                    limit: 10,
                });

                setSearchResults(response.data?.tickets || []);
            } catch (error) {
                console.error("Search tickets error:", error);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const timer = setTimeout(() => {
            searchTickets();
        }, 350);

        return () => clearTimeout(timer);
    }, [searchText]);

    // ============================================================
    // SEARCH BUTTON
    // ============================================================

    const handleSearchClick = () => {
        setSearchOpen((previous) => !previous);
        setNotificationOpen(false);
    };

    // ============================================================
    // CLEAR SEARCH
    // ============================================================

    const handleClearSearch = () => {
        setSearchText("");
        setSearchResults([]);
    };

    // ============================================================
    // OPEN TICKET
    // ============================================================

    const handleTicketClick = (ticketId) => {
        setSearchOpen(false);
        setSearchText("");
        setSearchResults([]);

        navigate(`/tickets/${ticketId}`);
    };

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    const handleNotificationClick = () => {
        setNotificationOpen((previous) => !previous);
        setSearchOpen(false);
    };

    const handleMarkAllRead = () => {
        setNotificationOpen(false);
    };

    return (
        <header className="flex h-16 items-center justify-between px-4 sm:px-6">

            {/* =====================================================
                LEFT
            ====================================================== */}

            <div className="flex items-center gap-4">

                {/* Mobile Menu */}

                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                >
                    <Menu
                        size={20}
                        strokeWidth={1.8}
                    />
                </button>

                {/* Workspace */}

                <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-700">
                        Workspace
                    </p>

                        <p className="text-xs text-slate-400">
                        Manage your support operations
                    </p>
                </div>
            </div>

            {/* =====================================================
                RIGHT
            ====================================================== */}

            <div className="flex items-center gap-2 sm:gap-4">

                {/* =================================================
                    SEARCH
                ================================================== */}

                <div
                    ref={searchRef}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={handleSearchClick}
                        aria-label="Search tickets"
                        aria-expanded={searchOpen}
                        className={`hidden h-9 w-9 items-center justify-center rounded-xl transition sm:flex ${searchOpen
                                ? "bg-slate-800 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <Search
                            size={18}
                            strokeWidth={1.8}
                        />
                    </button>

                    {/* SEARCH DROPDOWN */}

                    {searchOpen && (
                        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">

                            {/* Search Input */}

                            <div className="border-b border-slate-100 p-3">
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">

                                    <Search
                                        size={16}
                                        className="shrink-0 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(event) =>
                                            setSearchText(event.target.value)
                                        }
                                        placeholder="Search tickets..."
                                        autoFocus
                                        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                    />

                                    {searchText && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            aria-label="Clear search"
                                            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}

                                </div>
                            </div>

                            {/* Search Results */}

                            <div className="max-h-80 overflow-y-auto">

                                {/* Empty */}

                                {!searchText.trim() && (
                                    <div className="px-5 py-8 text-center">
                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                            <Search
                                                size={18}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-800">
                                            Search tickets
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Search by ticket title
                                        </p>
                                    </div>
                                )}

                                {/* Loading */}

                                {searchText.trim() && searchLoading && (
                                    <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-slate-400">
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Searching tickets...
                                    </div>
                                )}

                                {/* No Results */}

                                {searchText.trim() &&
                                    !searchLoading &&
                                    searchResults.length === 0 && (
                                        <div className="px-5 py-8 text-center">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                <Ticket
                                                    size={18}
                                                    strokeWidth={1.8}
                                                />
                                            </div>

                                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                                No tickets found
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Try searching with another title.
                                            </p>
                                        </div>
                                    )}

                                {/* Results */}

                                {searchResults.length > 0 &&
                                    !searchLoading && (
                                        <div className="p-2">

                                            {searchResults.map((ticket) => (
                                                <button
                                                    key={ticket._id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleTicketClick(
                                                            ticket._id,
                                                        )
                                                    }
                                                    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                                                >
                                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                        <Ticket
                                                            size={16}
                                                            strokeWidth={1.8}
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                            {ticket.title}
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-[11px] capitalize text-slate-400">
                                                                {ticket.status?.replace(
                                                                    "_",
                                                                    " ",
                                                                )}
                                                            </span>

                                                            <span className="text-slate-300">
                                                                •
                                                            </span>

                                                            <span className="text-[11px] capitalize text-slate-400">
                                                                {ticket.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}

                                        </div>
                                    )}

                            </div>

                            {/* Footer */}

                            {searchResults.length > 0 && (
                                <div className="border-t border-slate-100 px-4 py-3">
                                    <p className="text-center text-[11px] text-slate-400">
                                        Showing matching tickets
                                    </p>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* =================================================
                    NOTIFICATIONS
                ================================================== */}

                <div
                    ref={notificationRef}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={handleNotificationClick}
                        aria-label="Notifications"
                        aria-expanded={notificationOpen}
                        className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${notificationOpen
                                ? "bg-slate-800 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <Bell
                            size={18}
                            strokeWidth={1.8}
                        />

                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    </button>

                    {/* Notification Dropdown */}

                    {notificationOpen && (
                        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">

                            {/* Header */}

                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Notifications
                                    </h3>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Stay updated with your workspace
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                >
                                    <CheckCheck size={14} />
                                    Mark read
                                </button>

                            </div>

                            {/* Content */}

                            <div className="p-4">

                                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 px-5 py-8 text-center">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                        <Bell
                                            size={20}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-slate-800">
                                        You're all caught up
                                    </p>

                                    <p className="mt-1 max-w-60 text-xs leading-5 text-slate-400">
                                        New ticket activity and workspace updates will appear here.
                                    </p>

                                </div>

                            </div>

                            {/* Footer */}

                            <div className="border-t border-slate-100 px-4 py-3">

                                <p className="text-center text-[11px] text-slate-400">
                                    Notifications are currently up to date
                                </p>

                            </div>

                        </div>
                    )}
                </div>

                {/* =================================================
                    DIVIDER
                ================================================== */}

                <div className="hidden h-7 w-px bg-slate-800 sm:block" />

                {/* =================================================
                    USER
                ================================================== */}

                <div className="flex items-center gap-3">

                    <div className="hidden text-right sm:block">
                        <p className="max-w-32 truncate text-sm font-medium text-white">
                            {user?.name || "User"}
                        </p>

                        <p className="text-xs capitalize text-slate-500">
                            {user?.role || "User"}
                        </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white ring-2 ring-indigo-600/20">
                        {initials}
                    </div>

                </div>
            </div>
        </header>
    );
}

export default Topbar;