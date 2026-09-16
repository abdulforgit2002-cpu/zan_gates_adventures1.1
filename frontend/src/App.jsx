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
import AboutZanzibar from "./pages/AboutZanzibar";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import HotelsPage from "./pages/HotelsPage";
import HotelDetailPage from "./pages/HotelDetailPage";


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
| ADMIN LAYOUT + AUTHENTICATION
|--------------------------------------------------------------------------
*/

import AdminLayout from "./components/admin/AdminLayout";
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
                        element={
                            <PublicLayout />
                        }
                    >

                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/tours"
                            element={<Tours />}
                        />

                        <Route
                            path="/tours/:slug"
                            element={<TourDetails />}
                        />

                        {/* =============================================
                            DESTINATIONS
                            /destinations       → listing page
                            /destinations/:slug → filtered tours
                        ============================================= */}

                        <Route
                            path="/destinations"
                            element={<DestinationsPage />}
                        />

                        <Route
                            path="/destinations/:slug"
                            element={<DestinationDetailPage />}
                        />

                        <Route
                            path="/about"
                            element={<About />}
                        />

                        <Route
                            path="/about-zanzibar"
                            element={<AboutZanzibar />}
                        />

                        <Route
                            path="/contact"
                            element={<Contact />}
                        />

                        <Route
                            path="/book/:slug"
                            element={<Booking />}
                        />

                        {/* HOTELS */}
                        <Route 
                            path="/hotels" 
                            element={<HotelsPage />} 
                            />
                        <Route 
                            path="/hotels/:slug" 
                            element={<HotelDetailPage />} 
                            />

                    </Route>


                    {/* =====================================================
                        ADMIN AUTHENTICATION
                    ===================================================== */}

                    <Route
                        path="/admin/login"
                        element={<AdminLogin />}
                    />


                    {/* =====================================================
                        PROTECTED ADMIN AREA
                        Every admin page renders inside <AdminLayout />
                    ===================================================== */}

                    <Route element={<ProtectedRoute />}>

                        <Route element={<AdminLayout />}>

                            <Route
                                path="/admin/dashboard"
                                element={<AdminDashboard />}
                            />

                            <Route
                                path="/admin/bookings"
                                element={<AdminBookings />}
                            />

                            <Route
                                path="/admin/bookings/:id"
                                element={<AdminBookingDetails />}
                            />

                            <Route
                                path="/admin/tours"
                                element={<AdminTours />}
                            />

                            <Route
                                path="/admin/tours/new"
                                element={<AdminTourForm />}
                            />

                            <Route
                                path="/admin/tours/:id/edit"
                                element={<AdminTourForm />}
                            />

                        </Route>

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