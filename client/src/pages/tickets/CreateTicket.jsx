import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
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

                console.log("CATEGORIES:", result);

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

            console.log("CREATED TICKET:", result);

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
        <div className="mx-auto max-w-4xl space-y-6">

            {/* Header */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/tickets")}
                    className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                    <ArrowLeft size={17} />
                    Back to Tickets
                </button>

                <h1 className="text-2xl font-semibold tracking-tight text-white">
                    Create Ticket
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Submit a new support request to your organization.
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl"
            >

                {/* Title */}
                <div>
                    <label
                        htmlFor="title"
                        className="text-sm font-medium text-slate-300"
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
                        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />
                </div>

                {/* Description */}
                <div className="mt-6">
                    <label
                        htmlFor="description"
                        className="text-sm font-medium text-slate-300"
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
                        className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />
                </div>

                {/* Category + Priority */}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                    {/* Category */}
                    <div>
                        <label
                            htmlFor="categoryId"
                            className="text-sm font-medium text-slate-300"
                        >
                            Category
                        </label>

                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            disabled={loadingCategories}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                            className="text-sm font-medium text-slate-300"
                        >
                            Priority
                        </label>

                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        onClick={() => navigate("/tickets")}
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting || loadingCategories}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send size={16} />

                        {submitting
                            ? "Creating..."
                            : "Create Ticket"}
                    </button>

                </div>

            </form>
        </div>
    );
}

export default CreateTicket;