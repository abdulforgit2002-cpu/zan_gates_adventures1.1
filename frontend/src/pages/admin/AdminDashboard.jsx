import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import adminApi from "../../services/adminApi";


const formatCurrency = (
    amount,
    currency = "USD"
) => {

    const numericAmount =
        Number(amount || 0);


    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }
    ).format(numericAmount);
};


const statusClass = (
    status
) => {

    return `status-${String(
        status || ""
    ).toLowerCase()}`;
};


const AdminDashboard = () => {

    const navigate =
        useNavigate();

    const {
        admin,
        logout,
    } = useAuth();


    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | LOAD DASHBOARD
    |--------------------------------------------------------------------------
    */

    const loadDashboard =
        useCallback(async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await adminApi.dashboard();


                setDashboard(
                    response.data
                );

            } catch (err) {

                if (
                    err.code ===
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


                setError(
                    err.message ||
                    "Unable to load dashboard."
                );

            } finally {

                setLoading(false);
            }

        }, [
            logout,
            navigate,
        ]);


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
                        onClick={loadDashboard}
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


    const {
        statistics,
        financial_summary,
        recent_bookings,
        upcoming_bookings,
        tour_performance,
    } = dashboard;


    return (
        <div className="admin-page">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="admin-sidebar">

                <div className="admin-sidebar-brand">

                    <div className="admin-brand-mark">
                        ZG
                    </div>

                    <div>

                        <strong>
                            ZAN GATES
                        </strong>

                        <span>
                            ADVENTURES
                        </span>

                    </div>

                </div>


                <nav className="admin-sidebar-nav">

                    <button
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
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>

                </div>

            </aside>


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="admin-main">


                {/* Header */}

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
                            onClick={loadDashboard}
                        >
                            Refresh
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
                            {statistics.total_bookings}
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
                            {statistics.pending_bookings}
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
                            {statistics.confirmed_bookings}
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
                            {statistics.completed_bookings}
                        </strong>

                        <small>
                            Completed trips
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

                        {financial_summary.length === 0 ? (

                            <div className="admin-empty">
                                No financial data available.
                            </div>

                        ) : (

                            financial_summary.map(
                                (financial) => (

                                    <div
                                        className="admin-financial-card"
                                        key={financial.currency}
                                    >

                                        <span>
                                            {financial.currency}
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
                                            bookings
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

                                {recent_bookings.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="admin-table-empty"
                                        >
                                            No bookings found.
                                        </td>

                                    </tr>

                                ) : (

                                    recent_bookings.map(
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
                                                        booking.tour_title
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        booking.travel_date
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        booking.adults
                                                    }{" "}
                                                    adult
                                                    {booking.adults !== 1
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

                        {upcoming_bookings.length === 0 ? (

                            <div className="admin-empty">
                                No upcoming bookings.
                            </div>

                        ) : (

                            upcoming_bookings.map(
                                (booking) => (

                                    <div
                                        className="admin-upcoming-item"
                                        key={booking.id}
                                    >

                                        <div className="admin-date-box">

                                            <strong>
                                                {
                                                    new Date(
                                                        `${booking.travel_date}T00:00:00`
                                                    ).getDate()
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    new Date(
                                                        `${booking.travel_date}T00:00:00`
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                        }
                                                    )
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
                                                adults
                                                {booking.children > 0 &&
                                                    ` · ${booking.children} children`
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

                                )
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

                        {tour_performance.length === 0 ? (

                            <div className="admin-empty">
                                No tour performance data available.
                            </div>

                        ) : (

                            tour_performance.map(
                                (tour) => (

                                    <div
                                        className="admin-tour-row"
                                        key={tour.id}
                                    >

                                        <div>

                                            <strong>
                                                {tour.title}
                                            </strong>

                                            <span>
                                                {tour.booking_count}{" "}
                                                total bookings
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