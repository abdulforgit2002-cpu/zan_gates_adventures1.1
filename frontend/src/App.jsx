import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";


/*
|--------------------------------------------------------------------------
| PUBLIC PAGES
|--------------------------------------------------------------------------
*/

import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";


/*
|--------------------------------------------------------------------------
| PUBLIC LAYOUT
|--------------------------------------------------------------------------
*/

import PublicLayout from "./components/PublicLayout";


/*
|--------------------------------------------------------------------------
| ADMIN PAGES
|--------------------------------------------------------------------------
*/

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetails from "./pages/admin/AdminBookingDetails";
import AdminTours from "./pages/admin/AdminTours";
import AdminTourForm from "./pages/admin/AdminTourForm";


/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
*/

import ProtectedRoute from "./components/admin/ProtectedRoute";

import {
    AuthProvider,
} from "./context/AuthContext";


function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>


                    {/* =====================================================
                        PUBLIC WEBSITE
                        SHARED NAVBAR
                    ===================================================== */}

                    <Route
                        element={
                            <PublicLayout />
                        }
                    >


                        {/* -------------------------------------------------
                            HOME
                            /
                        ------------------------------------------------- */}

                        <Route
                            path="/"
                            element={
                                <Home />
                            }
                        />


                        {/* -------------------------------------------------
                            TOURS
                            /tours
                        ------------------------------------------------- */}

                        <Route
                            path="/tours"
                            element={
                                <Tours />
                            }
                        />


                        {/* -------------------------------------------------
                            TOUR DETAILS
                            /tours/:slug
                        ------------------------------------------------- */}

                        <Route
                            path="/tours/:slug"
                            element={
                                <TourDetails />
                            }
                        />


                        {/* -------------------------------------------------
                            ABOUT
                            /about
                        ------------------------------------------------- */}

                        <Route
                            path="/about"
                            element={
                                <About />
                            }
                        />


                        {/* -------------------------------------------------
                            CONTACT
                            /contact
                        ------------------------------------------------- */}

                        <Route
                            path="/contact"
                            element={
                                <Contact />
                            }
                        />


                        {/* -------------------------------------------------
                            GENERAL BOOKING
                            /booking
                        ------------------------------------------------- */}

                        <Route
                            path="/booking"
                            element={
                                <Booking />
                            }
                        />


                        {/* -------------------------------------------------
                            SPECIFIC TOUR BOOKING
                            /book/:slug
                        ------------------------------------------------- */}

                        <Route
                            path="/book/:slug"
                            element={
                                <Booking />
                            }
                        />


                    </Route>


                    {/* =====================================================
                        ADMIN AUTHENTICATION
                    ===================================================== */}

                    <Route
                        path="/admin/login"
                        element={
                            <AdminLogin />
                        }
                    />


                    {/* =====================================================
                        PROTECTED ADMIN AREA
                    ===================================================== */}

                    <Route
                        element={
                            <ProtectedRoute />
                        }
                    >


                        {/* -------------------------------------------------
                            DASHBOARD
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/dashboard"
                            element={
                                <AdminDashboard />
                            }
                        />


                        {/* -------------------------------------------------
                            BOOKINGS
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/bookings"
                            element={
                                <AdminBookings />
                            }
                        />


                        {/* -------------------------------------------------
                            BOOKING DETAILS
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/bookings/:id"
                            element={
                                <AdminBookingDetails />
                            }
                        />


                        {/* -------------------------------------------------
                            TOURS
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/tours"
                            element={
                                <AdminTours />
                            }
                        />


                        {/* -------------------------------------------------
                            CREATE TOUR
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/tours/new"
                            element={
                                <AdminTourForm />
                            }
                        />


                        {/* -------------------------------------------------
                            EDIT TOUR
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/tours/:id/edit"
                            element={
                                <AdminTourForm />
                            }
                        />


                    </Route>


                    {/* =====================================================
                        FALLBACK
                    ===================================================== */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />


                </Routes>

            </AuthProvider>

        </BrowserRouter>

    );

}


export default App;