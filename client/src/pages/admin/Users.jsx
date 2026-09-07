import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Search, UserX } from "lucide-react";

import {
    getUsers,
    createUser,
    updateUser,
    deactivateUser,
} from "../../services/user.service.js";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 1,
    });
    const [deactivatingId, setDeactivatingId] = useState(null);

    // Add User Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Create User Form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "agent",
    });

    // Load Users
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getUsers({
                page: pagination.page,
                limit: 10,
                search: search.trim() || undefined,
                role: roleFilter || undefined,
                isActive: activeFilter || undefined,
            });

            setUsers(result.data.users);
            setPagination(result.data.pagination);
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
    }, [pagination.page, search, roleFilter, activeFilter]);

    const resetToFirstPage = () => {
        setPagination((previous) => ({
            ...previous,
            page: 1,
        }));
    };

    const handleDeactivateUser = async (userId) => {
        if (!window.confirm("Deactivate this user? They will no longer be able to sign in.")) {
            return;
        }

        try {
            setDeactivatingId(userId);
            await deactivateUser(userId);
            toast.success("User deactivated successfully");
            await loadUsers();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to deactivate user",
            );
        } finally {
            setDeactivatingId(null);
        }
    };

    // Handle Form Change
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Reset Form
    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "agent",
        });

        setShowPassword(false);
    };

    // Close Modal
    const handleCloseModal = () => {
        if (creatingUser) {
            return;
        }

        setShowCreateModal(false);
        setEditingUser(null);
        resetForm();
    };

    // Create User
    const handleCreateUser = async (event) => {
        event.preventDefault();

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        // Required fields
        if (!name || !email || (!editingUser && !password)) {
            toast.error("Please fill in all fields.");
            return;
        }

        // Name validation
        if (name.length < 2) {
            toast.error("Name must be at least 2 characters.");
            return;
        }

        // Password validation
        if (password && password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        try {
            setCreatingUser(true);

            const response = editingUser
                ? await updateUser(editingUser._id, {
                    name,
                    email,
                    password: password || undefined,
                    role: formData.role,
                })
                : await createUser({
                    name,
                    email,
                    password,
                    role: formData.role,
                });

            toast.success(
                response.message ||
                (editingUser
                    ? "User updated successfully."
                    : "User created successfully."),
            );

            // Close modal
            setShowCreateModal(false);

            // Reset form
            resetForm();

            // Refresh users list
            await loadUsers();
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.message ||
                "Unable to create user. Please try again.";

            toast.error(message);
        } finally {
            setCreatingUser(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            role: user.role || "requester",
        });
        setShowPassword(false);
        setShowCreateModal(true);
    };

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Users
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage organization users
                    </p>
                </div>

                {/* Add User Button */}
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 5v14M5 12h14"
                        />
                    </svg>

                    Add User
                </button>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_160px_160px]">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            resetToFirstPage();
                        }}
                        placeholder="Search by name..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(event) => {
                        setRoleFilter(event.target.value);
                        resetToFirstPage();
                    }}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="requester">Requester</option>
                </select>

                <select
                    value={activeFilter}
                    onChange={(event) => {
                        setActiveFilter(event.target.value);
                        resetToFirstPage();
                    }}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                    <option value="">All statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Users */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">

                {/* Table Header */}
                <div className="hidden grid-cols-4 gap-4 border-b border-white/6 bg-white/2.5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Status</span>
                </div>

                {/* Users List */}
                {users.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-500">
                        No users found.
                    </div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user._id}
                            className="grid gap-3 border-b border-white/5 px-5 py-4 transition hover:bg-indigo-500/4.5 last:border-b-0 md:grid-cols-4 md:gap-4"
                        >
                            {/* Name */}
                            <div className="flex items-center justify-between gap-3 text-sm font-medium text-white md:block">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Name</span>
                                {user.name}
                            </div>

                            {/* Email */}
                            <div className="flex items-center justify-between gap-3 text-sm text-slate-400 md:block">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Email</span>
                                {user.email}
                            </div>

                            {/* Role */}
                            <div className="flex items-center justify-between gap-3 text-sm capitalize text-slate-300 md:block">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Role</span>
                                {user.role}
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between gap-3 md:block">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Status</span>
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

                                {user.isActive && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeactivateUser(user._id)}
                                        disabled={deactivatingId === user._id}
                                        title="Deactivate user"
                                        className="ml-3 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                        <UserX size={16} />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleEditUser(user)}
                                    title="Edit user"
                                    className="ml-1 rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                    <Pencil size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                    <span>{pagination.total} users</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination((previous) => ({ ...previous, page: previous.page - 1 }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="font-semibold text-slate-700">{pagination.page} / {pagination.totalPages}</span>
                        <button
                            type="button"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination((previous) => ({ ...previous, page: previous.page + 1 }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/8 bg-slate-900 shadow-2xl shadow-black/40">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/6 px-6 py-5">

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {editingUser ? "Edit User" : "Create User"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Add an Agent or Requester to your organization.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={creatingUser}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleCreateUser}
                            className="space-y-5 p-6"
                        >

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="user-name"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Full name
                                </label>

                                <input
                                    id="user-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    autoComplete="name"
                                    required
                                    disabled={creatingUser}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="user-email"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Email address
                                </label>

                                <input
                                    id="user-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    autoComplete="email"
                                    required
                                    disabled={creatingUser}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="user-password"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Password {editingUser && <span className="font-normal text-slate-400">(optional)</span>}
                                </label>

                                <div className="relative">
                                    <input
                                        id="user-password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        autoComplete="new-password"
                                        required={!editingUser}
                                        disabled={creatingUser}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) => !previous,
                                            )
                                        }
                                        disabled={creatingUser}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 3l18 18"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.58 10.58a2 2 0 002.84 2.84"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 8.5 4 9.5 6a11.8 11.8 0 01-3.16 3.77"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.61 6.61C4.9 7.68 3.68 9.13 3 10c1 2 4.5 6 9 6 1.04 0 2.03-.2 2.92-.55"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z"
                                                />
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="2.5"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    Password must be at least 6 characters.
                                </p>
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="user-role"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Role
                                </label>

                                <select
                                    id="user-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={creatingUser}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {editingUser && <option value="admin">Admin</option>}
                                    <option value="agent">
                                        Agent
                                    </option>

                                    <option value="requester">
                                        Requester
                                    </option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={creatingUser}
                                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creatingUser}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creatingUser
                                        ? "Creating user..."
                                        : editingUser
                                            ? "Save Changes"
                                            : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;
