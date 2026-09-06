import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import TourDetails from "./pages/TourDetails";
import Booking from "./pages/Booking";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetails from "./pages/admin/AdminBookingDetails";
import AdminTours from "./pages/admin/AdminTours";
import AdminTourForm from "./pages/admin/AdminTourForm";

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
                    ===================================================== */}

                    <Route
                        path="/"
                        element={
                            <Home />
                        }
                    />

                    <Route
                        path="/tours/:slug"
                        element={
                            <TourDetails />
                        }
                    />

                    <Route
                        path="/book/:slug"
                        element={
                            <Booking />
                        }
                    />


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
                            ADMIN DASHBOARD
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/dashboard"
                            element={
                                <AdminDashboard />
                            }
                        />


                        {/* -------------------------------------------------
                            ADMIN BOOKINGS
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/bookings"
                            element={
                                <AdminBookings />
                            }
                        />

                        <Route
                            path="/admin/bookings/:id"
                            element={
                                <AdminBookingDetails />
                            }
                        />


                        {/* -------------------------------------------------
                            ADMIN TOUR MANAGEMENT
                        ------------------------------------------------- */}

                        <Route
                            path="/admin/tours"
                            element={
                                <AdminTours />
                            }
                        />

                        <Route
                            path="/admin/tours/new"
                            element={
                                <AdminTourForm />
                            }
                        />

                        <Route
                            path="/admin/tours/:id/edit"
                            element={
                                <AdminTourForm />
                            }
                        />

                    </Route>


                    {/* =====================================================
                        FALLBACK
                    =====================================================

                        Any unknown URL is redirected to the homepage.
                    */}

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