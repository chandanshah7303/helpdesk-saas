import { useEffect, useState } from "react";
import {
    User,
    Building2,
    Bell,
    ShieldCheck,
    Lock,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext.jsx";
import { changePassword } from "../services/auth.service.js";
import {
    getOrganizationById,
    updateOrganization,
    deactivateOrganization,
} from "../services/organization.service.js";

function Settings() {
    const { user } = useAuth();

    const [showChangePassword, setShowChangePassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [changingPassword, setChangingPassword] = useState(false);

    const [organization, setOrganization] = useState(null);
    const [organizationForm, setOrganizationForm] = useState({
        name: "",
        slug: "",
        description: "",
    });
    const [loadingOrganization, setLoadingOrganization] = useState(false);
    const [savingOrganization, setSavingOrganization] = useState(false);
    const [deactivatingOrganization, setDeactivatingOrganization] = useState(false);

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        if (!isAdmin || !user?.organizationId) return;

        const loadOrganization = async () => {
            try {
                setLoadingOrganization(true);

                const response = await getOrganizationById(user.organizationId);
                const data = response.data;

                setOrganization(data);
                setOrganizationForm({
                    name: data.name || "",
                    slug: data.slug || "",
                    description: data.description || "",
                });
            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load organization",
                );
            } finally {
                setLoadingOrganization(false);
            }
        };

        loadOrganization();
    }, [isAdmin, user?.organizationId]);

    const handleOrganizationChange = (event) => {
        const { name, value } = event.target;

        setOrganizationForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleOrganizationSave = async (event) => {
        event.preventDefault();

        if (!organizationForm.name.trim() || !organizationForm.slug.trim()) {
            toast.error("Organization name and slug are required");
            return;
        }

        try {
            setSavingOrganization(true);

            const response = await updateOrganization(
                user.organizationId,
                {
                    name: organizationForm.name.trim(),
                    slug: organizationForm.slug.trim().toLowerCase(),
                    description: organizationForm.description.trim(),
                },
            );

            setOrganization(response.data);
            toast.success("Organization updated successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update organization",
            );
        } finally {
            setSavingOrganization(false);
        }
    };

    const handleOrganizationDeactivate = async () => {
        if (!window.confirm("Deactivate this organization? This will disable access for all members.")) {
            return;
        }

        try {
            setDeactivatingOrganization(true);
            await deactivateOrganization(user.organizationId);
            toast.success("Organization deactivated");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to deactivate organization",
            );
        } finally {
            setDeactivatingOrganization(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }

        try {
            setChangingPassword(true);

            await changePassword(passwordData);

            toast.success("Password changed successfully");

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setShowChangePassword(false);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to change password"
            );
        } finally {
            setChangingPassword(false);
        }
    };

    const handleCancelPasswordChange = () => {
        if (changingPassword) return;

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setShowChangePassword(false);
    };

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Settings
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage your account and workspace preferences.
                </p>
            </div>

            {/* Account Information */}
            <section className="rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">
                    <div className="border-b border-white/6 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                            <User size={19} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Account Information
                            </h2>

                            <p className="text-xs text-slate-500">
                                Your current account details.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2">

                    {/* Name */}
                    <div>
                        <p className="text-xs font-medium text-slate-500">
                            Full Name
                        </p>

                        <p className="mt-1 text-sm text-white">
                            {user?.name || "Not available"}
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <p className="text-xs font-medium text-slate-500">
                            Email Address
                        </p>

                        <p className="mt-1 text-sm text-white">
                            {user?.email || "Not available"}
                        </p>
                    </div>

                    {/* Role */}
                    <div>
                        <p className="text-xs font-medium text-slate-500">
                            Role
                        </p>

                        <span className="mt-1 inline-flex rounded-lg bg-indigo-600/15 px-2.5 py-1 text-xs font-medium capitalize text-indigo-400">
                            {user?.role || "Not available"}
                        </span>
                    </div>

                    {/* Organization */}
                    <div>
                        <p className="text-xs font-medium text-slate-500">
                            Organization
                        </p>

                        <p className="mt-1 text-sm text-white">
                            {user?.organizationId || "Not available"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Workspace */}
            <section className="rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">
                <div className="border-b border-slate-800 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                            <Building2 size={19} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Workspace
                            </h2>

                            <p className="text-xs text-slate-500">
                                Your helpdesk workspace information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    <div>
                        <p className="text-xs font-medium text-slate-500">
                            Organization ID
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-300">
                            {user?.organizationId || "Not available"}
                        </p>
                    </div>
                </div>
            </section>

            {isAdmin && (
                <section className="rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">
                    <div className="border-b border-slate-800 p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                                <Building2 size={19} />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-white">
                                    Organization Settings
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Update your organization profile and workspace identity.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleOrganizationSave} className="space-y-5 p-5">
                        {loadingOrganization ? (
                            <div className="h-32 animate-pulse rounded-xl bg-slate-800" />
                        ) : (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="organization-name" className="mb-2 block text-xs font-medium text-slate-400">
                                            Organization name
                                        </label>
                                        <input
                                            id="organization-name"
                                            name="name"
                                            value={organizationForm.name}
                                            onChange={handleOrganizationChange}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="organization-slug" className="mb-2 block text-xs font-medium text-slate-400">
                                            Workspace slug
                                        </label>
                                        <input
                                            id="organization-slug"
                                            name="slug"
                                            value={organizationForm.slug}
                                            onChange={handleOrganizationChange}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="organization-description" className="mb-2 block text-xs font-medium text-slate-400">
                                        Description
                                    </label>
                                    <textarea
                                        id="organization-description"
                                        name="description"
                                        value={organizationForm.description}
                                        onChange={handleOrganizationChange}
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-slate-500">
                                        {organization?.isActive ? "Workspace is active" : "Workspace is inactive"}
                                    </p>

                                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={handleOrganizationDeactivate}
                                            disabled={deactivatingOrganization || !organization?.isActive}
                                            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deactivatingOrganization ? "Deactivating..." : "Deactivate workspace"}
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={savingOrganization || !organization?.isActive}
                                            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {savingOrganization ? "Saving..." : "Save changes"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </form>
                </section>
            )}

            {/* Notifications */}
            <section className="rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">
                <div className="border-b border-slate-800 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                            <Bell size={19} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Notifications
                            </h2>

                            <p className="text-xs text-slate-500">
                                Notification preferences will be available here.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-300">
                            Notification settings are not configured yet.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            This section is ready for future notification controls.
                        </p>
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">

                <div className="border-b border-slate-800 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                            <ShieldCheck size={19} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Security
                            </h2>

                            <p className="text-xs text-slate-500">
                                Manage account security.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Password Header */}
                {!showChangePassword && (
                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">
                                Password
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Update your account password securely.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowChangePassword(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"
                        >
                            <Lock size={16} />
                            Change Password
                        </button>
                    </div>
                )}

                {/* Change Password Form */}
                {showChangePassword && (
                    <form
                        onSubmit={handleChangePassword}
                        className="space-y-5 p-5"
                    >
                        {/* Form Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Change Password
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Enter your current password and choose a new one.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCancelPasswordChange}
                                disabled={changingPassword}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Current Password */}
                        <div>
                            <label
                                htmlFor="currentPassword"
                                className="mb-2 block text-xs font-medium text-slate-400"
                            >
                                Current Password
                            </label>

                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                                disabled={changingPassword}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label
                                htmlFor="newPassword"
                                className="mb-2 block text-xs font-medium text-slate-400"
                            >
                                New Password
                            </label>

                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                disabled={changingPassword}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <p className="mt-1.5 text-xs text-slate-600">
                                Minimum 6 characters.
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-xs font-medium text-slate-400"
                            >
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                disabled={changingPassword}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancelPasswordChange}
                                disabled={changingPassword}
                                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {changingPassword
                                    ? "Changing Password..."
                                    : "Change Password"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}

export default Settings;