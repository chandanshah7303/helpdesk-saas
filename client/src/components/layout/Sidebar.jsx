import {
    LayoutDashboard,
    Ticket,
    Users,
    Tags,
    Settings,
    LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Sidebar({ onNavigate }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navigation = [
        {
            label: "Dashboard",
            path: `/${user?.role}/dashboard`,
            icon: LayoutDashboard,
            roles: ["admin", "agent", "requester"],
        },
        {
            label: "Tickets",
            path: "/tickets",
            icon: Ticket,
            roles: ["admin", "agent", "requester"],
        },
        {
            label: "Users",
            path: "/users",
            icon: Users,
            roles: ["admin"],
        },
        {
            label: "Categories",
            path: "/categories",
            icon: Tags,
            roles: ["admin", "agent", "requester"],
        },
        {
            label: "Settings",
            path: "/settings",
            icon: Settings,
            roles: ["admin","agent", "requester"],
        },
    ];

    const visibleNavigation = navigation.filter((item) =>
        item.roles.includes(user?.role),
    );

    const handleLogout = () => {
        logout();
        navigate("/login");

        // Close mobile sidebar if open
        if (onNavigate) {
            onNavigate();
        }
    };

    return (
        <div className="flex h-full flex-col">

            {/* Brand */}
            <div className="flex h-16 items-center border-b border-slate-800 px-5">
                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
                        H
                    </div>

                    <div>
                        <p className="text-sm font-semibold tracking-tight text-white">
                            Helpdesk
                        </p>

                        <p className="text-[11px] text-slate-500">
                            SaaS Platform
                        </p>
                    </div>

                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-5">

                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    Workspace
                </p>

                {visibleNavigation.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                    ? "bg-indigo-600/15 text-indigo-400"
                                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={18}
                                        strokeWidth={isActive ? 2.3 : 1.8}
                                        className="shrink-0"
                                    />

                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-slate-800 p-3">

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut size={18} strokeWidth={1.8} />

                    <span>Logout</span>
                </button>

            </div>
        </div>
    );
}

export default Sidebar;