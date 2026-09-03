import { useState } from "react";
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

function Settings() {
    const { user } = useAuth();

    const [showChangePassword, setShowChangePassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [changingPassword, setChangingPassword] = useState(false);

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
            <section className="rounded-2xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 p-5">
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
            <section className="rounded-2xl border border-slate-800 bg-slate-900">
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

            {/* Notifications */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900">
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
            <section className="rounded-2xl border border-slate-800 bg-slate-900">

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
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
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