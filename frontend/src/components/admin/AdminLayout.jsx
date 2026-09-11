// import {
//     Link,
//     NavLink,
//     Outlet,
//     useNavigate,
// } from "react-router-dom";

// import adminApi from "../../services/adminApi";

// import "./AdminLayout.css";


// function AdminLayout() {

//     const navigate = useNavigate();


//     /*
//     |--------------------------------------------------------------------------
//     | LOGOUT
//     |--------------------------------------------------------------------------
//     */

//     const handleLogout = () => {

//         adminApi.logout();

//         navigate(
//             "/admin/login",
//             {
//                 replace: true,
//             }
//         );

//     };


//     /*
//     |--------------------------------------------------------------------------
//     | NAVIGATION CLASS
//     |--------------------------------------------------------------------------
//     */

//     const navClass = ({
//         isActive,
//     }) => {

//         return isActive
//             ? "admin-nav-link active"
//             : "admin-nav-link";

//     };


//     return (

//         <div className="admin-app">


//             {/* ================================================================
//                 SIDEBAR
//             ================================================================= */}

//             <aside className="admin-sidebar">


//                 {/* ============================================================
//                     BRAND
//                 ============================================================= */}

//                 <div className="admin-brand">

//                     <Link
//                         to="/admin/dashboard"
//                         className="admin-brand-link"
//                     >

//                         <div className="admin-logo">
//                             ZG
//                         </div>


//                         <div className="admin-brand-text">

//                             <strong>
//                                 ZAN GATES
//                             </strong>

//                             <span>
//                                 ADVENTURES
//                             </span>

//                         </div>

//                     </Link>

//                 </div>


//                 {/* ============================================================
//                     NAVIGATION
//                 ============================================================= */}

//                 <nav className="admin-sidebar-nav">


//                     <NavLink
//                         to="/admin/dashboard"
//                         className={navClass}
//                     >

//                         <svg
//                             viewBox="0 0 24 24"
//                             aria-hidden="true"
//                         >

//                             <rect
//                                 x="3"
//                                 y="3"
//                                 width="7"
//                                 height="7"
//                                 rx="1"
//                             />

//                             <rect
//                                 x="14"
//                                 y="3"
//                                 width="7"
//                                 height="7"
//                                 rx="1"
//                             />

//                             <rect
//                                 x="3"
//                                 y="14"
//                                 width="7"
//                                 height="7"
//                                 rx="1"
//                             />

//                             <rect
//                                 x="14"
//                                 y="14"
//                                 width="7"
//                                 height="7"
//                                 rx="1"
//                             />

//                         </svg>

//                         <span>
//                             Dashboard
//                         </span>

//                     </NavLink>


//                     <NavLink
//                         to="/admin/bookings"
//                         className={navClass}
//                     >

//                         <svg
//                             viewBox="0 0 24 24"
//                             aria-hidden="true"
//                         >

//                             <rect
//                                 x="3"
//                                 y="4"
//                                 width="18"
//                                 height="17"
//                                 rx="2"
//                             />

//                             <line
//                                 x1="7"
//                                 y1="2"
//                                 x2="7"
//                                 y2="6"
//                             />

//                             <line
//                                 x1="17"
//                                 y1="2"
//                                 x2="17"
//                                 y2="6"
//                             />

//                             <line
//                                 x1="3"
//                                 y1="9"
//                                 x2="21"
//                                 y2="9"
//                             />

//                             <line
//                                 x1="8"
//                                 y1="13"
//                                 x2="16"
//                                 y2="13"
//                             />

//                             <line
//                                 x1="8"
//                                 y1="17"
//                                 x2="14"
//                                 y2="17"
//                             />

//                         </svg>

//                         <span>
//                             Bookings
//                         </span>

//                     </NavLink>


//                     <NavLink
//                         to="/admin/tours"
//                         className={navClass}
//                     >

//                         <svg
//                             viewBox="0 0 24 24"
//                             aria-hidden="true"
//                         >

//                             <path
//                                 d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"
//                             />

//                             <path
//                                 d="M4 5.5v15"
//                             />

//                             <path
//                                 d="M8 7h8"
//                             />

//                             <path
//                                 d="M8 11h7"
//                             />

//                         </svg>

//                         <span>
//                             Tour Management
//                         </span>

//                     </NavLink>


//                 </nav>


//                 {/* ============================================================
//                     SIDEBAR FOOTER
//                 ============================================================= */}

//                 <div className="admin-sidebar-footer">


//                     <Link
//                         to="/"
//                         className="admin-view-website"
//                     >

//                         <svg
//                             viewBox="0 0 24 24"
//                             aria-hidden="true"
//                         >

//                             <path
//                                 d="M14 3h7v7"
//                             />

//                             <path
//                                 d="M10 14 21 3"
//                             />

//                             <path
//                                 d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
//                             />

//                         </svg>

//                         <span>
//                             View Website
//                         </span>

//                     </Link>


//                     <div className="admin-user">


//                         <div className="admin-user-avatar">
//                             S
//                         </div>


//                         <div className="admin-user-info">

//                             <strong>
//                                 System Administrator
//                             </strong>

//                             <span>
//                                 Administrator
//                             </span>

//                         </div>


//                     </div>


//                     <button
//                         type="button"
//                         className="admin-signout"
//                         onClick={handleLogout}
//                     >

//                         <svg
//                             viewBox="0 0 24 24"
//                             aria-hidden="true"
//                         >

//                             <path
//                                 d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
//                             />

//                             <path
//                                 d="M16 17l5-5-5-5"
//                             />

//                             <path
//                                 d="M21 12H9"
//                             />

//                         </svg>

//                         <span>
//                             Sign Out
//                         </span>

//                     </button>


//                 </div>


//             </aside>


//             {/* ================================================================
//                 MAIN CONTENT
//             ================================================================= */}

//             <main className="admin-main-content">

//                 <Outlet />

//             </main>


//         </div>

//     );

// }


// export default AdminLayout;