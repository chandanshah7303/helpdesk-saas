import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { loginUser } from "../../services/auth.service.js";
import { useAuth } from "../../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

      const response = await loginUser(formData);

      login(response.data);

      toast.success(response.message || "Login successful");

      const role = response.data.user.role;

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "agent") {
        navigate("/agent/dashboard");
      } else if (role === "requester") {
        navigate("/requester/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

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

      {/* Top-right glow */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl"
        aria-hidden="true"
      />

      {/* Bottom-left glow */}
      <div
        className="pointer-events-none absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-3xl"
        aria-hidden="true"
      />

      {/* Small center glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-100/30 blur-3xl"
        aria-hidden="true"
      />

      {/* =====================================================
          MAIN PAGE
      ====================================================== */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/login"
            className="group flex items-center gap-3"
            aria-label="Helpdesk SaaS home"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition duration-200 group-hover:scale-105 group-hover:bg-indigo-700">
              <span className="text-xl font-extrabold text-white">H</span>
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

          {/* Header register link */}
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-slate-500">
              New to Helpdesk?
            </span>

            <Link
              to="/organization/create"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Create workspace
            </Link>
          </div>
        </header>

        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <main className="flex flex-1 items-center py-10 lg:py-12">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_460px] lg:gap-20 xl:grid-cols-[1fr_480px]">
            {/* =================================================
                LEFT CONTENT
            ================================================== */}

            <section className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
              {/* Small badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                Built for modern support teams
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
                Better Support.
                <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Happier Teams.
                </span>
              </h1>

              {/* Description */}
              <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-slate-500 sm:text-lg lg:mx-0">
                Manage support requests, assign tickets, collaborate with
                your team, and resolve issues from one secure workspace.
              </p>

              {/* =================================================
                  FEATURES
              ================================================== */}

              <div className="mx-auto mt-9 grid max-w-lg gap-3 sm:grid-cols-3 lg:mx-0 lg:grid-cols-1 lg:gap-4">
                {/* Feature 1 */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5a3 3 0 0 1 6 0v1H9V5Z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8 13 2 2 5-5"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Track Tickets
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Keep every request organized.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                      />

                      <circle cx="9" cy="7" r="4" />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M22 21v-2a4 4 0 0 0-3-3.87"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Collaborate
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Resolve issues together.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg
                      className="h-5 w-5"
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
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Secure & Reliable
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Protected role-based access.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                LOGIN CARD
            ================================================== */}

            <section className="w-full">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/40 sm:p-8">
                {/* Card heading */}
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to your Helpdesk SaaS workspace.
                  </p>
                </div>

                {/* =================================================
                    AUTH TABS
                ================================================== */}

                <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                  <div className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900 shadow-sm">
                    Sign in
                  </div>

                  <Link
                    to="/organization/create"
                    className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-slate-500 transition hover:text-slate-900"
                  >
                    Register
                  </Link>
                </div>

                {/* =================================================
                    LOGIN FORM
                ================================================== */}

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                >
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      {/* Email icon */}
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect
                            width="20"
                            height="16"
                            x="2"
                            y="4"
                            rx="2"
                          />

                          <path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">
                      {/* Lock icon */}
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 11V7a5 5 0 0 1 10 0v4"
                          />
                        </svg>
                      </div>

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />

                      {/* Show / hide password */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition hover:text-slate-700"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 3l18 18"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 8.5 4 9.5 8a11.3 11.3 0 0 1-2.07 4.17"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.61 6.61C4.24 8.15 2.9 10.35 2.5 12c1 4 4.5 8 9.5 8 1.61 0 3.08-.37 4.39-1"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
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
                  </div>

                  {/* Submit button */}
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

                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in

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

                {/* Register */}
                <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link
                      to="/organization/create"
                      className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                      Create your workspace
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
                </svg>

                <span>
                  Secure workspace management
                </span>
              </div>
            </section>
          </div>
        </main>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Helpdesk SaaS · All rights reserved
        </footer>
      </div>
    </div>
  );
}

export default Login;