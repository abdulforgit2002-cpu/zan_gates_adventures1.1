import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import adminApi from "../../services/adminApi";


/*
|--------------------------------------------------------------------------
| FORMAT CURRENCY
|--------------------------------------------------------------------------
*/

const formatCurrency = (
    amount,
    currency = "USD"
) => {

    const numericAmount =
        Number(amount || 0);

    try {

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
            }
        ).format(numericAmount);

    } catch {

        return `${currency} ${numericAmount.toFixed(2)}`;
    }
};


/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

const formatDate = (
    value
) => {

    if (!value) {
        return "—";
    }

    const date =
        new Date(
            `${value}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


/*
|--------------------------------------------------------------------------
| FORMAT SHORT DATE
|--------------------------------------------------------------------------
*/

const formatShortDate = (
    value
) => {

    if (!value) {
        return {
            day: "—",
            month: "",
        };
    }

    const date =
        new Date(
            `${value}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return {
            day: value,
            month: "",
        };
    }

    return {
        day: date.getDate(),
        month: date.toLocaleDateString(
            "en-US",
            {
                month: "short",
            }
        ),
    };
};


/*
|--------------------------------------------------------------------------
| STATUS CLASS
|--------------------------------------------------------------------------
*/

const statusClass = (
    status
) => {

    return `status-${String(
        status || ""
    ).toLowerCase()}`;
};


/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

