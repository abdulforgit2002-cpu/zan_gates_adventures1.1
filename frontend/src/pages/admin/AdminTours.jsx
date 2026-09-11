import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import adminApi from "../../services/adminApi";

import {
    useAuth,
} from "../../context/AuthContext";

import "./AdminTours.css";


function normalizeTourDetails(response, fallbackTour = null) {

    const responseData =
        response?.data;

    const tour =
        responseData?.tour ||
        responseData ||
        fallbackTour ||
        null;

    if (!tour) {
        return null;
    }

    const categoryName =
        tour.category_name ||
        tour.category?.name ||
        tour.category?.title ||
        "—";

    const destinationName =
        tour.destination_name ||
        tour.destination?.name ||
        tour.destination?.title ||
        "—";

    const prices =
        Array.isArray(tour.prices)
            ? tour.prices
            : Array.isArray(responseData?.prices)
                ? responseData.prices
                : [];

    const images =
        Array.isArray(tour.images)
            ? tour.images
            : Array.isArray(responseData?.images)
                ? responseData.images
                : [];

    return {
        ...tour,

        category_name:
            categoryName,

        destination_name:
            destinationName,

        prices,

        images,
    };
}


function AdminTours() {

    const {
        admin,
        logout,
    } = useAuth();

    const navigate =
        useNavigate();


    const handleLogout = () => {

        logout();

        navigate(
            "/admin/login",
            {
                replace: true,
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [
        tours,
        setTours,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        status,
        setStatus,
    ] = useState("");

    const [
        featured,
        setFeatured,
    ] = useState("");

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        perPage,
        setPerPage,
    ] = useState(10);

    const [
        pagination,
        setPagination,
    ] = useState({
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
        has_next_page: false,
        has_previous_page: false,
    });

    const [
        selectedTour,
        setSelectedTour,
    ] = useState(null);

    const [
        showDetails,
        setShowDetails,
    ] = useState(false);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const [
        notification,
        setNotification,
    ] = useState({
        type: "",
        message: "",
    });


    /*
    |--------------------------------------------------------------------------
    | FETCH TOURS
    |--------------------------------------------------------------------------
    */

    const fetchTours = useCallback(
        async (
            showRefreshLoader = false
        ) => {

            try {

                if (showRefreshLoader) {

                    setRefreshing(true);

                } else {

                    setLoading(true);

                }

                setError("");


                const params =
                    new URLSearchParams();


                params.set(
                    "page",
                    String(page)
                );

                params.set(
                    "per_page",
                    String(perPage)
                );


                if (
                    search.trim()
                ) {

                    params.set(
                        "search",
                        search.trim()
                    );

                }


                if (
                    status
                ) {

                    params.set(
                        "status",
                        status
                    );

                }


                if (
                    featured
                ) {

                    params.set(
                        "featured",
                        featured
                    );

                }


                const response =
                    await adminApi.authenticatedRequest(
                        `/admin/tours?${params.toString()}`
                    );


                const data =
                    response?.data;


                setTours(
                    Array.isArray(
                        data?.tours
                    )
                        ? data.tours
                        : []
                );


                setPagination(
                    data?.pagination || {
                        page,
                        per_page:
                            perPage,
                        total: 0,
                        total_pages: 0,
                        has_next_page:
                            false,
                        has_previous_page:
                            false,
                    }
                );

            } catch (err) {

                console.error(
                    "Failed to load tours:",
                    err
                );


                if (
                    err?.code ===
                    "AUTH_EXPIRED"
                ) {

                    logout();

                    navigate(
                        "/admin/login",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                if (
                    err?.code ===
                    "AUTH_REQUIRED"
                ) {

                    logout();

                    navigate(
                        "/admin/login",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                setError(
                    err?.message ||
                    "Unable to load tours."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        [
            page,
            perPage,
            search,
            status,
            featured,
            logout,
            navigate,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD / FILTER LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(
        () => {

            fetchTours();

        },
        [
            fetchTours,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | RESET PAGE WHEN FILTER CHANGES
    |--------------------------------------------------------------------------
    */

    useEffect(
        () => {

            if (page !== 1) {

                setPage(1);

            }

        },
        [
            search,
            status,
            featured,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION AUTO HIDE
    |--------------------------------------------------------------------------
    */

    useEffect(
        () => {

            if (
                !notification.message
            ) {

                return undefined;

            }


            const timer =
                setTimeout(
                    () => {

                        setNotification({
                            type: "",
                            message: "",
                        });

                    },
                    4000
                );


            return () =>
                clearTimeout(timer);

        },
        [
            notification,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    const statistics =
        useMemo(
            () => {

                const active =
                    tours.filter(
                        (tour) =>
                            String(
                                tour.status
                            ).toUpperCase() ===
                            "ACTIVE"
                    ).length;


                const inactive =
                    tours.filter(
                        (tour) =>
                            String(
                                tour.status
                            ).toUpperCase() ===
                            "INACTIVE"
                    ).length;


                const featuredTours =
                    tours.filter(
                        (tour) =>
                            Boolean(
                                tour.featured
                            )
                    ).length;


                return {
                    active,
                    inactive,
                    featured:
                        featuredTours,
                };

            },
            [
                tours,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */

    const handleRefresh =
        () => {

            fetchTours(true);

        };


    /*
    |--------------------------------------------------------------------------
    | VIEW TOUR
    |--------------------------------------------------------------------------
    */

    const handleViewTour =
        async (
            tour
        ) => {

            try {

                setActionLoading(true);

                setError("");


                const response =
                    await adminApi.authenticatedRequest(
                        `/admin/tours/${encodeURIComponent(
                            String(tour.id)
                        )}`
                    );


                /*
                |--------------------------------------------------------------------------
                | IMPORTANT
                |
                | The backend returns:
                |
                | data: {
                |     tour: {...}
                | }
                |
                | Therefore we must unwrap response.data.tour.
                |--------------------------------------------------------------------------
                */

                const normalizedTour =
                    normalizeTourDetails(
                        response,
                        tour
                    );


                if (!normalizedTour) {

                    throw new Error(
                        "Tour details were not returned by the server."
                    );

                }


                setSelectedTour(
                    normalizedTour
                );


                setShowDetails(
                    true
                );

            } catch (err) {

                console.error(
                    "Failed to load tour:",
                    err
                );


                if (
                    err?.code ===
                    "AUTH_EXPIRED"
                ) {

                    logout();

                    navigate(
                        "/admin/login",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                if (
                    err?.code ===
                    "AUTH_REQUIRED"
                ) {

                    logout();

                    navigate(
                        "/admin/login",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                setNotification({
                    type: "error",
                    message:
                        err?.message ||
                        "Unable to load tour details.",
                });

            } finally {

                setActionLoading(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    const handleStatusChange =
        async (
            tour
        ) => {

            const currentStatus =
                String(
                    tour.status || ""
                ).toUpperCase();


            const newStatus =
                currentStatus === "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE";


            const confirmed =
                window.confirm(
                    newStatus === "ACTIVE"
                        ? `Activate "${tour.title}"?`
                        : `Deactivate "${tour.title}"?`
                );


            if (!confirmed) {

                return;

            }


            try {

                setActionLoading(true);


                await adminApi.authenticatedRequest(
                    `/admin/tours/${encodeURIComponent(
                        String(tour.id)
                    )}/status`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            status:
                                newStatus,
                        }),
                    }
                );


                setNotification({
                    type: "success",
                    message:
                        `Tour ${
                            newStatus === "ACTIVE"
                                ? "activated"
                                : "deactivated"
                        } successfully.`,
                });


                await fetchTours(true);

            } catch (err) {

                console.error(
                    "Failed to update tour status:",
                    err
                );


                setNotification({
                    type: "error",
                    message:
                        err?.message ||
                        "Unable to update tour status.",
                });

            } finally {

                setActionLoading(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | UPDATE FEATURED
    |--------------------------------------------------------------------------
    */

    const handleFeaturedChange =
        async (
            tour
        ) => {

            const newFeatured =
                !Boolean(
                    tour.featured
                );


            try {

                setActionLoading(true);


                await adminApi.authenticatedRequest(
                    `/admin/tours/${encodeURIComponent(
                        String(tour.id)
                    )}/featured`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            featured:
                                newFeatured,
                        }),
                    }
                );


                setNotification({
                    type: "success",
                    message:
                        newFeatured
                            ? "Tour marked as featured."
                            : "Tour removed from featured tours.",
                });


                await fetchTours(true);

            } catch (err) {

                console.error(
                    "Failed to update featured status:",
                    err
                );


                setNotification({
                    type: "error",
                    message:
                        err?.message ||
                        "Unable to update featured status.",
                });

            } finally {

                setActionLoading(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | DELETE TOUR
    |--------------------------------------------------------------------------
    */

    const handleDelete =
        async (
            tour
        ) => {

            const confirmed =
                window.confirm(
                    `Delete "${tour.title}"?\n\nThis action cannot be undone.`
                );


            if (!confirmed) {

                return;

            }


            try {

                setActionLoading(true);


                await adminApi.authenticatedRequest(
                    `/admin/tours/${encodeURIComponent(
                        String(tour.id)
                    )}`,
                    {
                        method: "DELETE",
                    }
                );


                setNotification({
                    type: "success",
                    message:
                        "Tour deleted successfully.",
                });


                /*
                |--------------------------------------------------------------------------
                | If last item on page is deleted,
                | move back one page.
                |--------------------------------------------------------------------------
                */

                if (
                    tours.length === 1 &&
                    page > 1
                ) {

                    setPage(
                        page - 1
                    );

                } else {

                    await fetchTours(
                        true
                    );

                }

            } catch (err) {

                console.error(
                    "Failed to delete tour:",
                    err
                );


                setNotification({
                    type: "error",
                    message:
                        err?.message ||
                        "Unable to delete tour.",
                });

            } finally {

                setActionLoading(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | CLEAR FILTERS
    |--------------------------------------------------------------------------
    */

    const clearFilters =
        () => {

            setSearch("");

            setStatus("");

            setFeatured("");

            setPage(1);

        };


    /*
    |--------------------------------------------------------------------------
    | FORMAT PRICE
    |--------------------------------------------------------------------------
    */

    const formatPrice =
        (
            price,
            currency = "USD"
        ) => {

            if (
                price === null ||
                price === undefined ||
                price === ""
            ) {

                return "—";

            }


            const numericPrice =
                Number(price);


            if (
                Number.isNaN(
                    numericPrice
                )
            ) {

                return `${price} ${currency}`;

            }


            return new Intl.NumberFormat(
                "en-US",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                }
            ).format(
                numericPrice
            ) + ` ${currency}`;

        };


    /*
    |--------------------------------------------------------------------------
    | CLOSE DETAILS
    |--------------------------------------------------------------------------
    */

    const closeDetails =
        () => {

            setShowDetails(
                false
            );

            setSelectedTour(
                null
            );

        };


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (
        loading
    ) {

        return (
            <div className="admin-tours-page">

                <div className="admin-tours-loading">

                    <div className="loading-spinner" />

                    <p>
                        Loading tours...
                    </p>

                </div>

            </div>
        );

    }


    return (

        <div className="admin-layout">

            <aside className="admin-sidebar">

                <div className="admin-sidebar-brand">

                    <Link
                        to="/admin/dashboard"
                        className="admin-brand-link"
                    >

                        <div className="admin-brand-mark">
                            ZG
                        </div>

                        <div className="admin-brand-text">

                            <strong>
                                ZAN GATES
                            </strong>

                            <span>
                                ADVENTURES
                            </span>

                        </div>

                    </Link>

                </div>

                <div className="admin-sidebar-label">
                    ADMINISTRATION
                </div>


                <nav className="admin-sidebar-nav">

                    <Link
                        to="/admin/dashboard"
                        className="admin-nav-item"
                    >
                        <span className="admin-nav-icon">
                            ▦
                        </span>
                        Dashboard
                    </Link>

                    <Link
                        to="/admin/bookings"
                        className="admin-nav-item"
                    >
                        <span className="admin-nav-icon">
                            ▤
                        </span>
                        Bookings
                    </Link>

                    <Link
                        to="/admin/tours"
                        className="admin-nav-item active"
                    >
                        <span className="admin-nav-icon">
                            ◫
                        </span>
                        Tours
                    </Link>

                    <Link
                        to="/"
                        className="admin-nav-item"
                    >
                        <span className="admin-nav-icon">
                            ↗
                        </span>
                        View Website
                    </Link>

                </nav>


                <div className="admin-sidebar-footer">

                    <div className="admin-user">

                        <div className="admin-user-avatar">
                            {admin?.full_name?.charAt(0)?.toUpperCase() || "A"}
                        </div>

                        <div className="admin-user-info">
                            <strong>
                                {admin?.full_name || "System Administrator"}
                            </strong>
                            <span>
                                Administrator
                            </span>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>

                </div>

            </aside>

            <main className="admin-main">

                <header className="admin-header">
                    <div>
                        <span>ADMINISTRATION</span>
                        <h1>Tours</h1>
                    </div>

                    <div className="admin-header-actions">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing || actionLoading}
                        >
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </header>

                <div className="admin-tours-page">


                    {/* ============================================================
                        PAGE HEADER
                    ============================================================ */}

                    <div className="admin-tours-header">

                        <div>

                            <span className="admin-page-eyebrow">
                                TOUR MANAGEMENT
                            </span>

                            <h1>
                                Tours
                            </h1>

                            <p>
                                Create, manage and organize
                                your Zanzibar experiences.
                            </p>

                        </div>


                        <div className="admin-tours-header-actions">

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={
                                    handleRefresh
                                }
                                disabled={
                                    refreshing ||
                                    actionLoading
                                }
                            >

                                <span>
                                    {refreshing
                                        ? "↻"
                                        : "⟳"}
                                </span>

                                {refreshing
                                    ? "Refreshing..."
                                    : "Refresh"}

                            </button>


                            <Link
                                to="/admin/tours/new"
                                className="admin-btn admin-btn-primary"
                            >

                                <span>
                                    +
                                </span>

                                Add Tour

                            </Link>

                        </div>

                    </div>


                    {/* ============================================================
                        NOTIFICATION
                    ============================================================ */}

            {notification.message && (

                <div
                    className={`admin-notification ${
                        notification.type ===
                        "success"
                            ? "notification-success"
                            : "notification-error"
                    }`}
                >

                    <span className="notification-icon">

                        {notification.type ===
                        "success"
                            ? "✓"
                            : "!"}

                    </span>

                    <span>
                        {
                            notification.message
                        }
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setNotification({
                                type: "",
                                message: "",
                            })
                        }
                    >
                        ×
                    </button>

                </div>

            )}


            {/* ============================================================
                ERROR
            ============================================================ */}

            {error && (

                <div className="admin-error-banner">

                    <div>

                        <strong>
                            Unable to load tours
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchTours(true)
                        }
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* ============================================================
                STATISTICS
            ============================================================ */}

            <div className="tour-stat-grid">

                <div className="tour-stat-card">

                    <div className="tour-stat-icon">
                        ◫
                    </div>

                    <div>

                        <span>
                            Total Tours
                        </span>

                        <strong>
                            {
                                pagination.total
                            }
                        </strong>

                    </div>

                </div>


                <div className="tour-stat-card">

                    <div className="tour-stat-icon">
                        ✓
                    </div>

                    <div>

                        <span>
                            Active
                        </span>

                        <strong>
                            {
                                statistics.active
                            }
                        </strong>

                    </div>

                </div>


                <div className="tour-stat-card">

                    <div className="tour-stat-icon">
                        ◌
                    </div>

                    <div>

                        <span>
                            Inactive
                        </span>

                        <strong>
                            {
                                statistics.inactive
                            }
                        </strong>

                    </div>

                </div>


                <div className="tour-stat-card">

                    <div className="tour-stat-icon">
                        ★
                    </div>

                    <div>

                        <span>
                            Featured
                        </span>

                        <strong>
                            {
                                statistics.featured
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* ============================================================
                FILTER BAR
            ============================================================ */}

            <div className="tour-filter-card">

                <div className="tour-search">

                    <span className="search-icon">
                        ⌕
                    </span>

                    <input
                        type="search"
                        placeholder="Search tours..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={status}
                    onChange={(event) =>
                        setStatus(
                            event.target.value
                        )
                    }
                    aria-label="Filter by status"
                >

                    <option value="">
                        All Status
                    </option>

                    <option value="ACTIVE">
                        Active
                    </option>

                    <option value="INACTIVE">
                        Inactive
                    </option>

                </select>


                <select
                    value={featured}
                    onChange={(event) =>
                        setFeatured(
                            event.target.value
                        )
                    }
                    aria-label="Filter by featured status"
                >

                    <option value="">
                        All Tours
                    </option>

                    <option value="true">
                        Featured
                    </option>

                    <option value="false">
                        Not Featured
                    </option>

                </select>


                {(search ||
                    status ||
                    featured) && (

                    <button
                        type="button"
                        className="clear-filter-btn"
                        onClick={
                            clearFilters
                        }
                    >
                        Clear Filters
                    </button>

                )}

            </div>


            {/* ============================================================
                TOUR TABLE
            ============================================================ */}

            <div className="tour-table-card">

                <div className="tour-table-header">

                    <div>

                        <h2>
                            All Tours
                        </h2>

                        <span>
                            {pagination.total}
                            {" "}
                            {pagination.total === 1
                                ? "tour"
                                : "tours"}
                        </span>

                    </div>

                </div>


                {tours.length === 0 ? (

                    <div className="empty-tours">

                        <div className="empty-tour-icon">
                            ◫
                        </div>

                        <h3>
                            No tours found
                        </h3>

                        <p>
                            Try adjusting your
                            filters or create
                            your first tour.
                        </p>

                        <Link
                            to="/admin/tours/new"
                            className="admin-btn admin-btn-primary"
                        >
                            + Add Your First Tour
                        </Link>

                    </div>

                ) : (

                    <div className="tour-table-wrapper">

                        <table className="tour-table">

                            <thead>

                                <tr>

                                    <th>
                                        Tour
                                    </th>

                                    <th>
                                        Destination
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Featured
                                    </th>

                                    <th>
                                        Content
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {tours.map(
                                    (
                                        tour
                                    ) => (

                                        <tr
                                            key={
                                                tour.id
                                            }
                                        >

                                            {/* TOUR */}

                                            <td>

                                                <div className="tour-name-cell">

                                                    <div className="tour-thumbnail">

                                                        {tour.primary_image ? (

                                                            <img
                                                                src={
                                                                    tour.primary_image
                                                                }
                                                                alt={
                                                                    tour.title
                                                                }
                                                            />

                                                        ) : (

                                                            <span>
                                                                ◫
                                                            </span>

                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                tour.title
                                                            }
                                                        </strong>

                                                        <span>
                                                            /
                                                            {
                                                                tour.slug
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* DESTINATION */}

                                            <td>

                                                <div className="tour-location">

                                                    <strong>
                                                        {
                                                            tour.destination_name ||
                                                            "—"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            tour.category_name ||
                                                            "—"
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* PRICE */}

                                            <td>

                                                <strong className="tour-price">

                                                    {formatPrice(
                                                        tour.lowest_price,
                                                        tour.currency
                                                    )}

                                                </strong>

                                                {Number(
                                                    tour.price_count
                                                ) > 1 && (

                                                    <span className="price-count">

                                                        +
                                                        {
                                                            Number(
                                                                tour.price_count
                                                            ) - 1
                                                        }
                                                        {" "}
                                                        more

                                                    </span>

                                                )}

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className={`status-badge ${
                                                        String(
                                                            tour.status
                                                        ).toUpperCase() ===
                                                        "ACTIVE"
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }`}
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            tour
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    title="Change status"
                                                >

                                                    <span />

                                                    {
                                                        tour.status
                                                    }

                                                </button>

                                            </td>


                                            {/* FEATURED */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className={`featured-toggle ${
                                                        tour.featured
                                                            ? "is-featured"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleFeaturedChange(
                                                            tour
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    title={
                                                        tour.featured
                                                            ? "Remove from featured"
                                                            : "Mark as featured"
                                                    }
                                                >

                                                    <span>
                                                        ★
                                                    </span>

                                                    {
                                                        tour.featured
                                                            ? "Featured"
                                                            : "Standard"
                                                    }

                                                </button>

                                            </td>


                                            {/* CONTENT */}

                                            <td>

                                                <div className="content-counts">

                                                    <span>
                                                        $
                                                        {
                                                            tour.price_count ??
                                                            0
                                                        }
                                                        {" "}
                                                        prices
                                                    </span>

                                                    <span>
                                                        ▧
                                                        {
                                                            tour.image_count ??
                                                            0
                                                        }
                                                        {" "}
                                                        images
                                                    </span>

                                                </div>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="tour-actions">

                                                    <button
                                                        type="button"
                                                        className="icon-action"
                                                        onClick={() =>
                                                            handleViewTour(
                                                                tour
                                                            )
                                                        }
                                                        title="View"
                                                        disabled={
                                                            actionLoading
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    <Link
                                                        to={`/admin/tours/${tour.id}/edit`}
                                                        className="icon-action"
                                                    >
                                                        Edit
                                                    </Link>


                                                    <button
                                                        type="button"
                                                        className="icon-action danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                tour
                                                            )
                                                        }
                                                        title="Delete"
                                                        disabled={
                                                            actionLoading
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ============================================================
                PAGINATION
            ============================================================ */}

            {pagination.total_pages >
                0 && (

                <div className="tour-pagination">

                    <div className="pagination-info">

                        Showing{" "}
                        <strong>
                            {
                                Math.min(
                                    (
                                        pagination.page -
                                        1
                                    ) *
                                        pagination.per_page +
                                        1,
                                    pagination.total
                                )
                            }
                        </strong>
                        {" — "}
                        <strong>
                            {
                                Math.min(
                                    pagination.page *
                                        pagination.per_page,
                                    pagination.total
                                )
                            }
                        </strong>
                        {" "}
                        of{" "}
                        <strong>
                            {
                                pagination.total
                            }
                        </strong>

                    </div>


                    <div className="pagination-controls">

                        <button
                            type="button"
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        Math.max(
                                            1,
                                            current -
                                                1
                                        )
                                )
                            }
                            disabled={
                                !pagination.has_previous_page ||
                                refreshing
                            }
                        >
                            ←
                        </button>


                        <span>
                            Page{" "}
                            <strong>
                                {
                                    pagination.page
                                }
                            </strong>
                            {" "}
                            of{" "}
                            <strong>
                                {
                                    pagination.total_pages
                                }
                            </strong>
                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        current +
                                        1
                                )
                            }
                            disabled={
                                !pagination.has_next_page ||
                                refreshing
                            }
                        >
                            →
                        </button>

                    </div>


                    <select
                        value={perPage}
                        onChange={(
                            event
                        ) => {

                            setPerPage(
                                Number(
                                    event.target.value
                                )
                            );

                            setPage(1);

                        }}
                        aria-label="Tours per page"
                    >

                        <option value={10}>
                            10 / page
                        </option>

                        <option value={20}>
                            20 / page
                        </option>

                        <option value={50}>
                            50 / page
                        </option>

                    </select>

                </div>

            )}


            {/* ============================================================
                TOUR DETAILS MODAL
            ============================================================ */}

            {showDetails &&
                selectedTour && (

                <div
                    className="tour-modal-backdrop"
                    onMouseDown={
                        closeDetails
                    }
                >

                    <div
                        className="tour-details-modal"
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="tour-modal-header">

                            <div>

                                <span>
                                    TOUR DETAILS
                                </span>

                                <h2>
                                    {
                                        selectedTour.title
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeDetails
                                }
                                className="modal-close"
                            >
                                ×
                            </button>

                        </div>


                        <div className="tour-modal-body">


                            {/* IMAGE GALLERY */}

                            {selectedTour.images?.length >
                                0 && (

                                <div className="tour-detail-gallery">

                                    {selectedTour.images.map(
                                        (
                                            image
                                        ) => (

                                            <img
                                                key={
                                                    image.id
                                                }
                                                src={
                                                    image.image_url
                                                }
                                                alt={
                                                    image.alt_text ||
                                                    selectedTour.title
                                                }
                                                onError={(
                                                    event
                                                ) => {
                                                    event.currentTarget.style.opacity =
                                                        "0.35";
                                                }}
                                            />

                                        )
                                    )}

                                </div>

                            )}


                            {/* INFORMATION */}

                            <div className="tour-detail-section">

                                <h3>
                                    Information
                                </h3>


                                <div className="tour-detail-grid">

                                    <div>

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {
                                                selectedTour.category_name ||
                                                selectedTour.category?.name ||
                                                "—"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Destination
                                        </span>

                                        <strong>
                                            {
                                                selectedTour.destination_name ||
                                                selectedTour.destination?.name ||
                                                "—"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Duration
                                        </span>

                                        <strong>
                                            {
                                                selectedTour.duration ||
                                                "—"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {
                                                selectedTour.status ||
                                                "—"
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            <div className="tour-detail-section">

                                <h3>
                                    Description
                                </h3>

                                <p>
                                    {
                                        selectedTour.description ||
                                        selectedTour.short_description ||
                                        "No description available."
                                    }
                                </p>

                            </div>


                            {/* PRICES */}

                            <div className="tour-detail-section">

                                <div className="detail-section-heading">

                                    <h3>
                                        Pricing
                                    </h3>

                                    <span>
                                        {
                                            selectedTour
                                                .prices
                                                ?.length ||
                                            0
                                        }
                                    </span>

                                </div>


                                {selectedTour.prices?.length >
                                0 ? (

                                    <div className="detail-price-list">

                                        {selectedTour.prices.map(
                                            (
                                                price
                                            ) => (

                                                <div
                                                    className="detail-price-row"
                                                    key={
                                                        price.id
                                                    }
                                                >

                                                    <div>

                                                        <strong>
                                                            {
                                                                price.pricing_type
                                                            }
                                                        </strong>

                                                        <span>

                                                            {
                                                                price.min_people
                                                            }

                                                            {price.max_people
                                                                ? ` – ${price.max_people}`
                                                                : "+"}
                                                            {" "}
                                                            people

                                                        </span>

                                                    </div>


                                                    <strong>

                                                        {
                                                            formatPrice(
                                                                price.price,
                                                                price.currency
                                                            )
                                                        }

                                                    </strong>

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <p className="detail-empty">
                                        No pricing configured.
                                    </p>

                                )}

                            </div>


                            {/* IMAGES COUNT */}

                            <div className="tour-detail-section">

                                <div className="detail-section-heading">

                                    <h3>
                                        Images
                                    </h3>

                                    <span>
                                        {
                                            selectedTour
                                                .images
                                                ?.length ||
                                            0
                                        }
                                    </span>

                                </div>

                            </div>


                        </div>


                        <div className="tour-modal-footer">

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={
                                    closeDetails
                                }
                            >
                                Close
                            </button>


                            <Link
                                to={
                                    selectedTour.id
                                        ? `/admin/tours/${selectedTour.id}/edit`
                                        : "/admin/tours"
                                }
                                className="admin-btn admin-btn-primary"
                                onClick={
                                    closeDetails
                                }
                            >
                                Edit Tour
                            </Link>

                        </div>

                    </div>

                </div>

            )}

                </div>
            </main>
        </div>
    );
}

export default AdminTours;