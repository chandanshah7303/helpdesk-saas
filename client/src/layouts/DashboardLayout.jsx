import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";

import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";

function DashboardLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex min-h-screen">

                {/* Desktop Sidebar */}
                <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 lg:block">
                    <Sidebar />
                </aside>

                {/* Mobile Sidebar */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">

                        {/* Overlay */}
                        <button
                            type="button"
                            aria-label="Close menu"
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute inset-0 bg-black/60"
                        />

                        {/* Drawer */}
                        <aside className="relative z-10 h-full w-64 border-r border-slate-800 bg-slate-900">
                            <div className="absolute right-3 top-4 z-20">
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                                    aria-label="Close menu"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <Sidebar
                                onNavigate={() => setMobileMenuOpen(false)}
                            />
                        </aside>
                    </div>
                )}

                {/* Main Area */}
                <div className="flex min-w-0 flex-1 flex-col">

                    {/* Topbar */}
                    <header className="border-b border-slate-800 bg-slate-900">
                        <Topbar
                            onMenuClick={() => setMobileMenuOpen(true)}
                        />
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-6">
                        <Outlet />
                    </main>

                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;