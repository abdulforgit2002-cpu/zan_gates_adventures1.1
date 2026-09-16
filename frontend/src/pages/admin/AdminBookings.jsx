import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { Link } from "react-router-dom";

import adminApi from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";


function AdminBookings() {

    const { logout } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [updatingBookingId, setUpdatingBookingId] = useState(null);

    const [page, setPage] = useState(1);
    const perPage = 10;

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        per_page: perPage,
        total_pages: 1,
    });

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        travel_date: "",
        date_from: "",
        date_to: "",
    });


    /* =========================================================
       LOAD
       ========================================================= */

    const loadBookings = useCallback(
        async ({ showLoading = true } = {}) => {

            try {

                setError("");

                if (showLoading) setLoading(true);

                const params = new URLSearchParams();

                params.set("page", String(page));
                params.set("per_page", String(perPage));

                const search = filters.search.trim();
                if (search !== "") params.set("search", search);

                if (filters.status !== "")
                    params.set("status", filters.status);

                if (filters.travel_date !== "")
                    params.set("travel_date", filters.travel_date);

                if (filters.date_from !== "")
                    params.set("date_from", filters.date_from);

                if (filters.date_to !== "")
                    params.set("date_to", filters.date_to);

                const response =
                    await adminApi.bookings(`?${params.toString()}`);

                const data = response?.data || {};

                let bookingRows = [];
                if (Array.isArray(data.bookings)) bookingRows = data.bookings;
                else if (Array.isArray(data.data)) bookingRows = data.data;

                setBookings(bookingRows);

                if (data.pagination && typeof data.pagination === "object") {

                    const serverPagination = data.pagination;

                    setPagination({
                        total: Number(serverPagination.total || 0),
                        page: Number(serverPagination.page || page),
                        per_page: Number(serverPagination.per_page || perPage),
                        total_pages: Math.max(
                            Number(serverPagination.total_pages || 1),
                            1
                        ),
                    });

                } else {

                    const total = bookingRows.length;

                    setPagination({
                        total,
                        page,
                        per_page: perPage,
                        total_pages: Math.max(
                            Math.ceil(total / perPage),
                            1
                        ),
                    });
                }

            } catch (err) {

                console.error("Failed to load bookings:", err);

                if (
                    err?.code === "AUTH_EXPIRED" ||
                    err?.code === "AUTH_REQUIRED"
                ) {
                    logout();
                    return;
                }

                if (err?.code === "FORBIDDEN") {
                    setError(
                        "You do not have permission to manage bookings."
                    );
                    return;
                }

                setError(err?.message || "Unable to load booking enquiries.");

            } finally {
                setLoading(false);
                setRefreshing(false);
            }

        },
        [page, filters, logout]
    );


    useEffect(() => {
        loadBookings({ showLoading: true });
    }, [loadBookings]);


    /* =========================================================
       FILTERS
       ========================================================= */

    const handleFilterChange = (event) => {

        const { name, value } = event.target;

        setPage(1);

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const clearFilters = () => {
        setPage(1);
        setFilters({
            search: "",
            status: "",
            travel_date: "",
            date_from: "",
            date_to: "",
        });
    };


    const handleRefresh = async () => {

        if (refreshing) return;

        setRefreshing(true);

        await loadBookings({ showLoading: false });
    };


    /* =========================================================
       FORMATTERS
       ========================================================= */

    const statusClass = (status) => {

        const normalized = String(status || "").trim().toUpperCase();

        switch (normalized) {
            case "CONFIRMED": return "status-confirmed";
            case "CANCELLED": return "status-cancelled";
            case "COMPLETED": return "status-completed";
            case "PENDING":
            default: return "status-pending";
        }
    };


    const formatStatus = (status) => {

        const normalized = String(status || "").trim().toLowerCase();

        if (!normalized) return "Unknown";

        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };


    const formatMoney = (amount, currency = "USD") => {

        if (amount === null || amount === undefined || amount === "")
            return "—";

        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount)) return "—";

        const normalizedCurrency =
            String(currency || "USD").trim().toUpperCase();

        const symbol = normalizedCurrency === "USD"
            ? "$"
            : `${normalizedCurrency} `;

        return (
            `${symbol}` +
            numericAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        );
    };


    const formatDate = (date) => {

        if (!date) return "—";

        const parsedDate = new Date(`${date}T00:00:00`);
        if (Number.isNaN(parsedDate.getTime())) return date;

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };


    const guestLabel = (booking) => {

        const adults = Number(booking?.adults || 0);
        const children = Number(booking?.children || 0);

        const adultText = `${adults} ${adults === 1 ? "adult" : "adults"}`;

        if (children === 0) return adultText;

        const childText = `${children} ${children === 1 ? "child" : "children"}`;

        return `${adultText} + ${childText}`;
    };


    /* =========================================================
       STATUS TRANSITIONS
       ========================================================= */

    const getAllowedNextStatuses = (status) => {

        const normalized = String(status || "").trim().toUpperCase();

        switch (normalized) {
            case "PENDING": return ["CONFIRMED", "CANCELLED"];
            case "CONFIRMED": return ["COMPLETED", "CANCELLED"];
            default: return [];
        }
    };


    const statusActionLabel = (status) => {

        switch (String(status || "").trim().toUpperCase()) {
            case "CONFIRMED": return "Confirm";
            case "CANCELLED": return "Cancel";
            case "COMPLETED": return "Complete";
            default: return formatStatus(status);
        }
    };


    /* =========================================================
       UPDATE STATUS
       ========================================================= */

    const handleStatusChange = async (booking, requestedStatus) => {

        const bookingId = booking?.id;

        if (
            bookingId === null ||
            bookingId === undefined ||
            bookingId === ""
        ) {
            setError(
                "Unable to update this booking because its ID is missing."
            );
            return;
        }

        const currentStatus =
            String(booking?.status || "").trim().toUpperCase();
        const nextStatus =
            String(requestedStatus || "").trim().toUpperCase();

        const allowedStatuses =
            getAllowedNextStatuses(currentStatus);

        if (!allowedStatuses.includes(nextStatus)) {
            setError(
                `Invalid booking status transition: ${currentStatus || "UNKNOWN"} → ${nextStatus}.`
            );
            return;
        }

        if (updatingBookingId !== null) return;

        const guestName = booking?.full_name || "this guest";
        const actionLabel = statusActionLabel(nextStatus);

        let confirmationMessage =
            `Are you sure you want to ${actionLabel.toLowerCase()} this booking for ${guestName}?`;

        if (nextStatus === "CANCELLED") {
            confirmationMessage =
                `Are you sure you want to cancel this booking for ${guestName}? This action cannot be undone.`;
        } else if (nextStatus === "COMPLETED") {
            confirmationMessage =
                `Are you sure you want to mark this booking for ${guestName} as completed? This action cannot be undone.`;
        } else if (nextStatus === "CONFIRMED") {
            confirmationMessage =
                `Are you sure you want to confirm this booking for ${guestName}?`;
        }

        if (!window.confirm(confirmationMessage)) return;

        setError("");
        setUpdatingBookingId(bookingId);

        try {

            await adminApi.updateBookingStatus(bookingId, nextStatus);

            setBookings((previous) =>
                previous.map((currentBooking) =>
                    String(currentBooking?.id) === String(bookingId)
                        ? { ...currentBooking, status: nextStatus }
                        : currentBooking
                )
            );

            await loadBookings({ showLoading: false });

        } catch (err) {

            console.error("Failed to update booking status:", err);

            if (
                err?.code === "AUTH_EXPIRED" ||
                err?.code === "AUTH_REQUIRED"
            ) {
                logout();
                return;
            }

            if (err?.code === "FORBIDDEN") {
                setError(
                    "You do not have permission to update booking statuses."
                );
                return;
            }

            if (err?.status === 409) {
                setError(
                    err?.response?.message ||
                    err?.message ||
                    "The booking status could not be changed because the booking has already changed."
                );
                await loadBookings({ showLoading: false });
                return;
            }

            setError(
                err?.message ||
                "Unable to update the booking status. Please try again."
            );

        } finally {
            setUpdatingBookingId(null);
        }
    };


    /* =========================================================
       PAGINATION
       ========================================================= */

    const totalPages = Math.max(
        Number(pagination.total_pages || 1),
        1
    );

    const currentPage = Math.min(
        Math.max(Number(pagination.page || page), 1),
        totalPages
    );

    const goToPage = (nextPage) => {

        const targetPage = Number(nextPage);
        if (Number.isNaN(targetPage)) return;
        if (targetPage < 1 || targetPage > totalPages) return;
        if (targetPage === page) return;

        setPage(targetPage);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const paginationItems = () => {

        const items = [];

        if (totalPages <= 7) {
            for (let n = 1; n <= totalPages; n++) {
                items.push({ type: "page", number: n });
            }
            return items;
        }

        items.push({ type: "page", number: 1 });

        if (currentPage > 3) {
            items.push({ type: "dots", id: "left-dots" });
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let n = start; n <= end; n++) {
            items.push({ type: "page", number: n });
        }

        if (currentPage < totalPages - 2) {
            items.push({ type: "dots", id: "right-dots" });
        }

        items.push({ type: "page", number: totalPages });

        return items;
    };


    const filtersApplied = Boolean(
        filters.search ||
        filters.status ||
        filters.travel_date ||
        filters.date_from ||
        filters.date_to
    );


    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <>

            {/* ==================================================
                PAGE HEADING
            ================================================== */}

            <div className="admin-page-heading">

                <div>
                    <span className="admin-eyebrow">
                        ADMINISTRATION
                    </span>
                    <h1>Booking Enquiries</h1>
                    <p>
                        Manage guest enquiries, travel dates and booking
                        statuses.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={handleRefresh}
                    disabled={
                        refreshing ||
                        updatingBookingId !== null
                    }
                >
                    {refreshing ? "Refreshing..." : "↻ Refresh"}
                </button>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <section className="booking-filters">

                <div className="booking-filter-search">
                    <label>Search</label>
                    <input
                        type="search"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Guest, email or phone..."
                        autoComplete="off"
                        disabled={updatingBookingId !== null}
                    />
                </div>

                <div>
                    <label>Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        disabled={updatingBookingId !== null}
                    >
                        <option value="">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>

                <div>
                    <label>Travel Date</label>
                    <input
                        type="date"
                        name="travel_date"
                        value={filters.travel_date}
                        onChange={handleFilterChange}
                        disabled={updatingBookingId !== null}
                    />
                </div>

                <div>
                    <label>From</label>
                    <input
                        type="date"
                        name="date_from"
                        value={filters.date_from}
                        onChange={handleFilterChange}
                        disabled={updatingBookingId !== null}
                    />
                </div>

                <div>
                    <label>To</label>
                    <input
                        type="date"
                        name="date_to"
                        value={filters.date_to}
                        onChange={handleFilterChange}
                        disabled={updatingBookingId !== null}
                    />
                </div>

                <button
                    type="button"
                    className="booking-clear-button"
                    onClick={clearFilters}
                    disabled={updatingBookingId !== null}
                >
                    Clear
                </button>

            </section>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="booking-results-summary">

                <div>
                    <strong>{pagination.total || 0}</strong>
                    <span>
                        {Number(pagination.total || 0) === 1
                            ? "booking enquiry"
                            : "booking enquiries"}
                    </span>
                </div>

                {filtersApplied && (
                    <span className="active-filter-label">
                        Filters applied
                    </span>
                )}

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="admin-error-box" role="alert">
                    {error}
                </div>
            )}


            {/* ==================================================
                TABLE
            ================================================== */}

            <section className="admin-table-card">

                {loading ? (
                    <div className="admin-table-loading" aria-live="polite">
                        <div className="admin-spinner" />
                        <p>Loading booking enquiries...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="admin-empty-state">
                        <div className="admin-empty-icon">▤</div>
                        <h3>No bookings found</h3>
                        <p>
                            There are no booking enquiries matching your
                            current filters.
                        </p>

                        {filtersApplied && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="admin-empty-button"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-bookings-table">
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Tour</th>
                                    <th>Travel Date</th>
                                    <th>Guests</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bookings.map((booking) => {

                                    const bookingId = booking?.id;

                                    const bookingStatus = String(
                                        booking?.status || ""
                                    ).trim().toUpperCase();

                                    const allowedStatuses =
                                        getAllowedNextStatuses(bookingStatus);

                                    const isUpdating =
                                        String(updatingBookingId) ===
                                        String(bookingId);

                                    return (
                                        <tr key={bookingId}>
                                            <td>
                                                <div className="booking-guest">
                                                    <strong>
                                                        {booking?.full_name || "Unknown Guest"}
                                                    </strong>
                                                    {booking?.email && (
                                                        <span>{booking.email}</span>
                                                    )}
                                                    {booking?.phone && (
                                                        <small>{booking.phone}</small>
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="booking-tour">
                                                    <strong>
                                                        {booking?.tour_title || "Unknown Tour"}
                                                    </strong>
                                                    {booking?.tour_slug && (
                                                        <span>/{booking.tour_slug}</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <span className="booking-date">
                                                    {formatDate(booking?.travel_date)}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="booking-guests">
                                                    {guestLabel(booking)}
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="booking-total">
                                                    {formatMoney(
                                                        booking?.estimated_total,
                                                        booking?.currency
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={`booking-status ${statusClass(bookingStatus)}`}
                                                >
                                                    {formatStatus(bookingStatus)}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="booking-actions">

                                                    <Link
                                                        to={`/admin/bookings/${encodeURIComponent(
                                                            String(bookingId)
                                                        )}`}
                                                        className="booking-view-button"
                                                        aria-label={`View booking ${bookingId}`}
                                                    >
                                                        View
                                                    </Link>

                                                    {allowedStatuses.includes("CONFIRMED") && (
                                                        <button
                                                            type="button"
                                                            className="booking-status-action booking-confirm-button"
                                                            onClick={() =>
                                                                handleStatusChange(booking, "CONFIRMED")
                                                            }
                                                            disabled={updatingBookingId !== null}
                                                        >
                                                            {isUpdating ? "Updating..." : "Confirm"}
                                                        </button>
                                                    )}

                                                    {allowedStatuses.includes("CANCELLED") && (
                                                        <button
                                                            type="button"
                                                            className="booking-status-action booking-cancel-button"
                                                            onClick={() =>
                                                                handleStatusChange(booking, "CANCELLED")
                                                            }
                                                            disabled={updatingBookingId !== null}
                                                        >
                                                            {isUpdating ? "Updating..." : "Cancel"}
                                                        </button>
                                                    )}

                                                    {allowedStatuses.includes("COMPLETED") && (
                                                        <button
                                                            type="button"
                                                            className="booking-status-action booking-complete-button"
                                                            onClick={() =>
                                                                handleStatusChange(booking, "COMPLETED")
                                                            }
                                                            disabled={updatingBookingId !== null}
                                                        >
                                                            {isUpdating ? "Updating..." : "Complete"}
                                                        </button>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

            </section>


            {/* ==================================================
                PAGINATION
            ================================================== */}

            {!loading && bookings.length > 0 && (
                <div className="admin-pagination">

                    <button
                        type="button"
                        disabled={
                            currentPage <= 1 ||
                            updatingBookingId !== null
                        }
                        onClick={() => goToPage(currentPage - 1)}
                    >
                        ← Previous
                    </button>

                    <div className="admin-pagination-pages">
                        {paginationItems().map((item) => {

                            if (item.type === "dots") {
                                return (
                                    <span
                                        key={item.id}
                                        className="pagination-dots"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={item.number}
                                    type="button"
                                    className={
                                        item.number === currentPage ? "active" : ""
                                    }
                                    onClick={() => goToPage(item.number)}
                                    disabled={updatingBookingId !== null}
                                    aria-current={
                                        item.number === currentPage
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    {item.number}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        disabled={
                            currentPage >= totalPages ||
                            updatingBookingId !== null
                        }
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        Next →
                    </button>

                </div>
            )}

        </>
    );
}


export default AdminBookings;