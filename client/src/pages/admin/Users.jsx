import { useEffect, useState } from "react";

import { getUsers } from "../../services/user.service.js";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getUsers();

            console.log("USERS:", result);

            setUsers(result.data.users);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load users.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-800" />

                <div className="h-72 animate-pulse rounded-2xl bg-slate-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Users
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Manage organization users
                </p>
            </div>

            {/* Users */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

                <div className="grid grid-cols-4 gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Status</span>
                </div>

                {users.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-500">
                        No users found.
                    </div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user._id}
                            className="grid grid-cols-4 gap-4 border-b border-slate-800/80 px-5 py-4 last:border-b-0"
                        >
                            <div className="text-sm font-medium text-white">
                                {user.name}
                            </div>

                            <div className="text-sm text-slate-400">
                                {user.email}
                            </div>

                            <div className="text-sm capitalize text-slate-300">
                                {user.role}
                            </div>

                            <div>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-red-500/10 text-red-400"
                                        }`}
                                >
                                    {user.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>
                        </div>
                    ))
                )}

            </div>

        </div>
    );
}

export default Users;