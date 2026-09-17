import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import adminApi from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";

import "./AdminTaxonomy.css";


/* =========================================================
   HELPERS
   ========================================================= */

function slugify(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function getErrorMessage(error) {
    return error?.message || "Something went wrong. Please try again.";
}

const emptyForm = { name: "", slug: "", description: "" };


/* =========================================================
   ADMIN TAXONOMY PAGE
   Shared implementation for /admin/categories and
   /admin/destinations — both resources are identical in
   shape (name, slug, description; used by tours).
   ========================================================= */

function AdminTaxonomy({ resource, title, singularLabel }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [notification, setNotification] = useState({ type: "", message: "" });

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");

    const handleAuthFailure = useCallback(() => {
        logout();
        navigate("/admin/login", { replace: true });
    }, [logout, navigate]);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await adminApi.authenticatedRequest(
                `/admin/${resource}`
            );

            setItems(Array.isArray(response?.data) ? response.data : []);
        } catch (err) {
            if (err?.code === "AUTH_EXPIRED" || err?.code === "AUTH_REQUIRED") {
                handleAuthFailure();
                return;
            }

            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [resource, handleAuthFailure]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        if (!notification.message) return undefined;

        const timer = setTimeout(() => {
            setNotification({ type: "", message: "" });
        }, 4000);

        return () => clearTimeout(timer);
    }, [notification]);

    const openCreateModal = () => {
        setEditingItem(null);
        setForm(emptyForm);
        setSlugManuallyEdited(false);
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name || "",
            slug: item.slug || "",
            description: item.description || "",
        });
        setSlugManuallyEdited(true);
        setFormError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setForm(emptyForm);
        setFormError("");
    };

    const handleNameChange = (event) => {
        const name = event.target.value;

        setForm((current) => ({
            ...current,
            name,
            slug: slugManuallyEdited ? current.slug : slugify(name),
        }));
    };

    const handleSlugChange = (event) => {
        setSlugManuallyEdited(true);
        setForm((current) => ({
            ...current,
            slug: slugify(event.target.value),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setFormError(`${singularLabel} name is required.`);
            return;
        }

        if (!form.slug.trim()) {
            setFormError(`${singularLabel} slug is required.`);
            return;
        }

        const payload = {
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim(),
        };

        try {
            setActionLoading(true);
            setFormError("");

            if (editingItem) {
                await adminApi.authenticatedRequest(
                    `/admin/${resource}/${encodeURIComponent(String(editingItem.id))}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                setNotification({
                    type: "success",
                    message: `${singularLabel} updated successfully.`,
                });
            } else {
                await adminApi.authenticatedRequest(`/admin/${resource}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                setNotification({
                    type: "success",
                    message: `${singularLabel} created successfully.`,
                });
            }

            closeModal();
            await fetchItems();
        } catch (err) {
            if (err?.code === "AUTH_EXPIRED" || err?.code === "AUTH_REQUIRED") {
                handleAuthFailure();
                return;
            }

            setFormError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Delete "${item.name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);

            await adminApi.authenticatedRequest(
                `/admin/${resource}/${encodeURIComponent(String(item.id))}`,
                { method: "DELETE" }
            );

            setNotification({
                type: "success",
                message: `${singularLabel} deleted successfully.`,
            });

            await fetchItems();
        } catch (err) {
            setNotification({
                type: "error",
                message: getErrorMessage(err),
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-taxonomy-page">
                <div className="admin-taxonomy-loading">
                    <div className="loading-spinner" />
                    <p>Loading {title.toLowerCase()}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-taxonomy-page">
            <div className="admin-taxonomy-header">
                <div>
                    <span className="admin-page-eyebrow">
                        {title.toUpperCase()}
                    </span>
                    <h1>{title}</h1>
                    <p>
                        {singularLabel} used to organize and filter tours
                        across the site.
                    </p>
                </div>

                <div className="admin-taxonomy-header-actions">
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={openCreateModal}
                    >
                        <span>+</span>
                        Add {singularLabel}
                    </button>
                </div>
            </div>

            {notification.message && (
                <div
                    className={`admin-notification ${
                        notification.type === "success"
                            ? "notification-success"
                            : "notification-error"
                    }`}
                >
                    <span className="notification-icon">
                        {notification.type === "success" ? "✓" : "!"}
                    </span>
                    <span>{notification.message}</span>
                    <button
                        type="button"
                        onClick={() => setNotification({ type: "", message: "" })}
                    >
                        ×
                    </button>
                </div>
            )}

            {error && (
                <div className="admin-error-banner">
                    <div>
                        <strong>Unable to load {title.toLowerCase()}</strong>
                        <p>{error}</p>
                    </div>
                    <button type="button" onClick={fetchItems}>
                        Try Again
                    </button>
                </div>
            )}

            <div className="taxonomy-table-card">
                {items.length === 0 ? (
                    <div className="empty-taxonomy">
                        <h3>No {title.toLowerCase()} yet</h3>
                        <p>Create your first {singularLabel.toLowerCase()} to start adding tours.</p>
                        <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            onClick={openCreateModal}
                        >
                            + Add {singularLabel}
                        </button>
                    </div>
                ) : (
                    <table className="taxonomy-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Description</th>
                                <th>Tours</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.name}</strong>
                                    </td>
                                    <td>
                                        <span className="taxonomy-slug">
                                            /{item.slug}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="taxonomy-description">
                                            {item.description || "—"}
                                        </span>
                                    </td>
                                    <td>{item.tour_count ?? 0}</td>
                                    <td>
                                        <div className="taxonomy-actions">
                                            <button
                                                type="button"
                                                className="icon-action"
                                                onClick={() => openEditModal(item)}
                                                disabled={actionLoading}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="icon-action danger"
                                                onClick={() => handleDelete(item)}
                                                disabled={actionLoading}
                                                title={
                                                    item.tour_count > 0
                                                        ? "Cannot delete — used by existing tours"
                                                        : "Delete"
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="taxonomy-modal-backdrop" onMouseDown={closeModal}>
                    <div
                        className="taxonomy-modal"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="taxonomy-modal-header">
                            <h2>
                                {editingItem ? `Edit ${singularLabel}` : `Add ${singularLabel}`}
                            </h2>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="taxonomy-form">
                            {formError && (
                                <div className="taxonomy-form-error">{formError}</div>
                            )}

                            <label htmlFor="taxonomy-name">Name</label>
                            <input
                                id="taxonomy-name"
                                type="text"
                                value={form.name}
                                onChange={handleNameChange}
                                placeholder={`e.g. ${
                                    resource === "categories" ? "Water Sports" : "Zanzibar"
                                }`}
                                required
                            />

                            <label htmlFor="taxonomy-slug">Slug</label>
                            <input
                                id="taxonomy-slug"
                                type="text"
                                value={form.slug}
                                onChange={handleSlugChange}
                                placeholder="water-sports"
                                required
                            />

                            <label htmlFor="taxonomy-description">
                                Description (optional)
                            </label>
                            <textarea
                                id="taxonomy-description"
                                rows={3}
                                value={form.description}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                            />

                            <div className="taxonomy-form-actions">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Saving..."
                                        : editingItem
                                        ? "Save Changes"
                                        : `Create ${singularLabel}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminTaxonomy;
