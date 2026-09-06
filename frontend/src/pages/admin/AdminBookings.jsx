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
    |
    | The refresh state is intentionally NOT included in this callback's
    | dependency list. This prevents refresh from causing unnecessary
    | repeated API requests.
    |
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
                |
                | Expected backend structure:
                |
                | {
                |     bookings: [...],
                |     pagination: {...}
                | }
                |
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

                    /*
                    |--------------------------------------------------------------------------
                    | Fallback pagination
                    |--------------------------------------------------------------------------
                    */

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


        /*
        |--------------------------------------------------------------------------
        | Always return to first page when filtering.
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | Small number of pages
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | First page
        |--------------------------------------------------------------------------
        */

        items.push({
            type: "page",
            number: 1,
        });


        /*
        |--------------------------------------------------------------------------
        | Left ellipsis
        |--------------------------------------------------------------------------
        */

        if (
            currentPage > 3
        ) {

            items.push({
                type: "dots",
                id: "left-dots",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | Pages around current page
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | Right ellipsis
        |--------------------------------------------------------------------------
        */

        if (
            currentPage <
            totalPages - 2
        ) {

            items.push({
                type: "dots",
                id: "right-dots",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | Last page
        |--------------------------------------------------------------------------
        */

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


                {/* ======================================================
                    BRAND
                ====================================================== */}

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


                {/* ======================================================
                    SIDEBAR LABEL
                ====================================================== */}

                <div className="admin-sidebar-label">
                    ADMINISTRATION
                </div>


                {/* ======================================================
                    NAVIGATION
                ====================================================== */}

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


                </nav>


                {/* ======================================================
                    SIDEBAR BOTTOM
                ====================================================== */}

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


                    {/* ==================================================
                        ADMIN USER
                    ================================================== */}

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


                    {/* ==================================================
                        SIGN OUT
                    ================================================== */}

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


                {/* ======================================================
                    TOP BAR
                ====================================================== */}

                <header className="admin-topbar">

                    <div>

                        <div className="admin-mobile-brand">

                            <span>
                                ZG
                            </span>

                        </div>

                    </div>


                    <Link
                        to="/"
                        className="admin-topbar-website"
                    >
                        View Website ↗
                    </Link>

                </header>


                {/* ======================================================
                    CONTENT
                ====================================================== */}

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
                            disabled={refreshing}
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


                        {/* ==================================================
                            SEARCH
                        ================================================== */}

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
                            />

                        </div>


                        {/* ==================================================
                            STATUS
                        ================================================== */}

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


                        {/* ==================================================
                            EXACT TRAVEL DATE
                        ================================================== */}

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
                            />

                        </div>


                        {/* ==================================================
                            DATE FROM
                        ================================================== */}

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
                            />

                        </div>


                        {/* ==================================================
                            DATE TO
                        ================================================== */}

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
                            />

                        </div>


                        {/* ==================================================
                            CLEAR
                        ================================================== */}

                        <button
                            type="button"
                            className="booking-clear-button"
                            onClick={
                                clearFilters
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


                        {/* ==================================================
                            LOADING
                        ================================================== */}

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


                            /* ==================================================
                                EMPTY
                            ================================================== */

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


                            /* ==================================================
                                BOOKINGS TABLE
                            ================================================== */

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
                                                                        booking?.status
                                                                    )}`
                                                                }
                                                            >

                                                                {
                                                                    formatStatus(
                                                                        booking?.status
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ==============================================
                                                            ACTION
                                                        ============================================== */}

                                                        <td>

                                                            <Link
                                                                to={
                                                                    `/admin/bookings/${encodeURIComponent(
                                                                        String(
                                                                            bookingId
                                                                        )
                                                                    )}`
                                                                }
                                                                className="booking-view-button"
                                                            >
                                                                View
                                                            </Link>

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


                                {/* ==================================================
                                    PREVIOUS
                                ================================================== */}

                                <button
                                    type="button"
                                    disabled={
                                        currentPage <= 1
                                    }
                                    onClick={() =>
                                        goToPage(
                                            currentPage - 1
                                        )
                                    }
                                >
                                    ← Previous
                                </button>


                                {/* ==================================================
                                    PAGE NUMBERS
                                ================================================== */}

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


                                {/* ==================================================
                                    NEXT
                                ================================================== */}

                                <button
                                    type="button"
                                    disabled={
                                        currentPage >=
                                        totalPages
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