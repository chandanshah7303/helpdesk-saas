import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

function Topbar({ onMenuClick }) {
    const { user } = useAuth();

    const initials =
        user?.name
            ?.split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

    return (
        <header className="flex h-16 items-center justify-between px-4 sm:px-6">

            {/* Left */}
            <div className="flex items-center gap-4">

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                >
                    <Menu size={20} strokeWidth={1.8} />
                </button>

                {/* Workspace */}
                <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-300">
                        Workspace
                    </p>

                    <p className="text-xs text-slate-500">
                        Manage your support operations
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-4">

                {/* Search */}
                <button
                    type="button"
                    className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white sm:flex"
                    aria-label="Search"
                >
                    <Search size={18} strokeWidth={1.8} />
                </button>

                {/* Notification */}
                <button
                    type="button"
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    aria-label="Notifications"
                >
                    <Bell size={18} strokeWidth={1.8} />

                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </button>

                {/* Divider */}
                <div className="hidden h-7 w-px bg-slate-800 sm:block" />

                {/* User */}
                <div className="flex items-center gap-3">

                    {/* User Info */}
                    <div className="hidden text-right sm:block">
                        <p className="max-w-32 truncate text-sm font-medium text-white">
                            {user?.name || "User"}
                        </p>

                        <p className="text-xs capitalize text-slate-500">
                            {user?.role || "User"}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white ring-2 ring-indigo-600/20">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Topbar;