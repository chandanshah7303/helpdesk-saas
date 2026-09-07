function Button({
	children,
	variant = "primary",
	className = "",
	type = "button",
	...props
}) {
	const variants = {
		primary:
			"bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500",
		secondary:
			"border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
		quiet:
			"text-slate-500 hover:bg-slate-100 hover:text-slate-900",
	};

	return (
		<button
			type={type}
			className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}

export default Button;
