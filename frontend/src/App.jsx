import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";


import Home from "./pages/Home";
import TourDetails from "./pages/TourDetails";
import Booking from "./pages/Booking";


import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";


import ProtectedRoute from "./components/admin/ProtectedRoute";


import {
    AuthProvider,
} from "./context/AuthContext";


function App() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>


                    {/* ==================================================
                        PUBLIC WEBSITE
                    ================================================== */}

                    <Route
                        path="/"
                        element={<Home />}
                    />


                    <Route
                        path="/tours/:slug"
                        element={<TourDetails />}
                    />


                    <Route
                        path="/book/:slug"
                        element={<Booking />}
                    />



                    {/* ==================================================
                        ADMIN LOGIN
                    ================================================== */}

                    <Route
                        path="/admin/login"
                        element={<AdminLogin />}
                    />



                    {/* ==================================================
                        PROTECTED ADMIN AREA
                    ================================================== */}

                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/admin/dashboard"
                            element={<AdminDashboard />}
                        />

                    </Route>


                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}


export default App;