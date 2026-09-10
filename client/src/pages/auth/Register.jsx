import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import { registerUser } from "../../services/auth.service.js";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Organization ID comes from Create Organization step
  const organizationId = searchParams.get("organizationId");

  const [formData, setFormData] = useState({
    name: "",
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

    const { name, email, password } = formData;

    // Organization check
    if (!organizationId) {
      toast.error("Organization information is missing.");
      return;
    }

    // Required fields
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Name validation
    if (name.trim().length < 3) {
      toast.error("Name must be at least 3 characters long");
      return;
    }

    // Password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        organizationId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast.success(
        response.message || "Registration successful",
      );

      navigate("/login");
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const validationMessage = Array.isArray(validationErrors)
        ? validationErrors
            .map((item) => (typeof item === "string" ? item : item.message))
            .filter(Boolean)
            .join(" ")
        : "";
      const message =
        validationMessage ||
        error.response?.data?.message ||
        "Unable to register. Please try again.";

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
            aria-label="Helpdesk SaaS home"
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

          {/* Sign in */}

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
              {/* Badge */}

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

                Complete your workspace
              </div>

              {/* Heading */}

              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-900 xl:text-5xl">
                Set up your
                <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Administrator account.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-500">
                Your organization is ready. Create the first Administrator
                account to access and manage your Helpdesk SaaS workspace.
              </p>

              {/* Steps */}

              <div className="mt-9 space-y-4">

                {/* Step 1 */}

                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Organization created
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Your support workspace has been created.
                    </p>
                  </div>
                </div>

                {/* Connector */}

                <div className="ml-5 h-5 border-l border-dashed border-slate-300" />

                {/* Step 2 */}

                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Create Administrator account
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Add your name, email and secure password.
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
                      Sign in and manage your support workspace.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                REGISTER CARD
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
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 21a8 8 0 0 1 16 0"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 8v6M16 11h6"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Create admin account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Create the first Administrator account for your
                    organization.
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
                    <p className="text-sm font-semibold text-indigo-900">
                      Administrator access
                    </p>

                    <p className="mt-1 text-xs leading-5 text-indigo-700/80">
                      This will be the first account in your organization
                      and will have Administrator permissions.
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

                  {/* Full Name */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full name
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
                          <circle
                            cx="12"
                            cy="8"
                            r="4"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 21a8 8 0 0 1 16 0"
                          />
                        </svg>
                      </div>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email address
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
                        placeholder="Create a secure password"
                        autoComplete="new-password"
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
                              d="M10.58 10.58a2 2 0 0 0 2.84 2.84"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 8.5 4 9.5 6a11.8 11.8 0 0 1-3.16 3.77"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.61 6.61C4.9 7.68 3.68 9.13 3 10c1 2 4.5 6 9 6 1.04 0 2.03-.2 2.92-.55"
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
                              d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6Z"
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

                    <p className="mt-2 text-xs text-slate-400">
                      Password must be at least 6 characters.
                    </p>
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

                        Creating account...
                      </>
                    ) : (
                      <>
                        Create admin account

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

                {/* Login */}

                <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                  <p className="text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-indigo-600 transition hover:text-indigo-700"
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
                  Secure administrator account
                </span>
              </div>
            </section>
          </div>
        </main>

        {/* =================================================
            FOOTER
        ================================================== */}

        <footer className="py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Helpdesk SaaS · All rights reserved
        </footer>
      </div>
    </div>
  );
}

export default Register;