const AdminDashboard = () => {

    const navigate =
        useNavigate();


    const {
        admin,
        logout,
    } = useAuth();


    const [
        dashboard,
        setDashboard,
    ] = useState(null);


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


    /*
    |--------------------------------------------------------------------------
    | LOAD DASHBOARD
    |--------------------------------------------------------------------------
    */

    const loadDashboard =
        useCallback(
            async ({
                showLoading = true,
            } = {}) => {

                try {

                    if (showLoading) {
                        setLoading(true);
                    } else {
                        setRefreshing(true);
                    }


                    setError("");


                    const response =
                        await adminApi.dashboard();


                    setDashboard(
                        response?.data || null
                    );

                } catch (err) {

                    console.error(
                        "Failed to load dashboard:",
                        err
                    );


                    if (
                        err?.code ===
                        "AUTH_EXPIRED" ||
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


                    if (
                        err?.code ===
                        "FORBIDDEN"
                    ) {

                        setError(
                            "You do not have permission to access the administrator dashboard."
                        );

                        return;
                    }


                    setError(
                        err?.message ||
                        "Unable to load dashboard."
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);
                }

            },
            [
                logout,
                navigate,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadDashboard();

    }, [
        loadDashboard,
    ]);


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

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
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="admin-loading-screen">

                <div className="admin-loading-spinner"></div>

                <p>
                    Loading dashboard...
                </p>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (error) {

        return (
            <div className="admin-page">

                <div className="admin-error-state">

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            loadDashboard()
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    if (!dashboard) {
        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD DATA
    |--------------------------------------------------------------------------
    */

    const statistics =
        dashboard.statistics || {};


    const financialSummary =
        Array.isArray(
            dashboard.financial_summary
        )
            ? dashboard.financial_summary
            : [];


    const recentBookings =
        Array.isArray(
            dashboard.recent_bookings
        )
            ? dashboard.recent_bookings
            : [];


    const upcomingBookings =
        Array.isArray(
            dashboard.upcoming_bookings
        )
            ? dashboard.upcoming_bookings
            : [];


    const tourPerformance =
        Array.isArray(
            dashboard.tour_performance
        )
            ? dashboard.tour_performance
            : [];


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="admin-page">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

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

                    <button
                        type="button"
                        className="active"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/bookings"
                            )
                        }
                    >
                        <span>▤</span>
                        Bookings
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/tours"
                            )
                        }
                    >
                        <span>◫</span>
                        Tours
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        <span>↗</span>
                        View Website
                    </button>

                </nav>


                <div className="admin-sidebar-footer">

                    <div className="admin-user">

                        <div className="admin-user-avatar">

                            {admin?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "A"
                            }

                        </div>


                        <div>

                            <strong>
                                {admin?.full_name ||
                                    "Administrator"
                                }
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


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="admin-main">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="admin-header">

                    <div>

                        <span>
                            ADMINISTRATION
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                    </div>


                    <div className="admin-header-actions">

                        <button
                            type="button"
                            onClick={() =>
                                loadDashboard({
                                    showLoading: false,
                                })
                            }
                            disabled={refreshing}
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"
                            }
                        </button>

                    </div>

                </header>


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <section className="admin-stat-grid">


                    <div className="admin-stat-card">

                        <span>
                            Total Bookings
                        </span>

                        <strong>
                            {Number(
                                statistics.total_bookings || 0
                            )}
                        </strong>

                        <small>
                            All enquiries
                        </small>

                    </div>


                    <div className="admin-stat-card">

                        <span>
                            Pending
                        </span>

                        <strong>
                            {Number(
                                statistics.pending_bookings || 0
                            )}
                        </strong>

                        <small>
                            Awaiting confirmation
                        </small>

                    </div>


                    <div className="admin-stat-card">

                        <span>
                            Confirmed
                        </span>

                        <strong>
                            {Number(
                                statistics.confirmed_bookings || 0
                            )}
                        </strong>

                        <small>
                            Confirmed bookings
                        </small>

                    </div>


                    <div className="admin-stat-card">

                        <span>
                            Completed
                        </span>

                        <strong>
                            {Number(
                                statistics.completed_bookings || 0
                            )}
                        </strong>

                        <small>
                            Completed trips
                        </small>

                    </div>


                    <div className="admin-stat-card">

                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {Number(
                                statistics.cancelled_bookings || 0
                            )}
                        </strong>

                        <small>
                            Cancelled enquiries
                        </small>

                    </div>

                </section>


                {/* ==================================================
                    FINANCIAL SUMMARY
                ================================================== */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                FINANCIAL OVERVIEW
                            </span>

                            <h2>
                                Estimated Revenue
                            </h2>

                        </div>

                    </div>


                    <div className="admin-financial-grid">

                        {financialSummary.length === 0 ? (

                            <div className="admin-empty">

                                No financial data available.

                            </div>

                        ) : (

                            financialSummary.map(
                                (financial) => (

                                    <div
                                        className="admin-financial-card"
                                        key={
                                            financial.currency
                                        }
                                    >

                                        <span>
                                            {
                                                financial.currency
                                            }
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                financial.estimated_total,
                                                financial.currency
                                            )}
                                        </strong>

                                        <small>
                                            {
                                                financial.booking_count
                                            }{" "}
                                            booking
                                            {
                                                financial.booking_count !== 1
                                                    ? "s"
                                                    : ""
                                            }
                                        </small>

                                    </div>

                                )
                            )
                        )}

                    </div>

                </section>


                {/* ==================================================
                    RECENT BOOKINGS
                ================================================== */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                ACTIVITY
                            </span>

                            <h2>
                                Recent Bookings
                            </h2>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/bookings"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        Guest
                                    </th>

                                    <th>
                                        Tour
                                    </th>

                                    <th>
                                        Travel Date
                                    </th>

                                    <th>
                                        Guests
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {recentBookings.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="admin-table-empty"
                                        >
                                            No bookings found.
                                        </td>

                                    </tr>

                                ) : (

                                    recentBookings.map(
                                        (booking) => (

                                            <tr
                                                key={
                                                    booking.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            booking.full_name
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            booking.email
                                                        }
                                                    </small>

                                                </td>


                                                <td>

                                                    {
                                                        booking.tour_title ||
                                                        "Unknown Tour"
                                                    }

                                                </td>


                                                <td>

                                                    {formatDate(
                                                        booking.travel_date
                                                    )}

                                                </td>


                                                <td>

                                                    {booking.adults}{" "}
                                                    adult
                                                    {
                                                        booking.adults !== 1
                                                            ? "s"
                                                            : ""
                                                    }

                                                    {booking.children > 0 &&
                                                        ` + ${booking.children} child${booking.children !== 1 ? "ren" : ""}`
                                                    }

                                                </td>


                                                <td>

                                                    {formatCurrency(
                                                        booking.estimated_total,
                                                        booking.currency
                                                    )}

                                                </td>


                                                <td>

                                                    <span
                                                        className={`admin-status ${statusClass(
                                                            booking.status
                                                        )}`}
                                                    >
                                                        {
                                                            booking.status
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* ==================================================
                    UPCOMING BOOKINGS
                ================================================== */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                UPCOMING
                            </span>

                            <h2>
                                Upcoming Trips
                            </h2>

                        </div>

                    </div>


                    <div className="admin-upcoming-list">

                        {upcomingBookings.length === 0 ? (

                            <div className="admin-empty">

                                No upcoming bookings.

                            </div>

                        ) : (

                            upcomingBookings.map(
                                (booking) => {

                                    const date =
                                        formatShortDate(
                                            booking.travel_date
                                        );

                                    return (

                                        <div
                                            className="admin-upcoming-item"
                                            key={
                                                booking.id
                                            }
                                        >

                                            <div className="admin-date-box">

                                                <strong>
                                                    {
                                                        date.day
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        date.month
                                                    }
                                                </span>

                                            </div>


                                            <div className="admin-upcoming-info">

                                                <strong>
                                                    {
                                                        booking.tour_title
                                                    }
                                                </strong>

                                                <span>

                                                    {
                                                        booking.full_name
                                                    }

                                                    {" · "}

                                                    {
                                                        booking.adults
                                                    }{" "}
                                                    adult
                                                    {
                                                        booking.adults !== 1
                                                            ? "s"
                                                            : ""
                                                    }

                                                    {booking.children > 0 &&
                                                        ` · ${booking.children} child${booking.children !== 1 ? "ren" : ""}`
                                                    }

                                                </span>

                                            </div>


                                            <span
                                                className={`admin-status ${statusClass(
                                                    booking.status
                                                )}`}
                                            >
                                                {
                                                    booking.status
                                                }
                                            </span>

                                        </div>
                                    );
                                }
                            )
                        )}

                    </div>

                </section>


                {/* ==================================================
                    TOUR PERFORMANCE
                ================================================== */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                PERFORMANCE
                            </span>

                            <h2>
                                Tour Performance
                            </h2>

                        </div>

                    </div>


                    <div className="admin-tour-performance">

                        {tourPerformance.length === 0 ? (

                            <div className="admin-empty">

                                No tour performance data available.

                            </div>

                        ) : (

                            tourPerformance.map(
                                (tour) => (

                                    <div
                                        className="admin-tour-row"
                                        key={
                                            tour.id
                                        }
                                    >

                                        <div>

                                            <strong>
                                                {
                                                    tour.title
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    tour.booking_count
                                                }{" "}
                                                total booking
                                                {
                                                    tour.booking_count !== 1
                                                        ? "s"
                                                        : ""
                                                }
                                            </span>

                                        </div>


                                        <div className="admin-tour-metrics">

                                            <span>
                                                Pending{" "}
                                                <strong>
                                                    {
                                                        tour.pending_count
                                                    }
                                                </strong>
                                            </span>

                                            <span>
                                                Confirmed{" "}
                                                <strong>
                                                    {
                                                        tour.confirmed_count
                                                    }
                                                </strong>
                                            </span>

                                            <span>
                                                Completed{" "}
                                                <strong>
                                                    {
                                                        tour.completed_count
                                                    }
                                                </strong>
                                            </span>

                                        </div>

                                    </div>

                                )
                            )
                        )}

                    </div>

                </section>

            </main>

        </div>
    );
};


export default AdminDashboard;