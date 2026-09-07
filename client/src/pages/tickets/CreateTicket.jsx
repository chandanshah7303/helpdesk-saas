import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ClipboardPlus,
    FileText,
    Flag,
    Send,
    Tag,
} from "lucide-react";
import toast from "react-hot-toast";

import { getCategories } from "../../services/category.service";
import { createTicket } from "../../services/ticket.service";

function CreateTicket() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        priority: "medium",
    });

    // Fetch categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const result = await getCategories();

                setCategories(result.data || []);
            } catch (error) {
                console.error(error);

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load categories",
                );
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, []);

    // Handle input
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Submit
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Please enter a ticket title");
            return;
        }

        if (!formData.description.trim()) {
            toast.error("Please enter a description");
            return;
        }

        if (!formData.categoryId) {
            toast.error("Please select a category");
            return;
        }

        try {
            setSubmitting(true);

            const result = await createTicket({
                title: formData.title.trim(),
                description: formData.description.trim(),
                categoryId: formData.categoryId,
                priority: formData.priority,
            });

            toast.success("Ticket created successfully");

            navigate(`/tickets/${result.data._id}`);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to create ticket",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-7">

            {/* Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                <button
                    type="button"
                    onClick={() => navigate("/tickets")}
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
                >
                    <ArrowLeft size={17} />
                    Back to Tickets
                </button>

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                            <ClipboardPlus size={22} strokeWidth={1.8} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Create Ticket
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Submit a new support request to your organization.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Support team ready
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
            >

                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
                            <FileText size={17} />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Tell us what happened
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Add enough detail for the support team to resolve your request quickly.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">

                {/* Title */}
                <div>
                    <label
                        htmlFor="title"
                        className="text-sm font-semibold text-slate-700"
                    >
                        Ticket Title
                    </label>

                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. AC is not working in Room 204"
                        maxLength={150}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <p className="mt-2 text-right text-[11px] text-slate-400">
                        {formData.title.length}/150
                    </p>
                </div>

                {/* Description */}
                <div className="mt-6">
                    <label
                        htmlFor="description"
                        className="text-sm font-semibold text-slate-700"
                    >
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the issue in detail..."
                        rows={6}
                        maxLength={2000}
                        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <p className="mt-2 text-right text-[11px] text-slate-400">
                        {formData.description.length}/2000
                    </p>
                </div>

                {/* Category + Priority */}
                <div className="mt-7 grid gap-5 sm:grid-cols-2">

                    {/* Category */}
                    <div>
                        <label
                            htmlFor="categoryId"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            <Tag size={15} className="text-indigo-500" />
                            Category
                        </label>

                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            disabled={loadingCategories}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">
                                {loadingCategories
                                    ? "Loading categories..."
                                    : "Select a category"}
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label
                            htmlFor="priority"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            <Flag size={15} className="text-indigo-500" />
                            Priority
                        </label>

                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        onClick={() => navigate("/tickets")}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting || loadingCategories}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send size={16} />

                        {submitting
                            ? "Creating..."
                            : "Create Ticket"}
                    </button>

                </div>

                </div>

            </form>
        </div>
    );
}

export default CreateTicket;