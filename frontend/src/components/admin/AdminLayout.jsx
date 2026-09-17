// frontend/src/components/admin/AdminLayout.jsx
import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import adminApi from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";

import "./AdminLayout.css";


function AdminLayout() {

    const navigate = useNavigate();

    const { admin } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {

        adminApi.logout();

        navigate("/admin/login", {
            replace: true,
        });

    };


    /*
    |--------------------------------------------------------------------------
    | NAV CLASS
    |--------------------------------------------------------------------------
    */

    const navClass = ({ isActive }) =>
        isActive
            ? "admin-nav-item active"
            : "admin-nav-item";


    return (

        <div className="admin-layout">

            {/* ============================================================
                SIDEBAR
            ============================================================ */}

            <aside className="admin-sidebar">

                {/* BRAND */}
                <div className="admin-sidebar-brand">

                    <Link
                        to="/admin/dashboard"
                        className="admin-brand-link"
                    >

                        <img
                            src="https://res.cloudinary.com/djczmay2i/image/upload/v1788254388/ZAN_GATES_ADVENTURES_k59crf.jpg"
                            alt="ZAN GATES Adventures"
                            className="admin-brand-mark admin-brand-image"
                        />

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


                {/* SECTION LABEL */}
                <div className="admin-sidebar-label">
                    ADMINISTRATION
                </div>


                {/* NAVIGATION */}
                <nav className="admin-sidebar-nav">

                    <NavLink
                        to="/admin/dashboard"
                        className={navClass}
                    >
                        <span>▦</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/bookings"
                        className={navClass}
                    >
                        <span>▤</span>
                        Bookings
                    </NavLink>

                    <NavLink
                        to="/admin/tours"
                        className={navClass}
                    >
                        <span>◫</span>
                        Tours
                    </NavLink>

                    <NavLink
                        to="/admin/categories"
                        className={navClass}
                    >
                        <span>◨</span>
                        Categories
                    </NavLink>

                    <NavLink
                        to="/admin/destinations"
                        className={navClass}
                    >
                        <span>◎</span>
                        Destinations
                    </NavLink>

                </nav>


                {/* FOOTER */}
                <div className="admin-sidebar-footer">

                    <Link
                        to="/"
                        className="admin-nav-item"
                    >
                        <span>↗</span>
                        View Website
                    </Link>


                    <div className="admin-user">

                        <div className="admin-user-avatar">
                            {admin?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "A"}
                        </div>

                        <div className="admin-user-info">

                            <strong>
                                {admin?.full_name || "Administrator"}
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


            {/* ============================================================
                MAIN CONTENT
            ============================================================ */}

            <main className="admin-main">
                <Outlet />
            </main>

        </div>

    );

}


export default AdminLayout;