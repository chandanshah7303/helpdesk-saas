import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createOrganization } from "../../services/organization.service.js";

function CreateOrganization() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            const response = await createOrganization(formData);

            toast.success(
                response.message || "Organization created successfully",
            );

            // Continue to Admin account registration
            navigate(`/register?organizationId=${response.data._id}`);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to create organization. Please try again.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50">
            {/* =====================================================
                BACKGROUND DECORATION
            ====================================================== */}

            <div
                className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl"
                aria-hidden="true"
            />

            <div
                className="pointer-events-none absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-3xl"
                aria-hidden="true"
            />

            <div
                className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-100/30 blur-3xl"
                aria-hidden="true"
            />

            {/* =====================================================
                PAGE CONTAINER
            ====================================================== */}

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">

                {/* =================================================
                    HEADER
                ================================================== */}

                <header className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/login"
                        className="group flex items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition duration-200 group-hover:scale-105 group-hover:bg-indigo-700">
                            <span className="text-xl font-extrabold text-white">
                                H
                            </span>
                        </div>

                        <div>
                            <p className="text-base font-bold tracking-tight text-slate-900">
                                Helpdesk SaaS
                            </p>

                            <p className="text-xs text-slate-500">
                                Support workspace
                            </p>
                        </div>
                    </Link>

                    {/* Back to login */}
                    <div className="hidden items-center gap-2 text-sm sm:flex">
                        <span className="text-slate-500">
                            Already have an account?
                        </span>

                        <Link
                            to="/login"
                            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                        >
                            Sign in
                        </Link>
                    </div>
                </header>

                {/* =================================================
                    MAIN CONTENT
                ================================================== */}

                <main className="flex flex-1 items-center justify-center py-10">
                    <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_500px] lg:gap-20">

                        {/* =================================================
                            LEFT INFORMATION
                        ================================================== */}

                        <section className="hidden lg:block">
                            {/* Small badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100">
                                    <svg
                                        className="h-3 w-3 text-indigo-600"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 5v14M5 12h14"
                                        />
                                    </svg>
                                </span>

                                Start your workspace
                            </div>

                            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-900 xl:text-5xl">
                                Build your team's
                                <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                    support workspace.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-slate-500">
                                Create your organization first. Then set up
                                your Administrator account and start managing
                                support requests from one secure workspace.
                            </p>

                            {/* Steps */}
                            <div className="mt-9 space-y-4">

                                {/* Step 1 */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
                                        1
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Create your organization
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Set your workspace name and unique
                                            identifier.
                                        </p>
                                    </div>
                                </div>

                                {/* Connector */}
                                <div className="ml-5 h-5 border-l border-dashed border-slate-300" />

                                {/* Step 2 */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-400 shadow-sm">
                                        2
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Create Administrator account
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Add your name, email and secure
                                            password.
                                        </p>
                                    </div>
                                </div>

                                {/* Connector */}
                                <div className="ml-5 h-5 border-l border-dashed border-slate-300" />

                                {/* Step 3 */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-400 shadow-sm">
                                        3
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Start managing support
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Organize tickets and collaborate
                                            with your team.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                            ORGANIZATION FORM CARD
                        ================================================== */}

                        <section className="w-full">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/40 sm:p-8">

                                {/* Card heading */}
                                <div>
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <svg
                                            className="h-6 w-6"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 21h18"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 21V5l7-3 7 3v16"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"
                                            />
                                        </svg>
                                    </div>

                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                        Create your organization
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Set up your workspace before creating
                                        your Administrator account.
                                    </p>
                                </div>

                                {/* =================================================
                                    INFORMATION BOX
                                ================================================== */}

                                <div className="mt-6 flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                d="M12 11v5"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                d="M12 8h.01"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-indigo-900">
                                            Your organization starts here
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-indigo-700/80">
                                            After creating the organization,
                                            you'll continue to create its
                                            first Administrator account.
                                        </p>
                                    </div>
                                </div>

                                {/* =================================================
                                    FORM
                                ================================================== */}

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-7 space-y-5"
                                >
                                    {/* Organization Name */}
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Organization name
                                        </label>

                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <svg
                                                    className="h-5 w-5 text-slate-400"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3 21h18"
                                                    />

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 21V5l7-3 7 3v16"
                                                    />

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 9h1M14 9h1M9 13h1M14 13h1"
                                                    />
                                                </svg>
                                            </div>

                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="ABC College"
                                                autoComplete="organization"
                                                required
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </div>
                                    </div>

                                    {/* Organization Slug */}
                                    <div>
                                        <label
                                            htmlFor="slug"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Organization slug
                                        </label>

                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <svg
                                                    className="h-5 w-5 text-slate-400"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                                                    />

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                                                    />
                                                </svg>
                                            </div>

                                            <input
                                                id="slug"
                                                name="slug"
                                                type="text"
                                                value={formData.slug}
                                                onChange={handleChange}
                                                placeholder="abc-college"
                                                required
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-400">
                                            Use lowercase letters, numbers, and
                                            hyphens only.
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Description
                                            <span className="ml-1 font-normal text-slate-400">
                                                (optional)
                                            </span>
                                        </label>

                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="College IT support system"
                                            rows={4}
                                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-600/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <svg
                                                    className="h-5 w-5 animate-spin"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />

                                                    <path
                                                        className="opacity-90"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                                                    />
                                                </svg>

                                                Creating organization...
                                            </>
                                        ) : (
                                            <>
                                                Create organization

                                                <svg
                                                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 12h14"
                                                    />

                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m13 6 6 6-6 6"
                                                    />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Mobile sign in */}
                                <div className="mt-6 border-t border-slate-100 pt-6 text-center sm:hidden">
                                    <p className="text-sm text-slate-500">
                                        Already have an account?{" "}
                                        <Link
                                            to="/login"
                                            className="font-semibold text-indigo-600"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 12 2 2 4-4"
                                    />
                                </svg>

                                <span>
                                    Secure workspace management
                                </span>
                            </div>
                        </section>
                    </div>
                </main>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <footer className="py-4 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Helpdesk SaaS · All rights
                    reserved
                </footer>
            </div>
        </div>
    );
}

export default CreateOrganization;