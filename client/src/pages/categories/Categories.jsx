import { useEffect, useState } from "react";

import {
    Plus,
    X,
    Pencil,
    Trash2,
    Folder,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext.jsx";

import {
    getCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
} from "../../services/category.service.js";

function Categories() {
    const { user } = useAuth();
    const canManageCategories = user?.role === "admin";

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // Edit
    const [editingCategory, setEditingCategory] = useState(null);

    // Loading states
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deactivatingId, setDeactivatingId] = useState(null);

    // --------------------------------------------------
    // LOAD CATEGORIES
    // --------------------------------------------------

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getCategories();

            setCategories(result.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load categories.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // --------------------------------------------------
    // RESET FORM
    // --------------------------------------------------

    const resetForm = () => {
        setName("");
        setDescription("");
        setEditingCategory(null);
        setShowForm(false);
    };

    // --------------------------------------------------
    // CREATE CATEGORY
    // --------------------------------------------------

    const handleCreateCategory = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            setCreating(true);

            await createCategory({
                name: name.trim(),
                description: description.trim(),
            });

            toast.success("Category created successfully");

            resetForm();

            await loadCategories();
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to create category",
            );
        } finally {
            setCreating(false);
        }
    };

    // --------------------------------------------------
    // EDIT CATEGORY
    // --------------------------------------------------

    const handleEditCategory = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            setUpdating(true);

            await updateCategory(editingCategory._id, {
                name: name.trim(),
                description: description.trim(),
            });

            toast.success("Category updated successfully");

            resetForm();

            await loadCategories();
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update category",
            );
        } finally {
            setUpdating(false);
        }
    };

    // --------------------------------------------------
    // DEACTIVATE CATEGORY
    // --------------------------------------------------

    const handleDeactivateCategory = async (categoryId) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this category?",
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeactivatingId(categoryId);

            await deactivateCategory(categoryId);

            toast.success("Category deactivated successfully");

            await loadCategories();
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to deactivate category",
            );
        } finally {
            setDeactivatingId(null);
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-800" />

                <div className="h-72 animate-pulse rounded-2xl bg-slate-900" />
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
            </div>
        );
    }

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Folder size={20} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            Categories
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage ticket categories
                        </p>
                    </div>

                </div>

                {canManageCategories && <button
                    type="button"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                    {showForm ? (
                        <>
                            <X size={18} />
                            Cancel
                        </>
                    ) : (
                        <>
                            <Plus size={18} />
                            Create Category
                        </>
                    )}
                </button>}

            </div>

            {/* CREATE / EDIT FORM */}

            {canManageCategories && showForm && (
                <form
                    onSubmit={
                        editingCategory
                            ? handleEditCategory
                            : handleCreateCategory
                    }
                    className="rounded-2xl border border-white/[0.07] bg-slate-900/80 p-6 shadow-xl shadow-black/10"
                >

                    <h2 className="font-semibold text-white">
                        {editingCategory
                            ? "Edit Category"
                            : "Create Category"}
                    </h2>

                    <div className="mt-5 space-y-4">

                        {/* NAME */}

                        <div>
                            <label htmlFor="category-name" className="text-sm font-medium text-slate-300">
                                Category Name
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. Hardware"
                                disabled={
                                    creating ||
                                    updating
                                }
                                className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {/* DESCRIPTION */}

                        <div>
                            <label htmlFor="category-description" className="text-sm font-medium text-slate-300">
                                Description
                            </label>

                            <textarea
                                id="category-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value,
                                    )
                                }
                                placeholder="Describe this category..."
                                rows={4}
                                disabled={
                                    creating ||
                                    updating
                                }
                                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {/* BUTTON */}

                        <button
                            type="submit"
                            disabled={
                                creating ||
                                updating
                            }
                            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating || updating
                                ? "Saving..."
                                : editingCategory
                                    ? "Update Category"
                                    : "Create Category"}
                        </button>

                    </div>
                </form>
            )}

            {/* CATEGORY TABLE */}

            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/80 shadow-xl shadow-black/10">

                {/* TABLE HEADER */}

                <div className="hidden grid-cols-[1fr_2fr_100px_100px] gap-4 border-b border-white/6 bg-white/2.5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">

                    <span>Name</span>

                    <span>Description</span>

                    <span>Status</span>

                    <span>Actions</span>

                </div>

                {/* EMPTY */}

                {categories.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-500">
                        No categories found.
                    </div>
                ) : (

                    categories.map((category) => (

                        <div
                            key={category._id}
                            className="grid gap-3 border-b border-white/5 px-5 py-4 transition hover:bg-indigo-500/4.5 last:border-b-0 md:grid-cols-[1fr_2fr_100px_100px] md:gap-4"
                        >

                            {/* NAME */}

                            <div className="flex items-center justify-between gap-3 text-sm font-medium text-white md:block">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Name</span>
                                {category.name}
                            </div>

                            {/* DESCRIPTION */}

                            <div className="flex items-center justify-between gap-3 text-sm text-slate-400 md:block">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Description</span>
                                {category.description ||
                                    "No description"}
                            </div>

                            {/* STATUS */}

                            <div className="flex items-center justify-between gap-3 md:block">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Status</span>

                                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                    Active
                                </span>

                            </div>

                            {/* ACTIONS */}

                            <div className="flex items-center justify-between gap-3 md:justify-start">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">Actions</span>

                                {/* EDIT */}

                                {canManageCategories && <button
                                    type="button"
                                    onClick={() => {
                                        setEditingCategory(
                                            category,
                                        );

                                        setName(
                                            category.name,
                                        );

                                        setDescription(
                                            category.description ||
                                            "",
                                        );

                                        setShowForm(true);
                                    }}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-indigo-400"
                                    title="Edit category"
                                >
                                    <Pencil size={16} />
                                </button>}

                                {/* DEACTIVATE */}

                                {canManageCategories && <button
                                    type="button"
                                    onClick={() =>
                                        handleDeactivateCategory(
                                            category._id,
                                        )
                                    }
                                    disabled={
                                        deactivatingId ===
                                        category._id
                                    }
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                    title="Deactivate category"
                                >
                                    <Trash2 size={16} />
                                </button>}

                            </div>

                        </div>

                    ))
                )}

            </div>

        </div>
    );
}

export default Categories;