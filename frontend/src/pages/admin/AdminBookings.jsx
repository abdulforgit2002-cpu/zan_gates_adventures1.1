import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import adminApi from "../../services/adminApi";

import {
    useAuth,
} from "../../context/AuthContext";


function AdminBookings() {

    const {
        admin,
        logout,
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | BOOKINGS STATE
    |--------------------------------------------------------------------------
    */

    const [
        bookings,
        setBookings,
    ] = useState([]);


    /*
    |--------------------------------------------------------------------------
    | UI STATE
    |--------------------------------------------------------------------------
    */

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
    | STATUS UPDATE STATE
    |--------------------------------------------------------------------------
    |
    | Stores the booking ID currently being updated.
    |
    | This prevents:
    |
    | - double clicking
    | - duplicate requests
    | - changing multiple bookings simultaneously
    |
    */

    const [
        updatingBookingId,
        setUpdatingBookingId,
    ] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const [
        page,
        setPage,
    ] = useState(1);


    const perPage = 10;


    const [
        pagination,
        setPagination,
    ] = useState({
        total: 0,
        page: 1,
        per_page: perPage,
        total_pages: 1,
    });


    /*
    |--------------------------------------------------------------------------
    | FILTERS
    |--------------------------------------------------------------------------
    */

    const [
        filters,
        setFilters,
    ] = useState({
        search: "",
        status: "",
        travel_date: "",
        date_from: "",
        date_to: "",
    });


    /*
    |--------------------------------------------------------------------------
    | LOAD BOOKINGS
    |--------------------------------------------------------------------------
    */

    const loadBookings = useCallback(
        async ({
            showLoading = true,
        } = {}) => {

            try {

                setError("");


                if (showLoading) {
                    setLoading(true);
                }


                const params =
                    new URLSearchParams();


                /*
                |--------------------------------------------------------------------------
                | PAGINATION
                |--------------------------------------------------------------------------
                */

                params.set(
                    "page",
                    String(page)
                );


                params.set(
                    "per_page",
                    String(perPage)
                );


                /*
                |--------------------------------------------------------------------------
                | SEARCH
                |--------------------------------------------------------------------------
                */

                const search =
                    filters.search.trim();


                if (search !== "") {

                    params.set(
                        "search",
                        search
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | STATUS
                |--------------------------------------------------------------------------
                */

                if (filters.status !== "") {

                    params.set(
                        "status",
                        filters.status
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | EXACT TRAVEL DATE
                |--------------------------------------------------------------------------
                */

                if (
                    filters.travel_date !== ""
                ) {

                    params.set(
                        "travel_date",
                        filters.travel_date
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | DATE FROM
                |--------------------------------------------------------------------------
                */

                if (
                    filters.date_from !== ""
                ) {

                    params.set(
                        "date_from",
                        filters.date_from
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | DATE TO
                |--------------------------------------------------------------------------
                */

                if (
                    filters.date_to !== ""
                ) {

                    params.set(
                        "date_to",
                        filters.date_to
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | API REQUEST
                |--------------------------------------------------------------------------
                */

                const response =
                    await adminApi.bookings(
                        `?${params.toString()}`
                    );


                const data =
                    response?.data || {};


                /*
                |--------------------------------------------------------------------------
                | BOOKINGS
                |--------------------------------------------------------------------------
                */

                let bookingRows = [];


                if (
                    Array.isArray(
                        data.bookings
                    )
                ) {

                    bookingRows =
                        data.bookings;

                } else if (
                    Array.isArray(
                        data.data
                    )
                ) {

                    bookingRows =
                        data.data;

                }


                setBookings(
                    bookingRows
                );


                /*
                |--------------------------------------------------------------------------
                | PAGINATION
                |--------------------------------------------------------------------------
                */

                if (
                    data.pagination &&
                    typeof data.pagination === "object"
                ) {

                    const serverPagination =
                        data.pagination;


                    setPagination({
                        total:
                            Number(
                                serverPagination.total ||
                                0
                            ),

                        page:
                            Number(
                                serverPagination.page ||
                                page
                            ),

                        per_page:
                            Number(
                                serverPagination.per_page ||
                                perPage
                            ),

                        total_pages:
                            Math.max(
                                Number(
                                    serverPagination.total_pages ||
                                    1
                                ),
                                1
                            ),
                    });

                } else {

                    const total =
                        bookingRows.length;


                    setPagination({
                        total,
                        page,
                        per_page: perPage,
                        total_pages:
                            Math.max(
                                Math.ceil(
                                    total / perPage
                                ),
                                1
                            ),
                    });

                }

            } catch (err) {

                console.error(
                    "Failed to load bookings:",
                    err
                );


                /*
                |--------------------------------------------------------------------------
                | AUTHENTICATION EXPIRED
                |--------------------------------------------------------------------------
                */

                if (
                    err?.code ===
                        "AUTH_EXPIRED" ||
                    err?.code ===
                        "AUTH_REQUIRED"
                ) {

                    logout();

                    return;
                }


                /*
                |--------------------------------------------------------------------------
                | FORBIDDEN
                |--------------------------------------------------------------------------
                */

                if (
                    err?.code ===
                    "FORBIDDEN"
                ) {

                    setError(
                        "You do not have permission to manage bookings."
                    );

                    return;
                }


                /*
                |--------------------------------------------------------------------------
                | GENERAL ERROR
                |--------------------------------------------------------------------------
                */

                setError(
                    err?.message ||
                    "Unable to load booking enquiries."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        [
            page,
            filters,
            logout,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INITIAL / FILTER / PAGINATION LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadBookings({
            showLoading: true,
        });

    }, [
        loadBookings,
    ]);


    /*
    |--------------------------------------------------------------------------
    | FILTER HANDLING
    |--------------------------------------------------------------------------
    */

    const handleFilterChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setPage(1);


        setFilters(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

    };


    /*
    |--------------------------------------------------------------------------
    | CLEAR FILTERS
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */

    const handleRefresh = async () => {

        if (refreshing) {
            return;
        }


        setRefreshing(true);


        await loadBookings({
            showLoading: false,
        });

    };


    /*
    |--------------------------------------------------------------------------
    | STATUS CLASS
    |--------------------------------------------------------------------------
    */

    const statusClass = (
        status
    ) => {

        const normalizedStatus =
            String(
                status || ""
            )
                .trim()
                .toUpperCase();


        switch (
            normalizedStatus
        ) {

            case "CONFIRMED":

                return "status-confirmed";


            case "CANCELLED":

                return "status-cancelled";


            case "COMPLETED":

                return "status-completed";


            case "PENDING":

            default:

                return "status-pending";

        }

    };


    /*
    |--------------------------------------------------------------------------
    | FORMAT STATUS LABEL
    |--------------------------------------------------------------------------
    */

    const formatStatus = (
        status
    ) => {

        const normalized =
            String(
                status || ""
            )
                .trim()
                .toLowerCase();


        if (!normalized) {
            return "Unknown";
        }


        return (
            normalized.charAt(0).toUpperCase() +
            normalized.slice(1)
        );

    };


    /*
    |--------------------------------------------------------------------------
    | FORMAT MONEY
    |--------------------------------------------------------------------------
    */

    const formatMoney = (
        amount,
        currency = "USD"
    ) => {

        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {

            return "—";
        }


        const numericAmount =
            Number(amount);


        if (
            Number.isNaN(
                numericAmount
            )
        ) {

            return "—";
        }


        const normalizedCurrency =
            String(
                currency || "USD"
            )
                .trim()
                .toUpperCase();


        const symbol =
            normalizedCurrency === "USD"
                ? "$"
                : `${normalizedCurrency} `;


        return (
            `${symbol}` +
            numericAmount.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "—";
        }


        const parsedDate =
            new Date(
                `${date}T00:00:00`
            );


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return date;
        }


        return parsedDate.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | GUEST COUNT
    |--------------------------------------------------------------------------
    */

    const guestLabel = (
        booking
    ) => {

        const adults =
            Number(
                booking?.adults || 0
            );


        const children =
            Number(
                booking?.children || 0
            );


        const adultText =
            `${adults} ${
                adults === 1
                    ? "adult"
                    : "adults"
            }`;


        if (
            children === 0
        ) {

            return adultText;
        }


        const childText =
            `${children} ${
                children === 1
                    ? "child"
                    : "children"
            }`;


        return (
            `${adultText} + ${childText}`
        );

    };


    /*
    |--------------------------------------------------------------------------
    | STATUS TRANSITIONS
    |--------------------------------------------------------------------------
    |
    | This mirrors the backend AdminBookingController.
    |
    */

    const getAllowedNextStatuses = (
        status
    ) => {

        const normalized =
            String(
                status || ""
            )
                .trim()
                .toUpperCase();


        switch (normalized) {

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
            case "COMPLETED":
            default:

                return [];

        }

    };


    /*
    |--------------------------------------------------------------------------
    | STATUS ACTION LABEL
    |--------------------------------------------------------------------------
    */

    const statusActionLabel = (
        status
    ) => {

        switch (
            String(
                status || ""
            )
                .trim()
                .toUpperCase()
        ) {

            case "CONFIRMED":

                return "Confirm";


            case "CANCELLED":

                return "Cancel";


            case "COMPLETED":

                return "Complete";


            default:

                return formatStatus(
                    status
                );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKING STATUS
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = async (
        booking,
        requestedStatus
    ) => {

        const bookingId =
            booking?.id;


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
            String(
                booking?.status || ""
            )
                .trim()
                .toUpperCase();


        const nextStatus =
            String(
                requestedStatus || ""
            )
                .trim()
                .toUpperCase();


        /*
        |--------------------------------------------------------------------------
        | Defensive transition validation
        |--------------------------------------------------------------------------
        */

        const allowedStatuses =
            getAllowedNextStatuses(
                currentStatus
            );


        if (
            !allowedStatuses.includes(
                nextStatus
            )
        ) {

            setError(
                `Invalid booking status transition: ${currentStatus || "UNKNOWN"} → ${nextStatus}.`
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate requests
        |--------------------------------------------------------------------------
        */

        if (
            updatingBookingId !== null
        ) {

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Confirmation
        |--------------------------------------------------------------------------
        */

        const guestName =
            booking?.full_name ||
            "this guest";


        const actionLabel =
            statusActionLabel(
                nextStatus
            );


        let confirmationMessage =
            `Are you sure you want to ${actionLabel.toLowerCase()} this booking for ${guestName}?`;


        if (
            nextStatus === "CANCELLED"
        ) {

            confirmationMessage =
                `Are you sure you want to cancel this booking for ${guestName}? This action cannot be undone.`;

        } else if (
            nextStatus === "COMPLETED"
        ) {

            confirmationMessage =
                `Are you sure you want to mark this booking for ${guestName} as completed? This action cannot be undone.`;

        } else if (
            nextStatus === "CONFIRMED"
        ) {

            confirmationMessage =
                `Are you sure you want to confirm this booking for ${guestName}?`;

        }


        const confirmed =
            window.confirm(
                confirmationMessage
            );


        if (!confirmed) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        setError("");


        setUpdatingBookingId(
            bookingId
        );


        try {

            await adminApi.updateBookingStatus(
                bookingId,
                nextStatus
            );


            /*
            |--------------------------------------------------------------------------
            | Update local booking immediately
            |--------------------------------------------------------------------------
            */

            setBookings(
                (previousBookings) =>
                    previousBookings.map(
                        (currentBooking) => {

                            if (
                                String(
                                    currentBooking?.id
                                ) !==
                                String(
                                    bookingId
                                )
                            ) {

                                return currentBooking;
                            }


                            return {
                                ...currentBooking,
                                status:
                                    nextStatus,
                            };

                        }
                    )
            );


            /*
            |--------------------------------------------------------------------------
            | Reload from server
            |--------------------------------------------------------------------------
            |
            | This ensures the UI is synchronized
            | with the authoritative backend state.
            |
            */

            await loadBookings({
                showLoading: false,
            });

        } catch (err) {

            console.error(
                "Failed to update booking status:",
                err
            );


            /*
            |--------------------------------------------------------------------------
            | AUTHENTICATION
            |--------------------------------------------------------------------------
            */

            if (
                err?.code ===
                    "AUTH_EXPIRED" ||
                err?.code ===
                    "AUTH_REQUIRED"
            ) {

                logout();

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | FORBIDDEN
            |--------------------------------------------------------------------------
            */

            if (
                err?.code ===
                "FORBIDDEN"
            ) {

                setError(
                    "You do not have permission to update booking statuses."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | BACKEND TRANSITION CONFLICT
            |--------------------------------------------------------------------------
            */

            if (
                err?.status === 409
            ) {

                const backendMessage =
                    err?.response?.message ||
                    err?.message ||
                    "The booking status could not be changed because the booking has already changed.";


                setError(
                    backendMessage
                );


                /*
                |--------------------------------------------------------------------------
                | Refresh after a conflict.
                |--------------------------------------------------------------------------
                |
                | Another administrator may have changed
                | the booking between page load and update.
                |
                */

                await loadBookings({
                    showLoading: false,
                });


                return;
            }


            /*
            |--------------------------------------------------------------------------
            | GENERAL ERROR
            |--------------------------------------------------------------------------
            */

            setError(
                err?.message ||
                "Unable to update the booking status. Please try again."
            );

        } finally {

            setUpdatingBookingId(
                null
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {

        logout();

    };


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const totalPages =
        Math.max(
            Number(
                pagination.total_pages || 1
            ),
            1
        );


    const currentPage =
        Math.min(
            Math.max(
                Number(
                    pagination.page || page
                ),
                1
            ),
            totalPages
        );


    const goToPage = (
        nextPage
    ) => {

        const targetPage =
            Number(nextPage);


        if (
            Number.isNaN(
                targetPage
            )
        ) {

            return;
        }


        if (
            targetPage < 1 ||
            targetPage > totalPages
        ) {

            return;
        }


        if (
            targetPage === page
        ) {

            return;
        }


        setPage(
            targetPage
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };


    /*
    |--------------------------------------------------------------------------
    | PAGINATION NUMBERS
    |--------------------------------------------------------------------------
    */

    const paginationItems = () => {

        const items = [];


        if (
            totalPages <= 7
        ) {

            for (
                let number = 1;
                number <= totalPages;
                number++
            ) {

                items.push({
                    type: "page",
                    number,
                });

            }


            return items;
        }


        items.push({
            type: "page",
            number: 1,
        });


        if (
            currentPage > 3
        ) {

            items.push({
                type: "dots",
                id: "left-dots",
            });

        }


        const start =
            Math.max(
                2,
                currentPage - 1
            );


        const end =
            Math.min(
                totalPages - 1,
                currentPage + 1
            );


        for (
            let number = start;
            number <= end;
            number++
        ) {

            items.push({
                type: "page",
                number,
            });

        }


        if (
            currentPage <
            totalPages - 2
        ) {

            items.push({
                type: "dots",
                id: "right-dots",
            });

        }


        items.push({
            type: "page",
            number: totalPages,
        });


        return items;

    };


    /*
    |--------------------------------------------------------------------------
    | FILTER STATE
    |--------------------------------------------------------------------------
    */

    const filtersApplied =
        Boolean(
            filters.search ||
            filters.status ||
            filters.travel_date ||
            filters.date_from ||
            filters.date_to
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="admin-layout">


            {/* ==========================================================
                SIDEBAR
            ========================================================== */}

            <aside className="admin-sidebar">


                <div className="admin-brand">

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
                        className="admin-nav-item active"
                    >

                        <span className="admin-nav-icon">
                            ▤
                        </span>

                        Bookings

                    </Link>


                    <Link
                        to="/admin/tours"
                        className="admin-nav-item"
                    >

                        <span className="admin-nav-icon">
                            ◫
                        </span>

                        Tours

                    </Link>


                </nav>


                <div className="admin-sidebar-bottom">

                    <Link
                        to="/"
                        className="admin-nav-item"
                    >

                        <span className="admin-nav-icon">
                            ↗
                        </span>

                        View Website

                    </Link>

                </div>


                <div className="admin-sidebar-footer">

                    <div className="admin-user">


                        <div className="admin-avatar">

                            {
                                admin?.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                "A"
                            }

                        </div>


                        <div className="admin-user-info">

                            <strong>
                                {
                                    admin?.full_name ||
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
                        className="admin-signout"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>


                </div>

            </aside>


            {/* ==========================================================
                MAIN
            ========================================================== */}

            <main className="admin-main">


                <header className="admin-topbar">

                    <div>

                        <div className="admin-mobile-brand">

                            <span>
                                ZG
                            </span>

                        </div>

                    </div>


                </header>


                <section className="admin-content">


                    {/* ==================================================
                        PAGE HEADER
                    ================================================== */}

                    <div className="admin-page-heading">


                        <div>

                            <span className="admin-eyebrow">
                                ADMINISTRATION
                            </span>


                            <h1>
                                Booking Enquiries
                            </h1>


                            <p>
                                Manage guest enquiries,
                                travel dates and booking
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

                            {refreshing
                                ? "Refreshing..."
                                : "↻ Refresh"}

                        </button>


                    </div>


                    {/* ==================================================
                        FILTERS
                    ================================================== */}

                    <section className="booking-filters">


                        <div className="booking-filter-search">

                            <label>
                                Search
                            </label>


                            <input
                                type="search"
                                name="search"
                                value={
                                    filters.search
                                }
                                onChange={
                                    handleFilterChange
                                }
                                placeholder="Guest, email or phone..."
                                autoComplete="off"
                                disabled={
                                    updatingBookingId !== null
                                }
                            />

                        </div>


                        <div>

                            <label>
                                Status
                            </label>


                            <select
                                name="status"
                                value={
                                    filters.status
                                }
                                onChange={
                                    handleFilterChange
                                }
                                disabled={
                                    updatingBookingId !== null
                                }
                            >

                                <option value="">
                                    All statuses
                                </option>


                                <option value="PENDING">
                                    Pending
                                </option>


                                <option value="CONFIRMED">
                                    Confirmed
                                </option>


                                <option value="CANCELLED">
                                    Cancelled
                                </option>


                                <option value="COMPLETED">
                                    Completed
                                </option>

                            </select>

                        </div>


                        <div>

                            <label>
                                Travel Date
                            </label>


                            <input
                                type="date"
                                name="travel_date"
                                value={
                                    filters.travel_date
                                }
                                onChange={
                                    handleFilterChange
                                }
                                disabled={
                                    updatingBookingId !== null
                                }
                            />

                        </div>


                        <div>

                            <label>
                                From
                            </label>


                            <input
                                type="date"
                                name="date_from"
                                value={
                                    filters.date_from
                                }
                                onChange={
                                    handleFilterChange
                                }
                                disabled={
                                    updatingBookingId !== null
                                }
                            />

                        </div>


                        <div>

                            <label>
                                To
                            </label>


                            <input
                                type="date"
                                name="date_to"
                                value={
                                    filters.date_to
                                }
                                onChange={
                                    handleFilterChange
                                }
                                disabled={
                                    updatingBookingId !== null
                                }
                            />

                        </div>


                        <button
                            type="button"
                            className="booking-clear-button"
                            onClick={
                                clearFilters
                            }
                            disabled={
                                updatingBookingId !== null
                            }
                        >
                            Clear
                        </button>


                    </section>


                    {/* ==================================================
                        RESULT SUMMARY
                    ================================================== */}

                    <div className="booking-results-summary">


                        <div>

                            <strong>
                                {
                                    pagination.total || 0
                                }
                            </strong>


                            <span>
                                {
                                    Number(
                                        pagination.total || 0
                                    ) === 1
                                        ? "booking enquiry"
                                        : "booking enquiries"
                                }
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

                        <div
                            className="admin-error-box"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* ==================================================
                        TABLE
                    ================================================== */}

                    <section className="admin-table-card">


                        {loading ? (

                            <div
                                className="admin-table-loading"
                                aria-live="polite"
                            >

                                <div
                                    className="admin-spinner"
                                ></div>


                                <p>
                                    Loading booking enquiries...
                                </p>

                            </div>


                        ) : bookings.length === 0 ? (


                            <div className="admin-empty-state">


                                <div className="admin-empty-icon">
                                    ▤
                                </div>


                                <h3>
                                    No bookings found
                                </h3>


                                <p>
                                    There are no booking
                                    enquiries matching
                                    your current filters.
                                </p>


                                {filtersApplied && (

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
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


                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>


                                        {bookings.map(
                                            (booking) => {

                                                const bookingId =
                                                    booking?.id;


                                                const bookingStatus =
                                                    String(
                                                        booking?.status ||
                                                        ""
                                                    )
                                                        .trim()
                                                        .toUpperCase();


                                                const allowedStatuses =
                                                    getAllowedNextStatuses(
                                                        bookingStatus
                                                    );


                                                const isUpdating =
                                                    String(
                                                        updatingBookingId
                                                    ) ===
                                                    String(
                                                        bookingId
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            bookingId
                                                        }
                                                    >


                                                        {/* ==============================================
                                                            GUEST
                                                        ============================================== */}

                                                        <td>

                                                            <div className="booking-guest">


                                                                <strong>
                                                                    {
                                                                        booking?.full_name ||
                                                                        "Unknown Guest"
                                                                    }
                                                                </strong>


                                                                {booking?.email && (

                                                                    <span>
                                                                        {
                                                                            booking.email
                                                                        }
                                                                    </span>

                                                                )}


                                                                {booking?.phone && (

                                                                    <small>
                                                                        {
                                                                            booking.phone
                                                                        }
                                                                    </small>

                                                                )}

                                                            </div>

                                                        </td>


                                                        {/* ==============================================
                                                            TOUR
                                                        ============================================== */}

                                                        <td>

                                                            <div className="booking-tour">


                                                                <strong>
                                                                    {
                                                                        booking?.tour_title ||
                                                                        "Unknown Tour"
                                                                    }
                                                                </strong>


                                                                {booking?.tour_slug && (

                                                                    <span>
                                                                        /
                                                                        {
                                                                            booking.tour_slug
                                                                        }
                                                                    </span>

                                                                )}

                                                            </div>

                                                        </td>


                                                        {/* ==============================================
                                                            DATE
                                                        ============================================== */}

                                                        <td>

                                                            <span className="booking-date">

                                                                {
                                                                    formatDate(
                                                                        booking?.travel_date
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ==============================================
                                                            GUESTS
                                                        ============================================== */}

                                                        <td>

                                                            <span className="booking-guests">

                                                                {
                                                                    guestLabel(
                                                                        booking
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ==============================================
                                                            TOTAL
                                                        ============================================== */}

                                                        <td>

                                                            <strong className="booking-total">

                                                                {
                                                                    formatMoney(
                                                                        booking?.estimated_total,
                                                                        booking?.currency
                                                                    )
                                                                }

                                                            </strong>

                                                        </td>


                                                        {/* ==============================================
                                                            STATUS
                                                        ============================================== */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    `booking-status ${statusClass(
                                                                        bookingStatus
                                                                    )}`
                                                                }
                                                            >

                                                                {
                                                                    formatStatus(
                                                                        bookingStatus
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ==============================================
                                                            ACTIONS
                                                        ============================================== */}

                                                        <td>

                                                            <div className="booking-actions">


                                                                <Link
                                                                    to={
                                                                        `/admin/bookings/${encodeURIComponent(
                                                                            String(
                                                                                bookingId
                                                                            )
                                                                        )}`
                                                                    }
                                                                    className="booking-view-button"
                                                                    aria-label={
                                                                        `View booking ${bookingId}`
                                                                    }
                                                                >
                                                                    View
                                                                </Link>


                                                                {/* ==========================================
                                                                    PENDING ACTIONS
                                                                ========================================== */}

                                                                {allowedStatuses.includes(
                                                                    "CONFIRMED"
                                                                ) && (

                                                                    <button
                                                                        type="button"
                                                                        className="booking-status-action booking-confirm-button"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                booking,
                                                                                "CONFIRMED"
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            updatingBookingId !== null
                                                                        }
                                                                    >

                                                                        {
                                                                            isUpdating
                                                                                ? "Updating..."
                                                                                : "Confirm"
                                                                        }

                                                                    </button>

                                                                )}


                                                                {allowedStatuses.includes(
                                                                    "CANCELLED"
                                                                ) && (

                                                                    <button
                                                                        type="button"
                                                                        className="booking-status-action booking-cancel-button"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                booking,
                                                                                "CANCELLED"
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            updatingBookingId !== null
                                                                        }
                                                                    >

                                                                        {
                                                                            isUpdating
                                                                                ? "Updating..."
                                                                                : "Cancel"
                                                                        }

                                                                    </button>

                                                                )}


                                                                {/* ==========================================
                                                                    CONFIRMED → COMPLETED
                                                                ========================================== */}

                                                                {allowedStatuses.includes(
                                                                    "COMPLETED"
                                                                ) && (

                                                                    <button
                                                                        type="button"
                                                                        className="booking-status-action booking-complete-button"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                booking,
                                                                                "COMPLETED"
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            updatingBookingId !== null
                                                                        }
                                                                    >

                                                                        {
                                                                            isUpdating
                                                                                ? "Updating..."
                                                                                : "Complete"
                                                                        }

                                                                    </button>

                                                                )}

                                                            </div>

                                                        </td>


                                                    </tr>

                                                );

                                            }
                                        )}

                                    </tbody>


                                </table>

                            </div>

                        )}

                    </section>


                    {/* ==================================================
                        PAGINATION
                    ================================================== */}

                    {!loading &&
                        bookings.length > 0 && (

                            <div className="admin-pagination">


                                <button
                                    type="button"
                                    disabled={
                                        currentPage <= 1 ||
                                        updatingBookingId !== null
                                    }
                                    onClick={() =>
                                        goToPage(
                                            currentPage - 1
                                        )
                                    }
                                >
                                    ← Previous
                                </button>


                                <div className="admin-pagination-pages">


                                    {paginationItems().map(
                                        (item) => {


                                            if (
                                                item.type ===
                                                "dots"
                                            ) {

                                                return (

                                                    <span
                                                        key={
                                                            item.id
                                                        }
                                                        className="pagination-dots"
                                                    >
                                                        ...
                                                    </span>

                                                );

                                            }


                                            return (

                                                <button
                                                    key={
                                                        item.number
                                                    }
                                                    type="button"
                                                    className={
                                                        item.number ===
                                                        currentPage
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        goToPage(
                                                            item.number
                                                        )
                                                    }
                                                    disabled={
                                                        updatingBookingId !== null
                                                    }
                                                    aria-current={
                                                        item.number ===
                                                        currentPage
                                                            ? "page"
                                                            : undefined
                                                    }
                                                >
                                                    {
                                                        item.number
                                                    }
                                                </button>

                                            );

                                        }
                                    )}

                                </div>


                                <button
                                    type="button"
                                    disabled={
                                        currentPage >=
                                            totalPages ||
                                        updatingBookingId !== null
                                    }
                                    onClick={() =>
                                        goToPage(
                                            currentPage + 1
                                        )
                                    }
                                >
                                    Next →
                                </button>


                            </div>

                        )}


                </section>

            </main>

        </div>
    );
}


export default AdminBookings;