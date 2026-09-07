function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-300">Page not found</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight">404</h1>
        <p className="mt-3 text-sm text-slate-400">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default NotFound;