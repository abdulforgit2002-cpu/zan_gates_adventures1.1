import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import adminApi from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";


/*
|--------------------------------------------------------------------------
| ADMIN BOOKING DETAILS
|--------------------------------------------------------------------------
*/

function AdminBookingDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { logout } = useAuth();

    const [booking, setBooking] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [updating, setUpdating] =
        useState(false);

    const [error, setError] =
        useState("");

    const [actionError, setActionError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | LOAD BOOKING
    |--------------------------------------------------------------------------
    */

    const loadBooking =
        useCallback(async () => {

            setLoading(true);
            setError("");

            try {

                const response =
                    await adminApi.booking(id);

                /*
                 * Backend normally returns:
                 *
                 * {
                 *     success: true,
                 *     message: "...",
                 *     data: {
                 *         booking: {...}
                 *     }
                 * }
                 *
                 * We also support a direct booking object
                 * to make the frontend more tolerant.
                 */

                const data =
                    response?.data;

                const bookingData =
                    data?.booking ||
                    data;

                if (
                    !bookingData ||
                    typeof bookingData !== "object"
                ) {
                    throw new Error(
                        "Booking information was not returned by the server."
                    );
                }

                setBooking(
                    bookingData
                );

            } catch (err) {

                console.error(
                    "Unable to load booking:",
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
                        "You do not have permission to view this booking."
                    );

                    return;
                }

                setError(
                    err?.message ||
                    "Unable to load booking details."
                );

            } finally {

                setLoading(false);
            }

        }, [
            id,
            logout,
            navigate,
        ]);


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadBooking();

    }, [
        loadBooking,
    ]);


    /*
    |--------------------------------------------------------------------------
    | BOOKING STATUS
    |--------------------------------------------------------------------------
    |
    | Must mirror the backend transition rules.
    |
    | PENDING
    |   -> CONFIRMED
    |   -> CANCELLED
    |
    | CONFIRMED
    |   -> COMPLETED
    |   -> CANCELLED
    |
    | CANCELLED
    |   -> terminal
    |
    | COMPLETED
    |   -> terminal
    |
    |--------------------------------------------------------------------------
    */

    const getAllowedNextStatuses =
        (status) => {

            const normalizedStatus =
                String(status || "")
                    .trim()
                    .toUpperCase();

            switch (
                normalizedStatus
            ) {

                case "PENDING":

                    return [
                        "CONFIRMED",
                        "CANCELLED",
                    ];

                case "CONFIRMED":

                    return [
                        "COMPLETED",
                        "CANCELLED",
                    ];

                case "CANCELLED":

                    return [];

                case "COMPLETED":

                    return [];

                default:

                    return [];
            }
        };


    /*
    |--------------------------------------------------------------------------
    | STATUS ACTION LABEL
    |--------------------------------------------------------------------------
    */

    const statusActionLabel =
        (status) => {

            switch (
                String(status || "")
                    .trim()
                    .toUpperCase()
            ) {

                case "CONFIRMED":
                    return "Confirm Booking";

                case "CANCELLED":
                    return "Cancel Booking";

                case "COMPLETED":
                    return "Mark Completed";

                default:
                    return "Update Status";
            }
        };


    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    const updateStatus =
        async (status) => {

            if (
                !booking?.id ||
                updating
            ) {
                return;
            }

            const normalizedStatus =
                String(status || "")
                    .trim()
                    .toUpperCase();

            const currentStatus =
                String(
                    booking.status || ""
                )
                    .trim()
                    .toUpperCase();


            /*
             * Validate requested status.
             */

            const allowedStatuses = [
                "PENDING",
                "CONFIRMED",
                "CANCELLED",
                "COMPLETED",
            ];

            if (
                !allowedStatuses.includes(
                    normalizedStatus
                )
            ) {

                setActionError(
                    "Invalid booking status."
                );

                return;
            }


            /*
             * Prevent invalid frontend transitions
             * before making an API request.
             */

            const allowedNextStatuses =
                getAllowedNextStatuses(
                    currentStatus
                );

            if (
                !allowedNextStatuses.includes(
                    normalizedStatus
                )
            ) {

                setActionError(
                    `Invalid booking status transition: ${formatStatus(
                        currentStatus
                    )} → ${formatStatus(
                        normalizedStatus
                    )}.`
                );

                return;
            }


            /*
             * Confirmation messages.
             */

            const messages = {

                CONFIRMED:
                    "Are you sure you want to confirm this booking?",

                CANCELLED:
                    "Are you sure you want to cancel this booking?",

                COMPLETED:
                    "Are you sure you want to mark this booking as completed?",
            };


            const confirmation =
                messages[
                    normalizedStatus
                ];


            /*
             * Ask administrator for confirmation.
             */

            if (
                confirmation &&
                !window.confirm(
                    confirmation
                )
            ) {
                return;
            }


            setUpdating(true);
            setActionError("");


            try {

                const response =
                    await adminApi.updateBookingStatus(
                        booking.id,
                        normalizedStatus
                    );


                const updatedData =
                    response?.data;

                const updatedBooking =
                    updatedData?.booking ||
                    updatedData;


                /*
                 * Use returned booking if available.
                 */

                if (
                    updatedBooking &&
                    typeof updatedBooking === "object" &&
                    updatedBooking.id
                ) {

                    setBooking(
                        updatedBooking
                    );

                } else {

                    /*
                     * Otherwise update the status
                     * locally.
                     */

                    setBooking(
                        previous => ({
                            ...previous,
                            status:
                                normalizedStatus,
                        })
                    );
                }


                /*
                 * Reload from server so the detail
                 * page always reflects the canonical
                 * database state.
                 */

                try {

                    const refreshedResponse =
                        await adminApi.booking(
                            booking.id
                        );

                    const refreshedData =
                        refreshedResponse?.data;

                    const refreshedBooking =
                        refreshedData?.booking ||
                        refreshedData;

                    if (
                        refreshedBooking &&
                        typeof refreshedBooking === "object"
                    ) {

                        setBooking(
                            refreshedBooking
                        );
                    }

                } catch (refreshError) {

                    /*
                     * The status update already succeeded.
                     * Do not turn a successful update into
                     * an error just because the refresh failed.
                     */

                    console.warn(
                        "Booking was updated, but refreshing the booking failed:",
                        refreshError
                    );
                }

            } catch (err) {

                console.error(
                    "Unable to update booking status:",
                    err
                );


                /*
                 * Authentication expired.
                 */

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


                /*
                 * Permission denied.
                 */

                if (
                    err?.code ===
                        "FORBIDDEN"
                ) {

                    setActionError(
                        "You do not have permission to update this booking."
                    );

                    return;
                }


                /*
                 * Backend rejected the transition.
                 *
                 * Example:
                 *
                 * COMPLETED → CANCELLED
                 */

                if (
                    err?.status === 409
                ) {

                    const backendErrors =
                        err?.response?.errors ||
                        err?.errors ||
                        null;

                    if (
                        backendErrors?.current_status &&
                        backendErrors?.requested_status
                    ) {

                        const backendCurrentStatus =
                            String(
                                backendErrors.current_status
                            )
                                .trim()
                                .toUpperCase();

                        const backendRequestedStatus =
                            String(
                                backendErrors.requested_status
                            )
                                .trim()
                                .toUpperCase();

                        setActionError(
                            `Invalid booking status transition: ${formatStatus(
                                backendCurrentStatus
                            )} → ${formatStatus(
                                backendRequestedStatus
                            )}.`
                        );

                    } else {

                        setActionError(
                            err?.message ||
                            "This booking status change is not allowed."
                        );
                    }


                    /*
                     * Refresh because another admin/user
                     * may have changed the booking.
                     */

                    try {

                        await loadBooking();

                    } catch (refreshError) {

                        console.warn(
                            "Unable to refresh booking after status conflict:",
                            refreshError
                        );
                    }

                    return;
                }


                /*
                 * General error.
                 */

                setActionError(
                    err?.message ||
                    "Unable to update booking status."
                );

            } finally {

                setUpdating(false);
            }
        };


    /*
    |--------------------------------------------------------------------------
    | FORMATTERS
    |--------------------------------------------------------------------------
    */

    const formatStatus =
        (status) => {

            if (!status) {
                return "Unknown";
            }

            return String(status)
                .toLowerCase()
                .replace(
                    /\b\w/g,
                    character =>
                        character.toUpperCase()
                );
        };


    const statusClass =
        (status) => {

            switch (
                String(status || "")
                    .toUpperCase()
            ) {

                case "CONFIRMED":
                    return "status-confirmed";

                case "CANCELLED":
                    return "status-cancelled";

                case "COMPLETED":
                    return "status-completed";

                case "PENDING":
                    return "status-pending";

                default:
                    return "";
            }
        };


    const formatMoney =
        (amount, currency = "USD") => {

            const numericAmount =
                Number(amount);

            if (
                Number.isNaN(
                    numericAmount
                )
            ) {
                return "—";
            }

            return new Intl.NumberFormat(
                "en-US",
                {
                    style: "currency",
                    currency:
                        currency || "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            ).format(
                numericAmount
            );
        };


    const formatDate =
        (value) => {

            if (!value) {
                return "—";
            }

            const date =
                new Date(value);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return value;
            }

            return new Intl.DateTimeFormat(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }
            ).format(date);
        };


    const formatDateTime =
        (value) => {

            if (!value) {
                return "—";
            }

            const date =
                new Date(value);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return value;
            }

            return new Intl.DateTimeFormat(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }
            ).format(date);
        };


    /*
    |--------------------------------------------------------------------------
    | LOADING STATE
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="admin-layout">

                <AdminSidebar
                    navigate={navigate}
                />

                <main className="admin-main">

                    <div className="admin-topbar">

                        <div>

                            <span className="admin-eyebrow">
                                ADMINISTRATION
                            </span>

                            <h1>
                                Booking Details
                            </h1>

                        </div>

                    </div>


                    <section className="admin-content">

                        <div className="admin-loading">
                            Loading booking details...
                        </div>

                    </section>

                </main>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ERROR STATE
    |--------------------------------------------------------------------------
    */

    if (error || !booking) {

        return (
            <div className="admin-layout">

                <AdminSidebar
                    navigate={navigate}
                />

                <main className="admin-main">

                    <div className="admin-topbar">

                        <div>

                            <span className="admin-eyebrow">
                                ADMINISTRATION
                            </span>

                            <h1>
                                Booking Details
                            </h1>

                        </div>

                    </div>


                    <section className="admin-content">

                        <div className="admin-error">

                            <strong>
                                Unable to load booking
                            </strong>

                            <p>
                                {error ||
                                    "The requested booking could not be found."}
                            </p>


                            <div className="admin-error-actions">

                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={loadBooking}
                                >
                                    Try Again
                                </button>


                                <Link
                                    to="/admin/bookings"
                                    className="admin-btn admin-btn-primary"
                                >
                                    Back to Bookings
                                </Link>

                            </div>

                        </div>

                    </section>

                </main>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | BOOKING DATA
    |--------------------------------------------------------------------------
    */

    const tourTitle =
        booking.tour_title ||
        booking.tour_name ||
        booking.title ||
        "Tour";


    const tourSlug =
        booking.tour_slug ||
        booking.slug ||
        "";


    const currency =
        booking.currency ||
        "USD";


    const adults =
        Number(
            booking.adults || 0
        );


    const children =
        Number(
            booking.children || 0
        );


    const totalGuests =
        adults + children;


    const normalizedBookingStatus =
        String(
            booking.status || ""
        )
            .trim()
            .toUpperCase();


    const allowedNextStatuses =
        getAllowedNextStatuses(
            normalizedBookingStatus
        );


    const canConfirm =
        allowedNextStatuses.includes(
            "CONFIRMED"
        );


    const canCancel =
        allowedNextStatuses.includes(
            "CANCELLED"
        );


    const canComplete =
        allowedNextStatuses.includes(
            "COMPLETED"
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="admin-layout">

            <AdminSidebar
                navigate={navigate}
            />


            <main className="admin-main">

                {/* TOP BAR */}

                <div className="admin-topbar">

                    <div>

                        <span className="admin-eyebrow">
                            ADMINISTRATION
                        </span>

                        <h1>
                            Booking Details
                        </h1>

                        <p>
                            Review and manage this guest enquiry.
                        </p>

                    </div>


                    <div className="admin-topbar-actions">

                        <Link
                            to="/"
                            className="admin-btn admin-btn-secondary"
                        >
                            View Website ↗
                        </Link>

                    </div>

                </div>


                {/* CONTENT */}

                <section className="admin-content">

                    {/* BREADCRUMB */}

                    <div className="admin-breadcrumb">

                        <Link
                            to="/admin/dashboard"
                        >
                            Dashboard
                        </Link>

                        <span>
                            /
                        </span>

                        <Link
                            to="/admin/bookings"
                        >
                            Bookings
                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            Booking #{booking.id}
                        </strong>

                    </div>


                    {/* PAGE HEADER */}

                    <div className="booking-detail-header">

                        <div>

                            <span className="admin-eyebrow">
                                BOOKING ENQUIRY
                            </span>

                            <h2>
                                {tourTitle}
                            </h2>

                            <p>
                                Booking #{booking.id}
                            </p>

                        </div>


                        <div>

                            <span
                                className={`booking-status ${statusClass(
                                    booking.status
                                )}`}
                            >
                                {formatStatus(
                                    booking.status
                                )}
                            </span>

                        </div>

                    </div>


                    {/* ACTION ERROR */}

                    {actionError && (

                        <div className="admin-alert admin-alert-error">

                            {actionError}

                        </div>

                    )}


                    {/* MAIN GRID */}

                    <div className="booking-detail-grid">

                        {/* GUEST INFORMATION */}

                        <article className="booking-detail-card">

                            <div className="booking-detail-card-header">

                                <div>

                                    <span className="admin-eyebrow">
                                        GUEST
                                    </span>

                                    <h3>
                                        Guest Information
                                    </h3>

                                </div>

                            </div>


                            <div className="booking-detail-list">

                                <DetailRow
                                    label="Full Name"
                                    value={
                                        booking.full_name ||
                                        "—"
                                    }
                                />


                                <DetailRow
                                    label="Email"
                                    value={
                                        booking.email ||
                                        "—"
                                    }
                                    link={
                                        booking.email
                                            ? `mailto:${booking.email}`
                                            : null
                                    }
                                />


                                <DetailRow
                                    label="Phone"
                                    value={
                                        booking.phone ||
                                        "—"
                                    }
                                    link={
                                        booking.phone
                                            ? `tel:${booking.phone}`
                                            : null
                                    }
                                />

                            </div>

                        </article>


                        {/* TRIP INFORMATION */}

                        <article className="booking-detail-card">

                            <div className="booking-detail-card-header">

                                <div>

                                    <span className="admin-eyebrow">
                                        TRIP
                                    </span>

                                    <h3>
                                        Trip Information
                                    </h3>

                                </div>

                            </div>


                            <div className="booking-detail-list">

                                <DetailRow
                                    label="Tour"
                                    value={tourTitle}
                                />


                                <DetailRow
                                    label="Travel Date"
                                    value={formatDate(
                                        booking.travel_date
                                    )}
                                />


                                <DetailRow
                                    label="Adults"
                                    value={`${adults}`}
                                />


                                <DetailRow
                                    label="Children"
                                    value={`${children}`}
                                />


                                <DetailRow
                                    label="Total Guests"
                                    value={`${totalGuests}`}
                                />

                            </div>


                            {tourSlug && (

                                <div className="booking-tour-link">

                                    <Link
                                        to={`/tours/${tourSlug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Tour ↗
                                    </Link>

                                </div>

                            )}

                        </article>


                        {/* FINANCIAL INFORMATION */}

                        <article className="booking-detail-card">

                            <div className="booking-detail-card-header">

                                <div>

                                    <span className="admin-eyebrow">
                                        ESTIMATE
                                    </span>

                                    <h3>
                                        Booking Value
                                    </h3>

                                </div>

                            </div>


                            <div className="booking-total">

                                <span>
                                    Estimated Total
                                </span>

                                <strong>
                                    {formatMoney(
                                        booking.estimated_total,
                                        currency
                                    )}
                                </strong>

                            </div>


                            <div className="booking-detail-list">

                                <DetailRow
                                    label="Currency"
                                    value={currency}
                                />

                            </div>

                        </article>


                        {/* STATUS */}

                        <article className="booking-detail-card">

                            <div className="booking-detail-card-header">

                                <div>

                                    <span className="admin-eyebrow">
                                        STATUS
                                    </span>

                                    <h3>
                                        Booking Status
                                    </h3>

                                </div>

                            </div>


                            <div className="booking-current-status">

                                <span
                                    className={`booking-status ${statusClass(
                                        booking.status
                                    )}`}
                                >
                                    {formatStatus(
                                        booking.status
                                    )}
                                </span>

                            </div>


                            {/* STATUS ACTIONS */}

                            <div className="booking-actions">

                                {canConfirm && (

                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-success"
                                        disabled={updating}
                                        onClick={() =>
                                            updateStatus(
                                                "CONFIRMED"
                                            )
                                        }
                                    >
                                        {updating
                                            ? "Updating..."
                                            : statusActionLabel(
                                                "CONFIRMED"
                                            )}
                                    </button>

                                )}


                                {canCancel && (

                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-danger"
                                        disabled={updating}
                                        onClick={() =>
                                            updateStatus(
                                                "CANCELLED"
                                            )
                                        }
                                    >
                                        {updating
                                            ? "Updating..."
                                            : statusActionLabel(
                                                "CANCELLED"
                                            )}
                                    </button>

                                )}


                                {canComplete && (

                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-primary"
                                        disabled={updating}
                                        onClick={() =>
                                            updateStatus(
                                                "COMPLETED"
                                            )
                                        }
                                    >
                                        {updating
                                            ? "Updating..."
                                            : statusActionLabel(
                                                "COMPLETED"
                                            )}
                                    </button>

                                )}


                                {/* TERMINAL STATUS MESSAGE */}

                                {!canConfirm &&
                                    !canCancel &&
                                    !canComplete && (

                                    <div className="booking-status-terminal">

                                        <span>
                                            This booking is in a final status.
                                        </span>

                                    </div>

                                )}

                            </div>

                        </article>


                        {/* SPECIAL REQUIREMENTS */}

                        <article className="booking-detail-card booking-detail-card-full">

                            <div className="booking-detail-card-header">

                                <div>

                                    <span className="admin-eyebrow">
                                        NOTES
                                    </span>

                                    <h3>
                                        Special Requirements
                                    </h3>

                                </div>

                            </div>


                            <div className="booking-notes">

                                {booking.special_requirements ? (

                                    <p>
                                        {
                                            booking.special_requirements
                                        }
                                    </p>

                                ) : (

                                    <span>
                                        No special requirements were provided.
                                    </span>

                                )}

                            </div>

                        </article>


                        {/* RECORD INFORMATION */}

                        <article className="booking-detail-card booking-detail-card-full">

                            <div className="booking-detail-card-header">

                                <div>

                                    <span className="admin-eyebrow">
                                        RECORD
                                    </span>

                                    <h3>
                                        Booking Record
                                    </h3>

                                </div>

                            </div>


                            <div className="booking-record-grid">

                                <DetailRow
                                    label="Booking ID"
                                    value={`#${booking.id}`}
                                />


                                <DetailRow
                                    label="Created"
                                    value={formatDateTime(
                                        booking.created_at
                                    )}
                                />


                                <DetailRow
                                    label="Last Updated"
                                    value={formatDateTime(
                                        booking.updated_at
                                    )}
                                />

                            </div>

                        </article>

                    </div>


                    {/* FOOTER ACTIONS */}

                    <div className="booking-detail-footer">

                        <Link
                            to="/admin/bookings"
                            className="admin-btn admin-btn-secondary"
                        >
                            ← Back to Bookings
                        </Link>

                    </div>

                </section>

            </main>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| DETAIL ROW
|--------------------------------------------------------------------------
*/

function DetailRow({
    label,
    value,
    link = null,
}) {

    return (
        <div className="booking-detail-row">

            <span>
                {label}
            </span>


            {link ? (

                <a
                    href={link}
                >
                    {value}
                </a>

            ) : (

                <strong>
                    {value}
                </strong>

            )}

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| ADMIN SIDEBAR
|--------------------------------------------------------------------------
*/

function AdminSidebar({
    navigate,
}) {

    const handleLogout =
        () => {

            adminApi.logout();

            navigate(
                "/admin/login",
                {
                    replace: true,
                }
            );
        };


    return (
        <aside className="admin-sidebar">

            <div className="admin-brand">

                <Link
                    to="/admin/dashboard"
                    className="admin-brand-link"
                >

                    <span className="admin-brand-mark">
                        ZG
                    </span>


                    <span className="admin-brand-name">

                        <strong>
                            ZAN GATES
                        </strong>

                        <small>
                            ADVENTURES
                        </small>

                    </span>

                </Link>

            </div>


            <div className="admin-sidebar-label">
                ADMINISTRATION
            </div>


            <nav className="admin-nav">

                <Link
                    to="/admin/dashboard"
                    className="admin-nav-link"
                >

                    <span className="admin-nav-icon">
                        ▦
                    </span>

                    <span>
                        Dashboard
                    </span>

                </Link>


                <Link
                    to="/admin/bookings"
                    className="admin-nav-link active"
                >

                    <span className="admin-nav-icon">
                        ▤
                    </span>

                    <span>
                        Bookings
                    </span>

                </Link>

            </nav>


            <div className="admin-sidebar-bottom">

                <Link
                    to="/"
                    className="admin-nav-link"
                >

                    <span className="admin-nav-icon">
                        ↗
                    </span>

                    <span>
                        View Website
                    </span>

                </Link>


                <div className="admin-user">

                    <div className="admin-user-avatar">
                        S
                    </div>


                    <div className="admin-user-info">

                        <strong>
                            System Administrator
                        </strong>

                        <small>
                            Administrator
                        </small>

                    </div>

                </div>


                <button
                    type="button"
                    className="admin-signout"
                    onClick={handleLogout}
                >
                    Sign Out
                </button>

            </div>

        </aside>
    );
}


export default AdminBookingDetails;