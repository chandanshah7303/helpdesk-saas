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
            roles: ["admin", "agent", "requester"],
        },
    ];

    const visibleNavigation = navigation.filter((item) =>
        item.roles.includes(user?.role),
    );

    const handleLogout = () => {
        logout();
        navigate("/login");

        if (onNavigate) {
            onNavigate();
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">

            {/* =====================================================
                BRAND
            ====================================================== */}

            <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
                        H
                    </div>

                    <div>
                        <p className="text-sm font-bold tracking-tight text-slate-900">
                            Helpdesk
                        </p>

                        <p className="text-[10px] font-medium tracking-[0.08em] text-slate-400">
                            SAAS PLATFORM
                        </p>
                    </div>

                </div>
            </div>

            {/* =====================================================
                NAVIGATION
            ====================================================== */}

            <nav className="flex-1 overflow-y-auto px-3 py-6">

                            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Workspace
                </p>

                <div className="space-y-1">

                    {visibleNavigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Active indicator */}

                                        {isActive && (
                                            <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-indigo-600" />
                                        )}

                                        {/* Icon */}

                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${isActive
                                                    ? "bg-indigo-100 text-indigo-600"
                                                    : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700"
                                                }`}
                                        >
                                            <Icon
                                                size={17}
                                                strokeWidth={
                                                    isActive ? 2.2 : 1.8
                                                }
                                            />
                                        </span>

                                        {/* Label */}

                                        <span className="flex-1">
                                            {item.label}
                                        </span>

                                        {/* Active dot */}

                                        {isActive && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                </div>
            </nav>

            {/* =====================================================
                LOGOUT
            ====================================================== */}

            <div className="border-t border-slate-200 p-3">

                <button
                    type="button"
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-red-100 group-hover:text-red-600">
                        <LogOut
                            size={17}
                            strokeWidth={1.8}
                        />
                    </span>

                    <span>
                        Sign out
                    </span>
                </button>

            </div>
        </div>
    );
}

export default Sidebar;