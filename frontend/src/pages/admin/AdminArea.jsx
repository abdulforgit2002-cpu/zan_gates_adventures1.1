import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import Seo from "../../seo/Seo";

import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminBookings from "./AdminBookings";
import AdminBookingDetails from "./AdminBookingDetails";
import AdminTours from "./AdminTours";
import AdminTourForm from "./AdminTourForm";
import AdminCategories from "./AdminCategories";
import AdminDestinations from "./AdminDestinations";

import AdminLayout from "../../components/admin/AdminLayout";
import ProtectedRoute from "../../components/admin/ProtectedRoute";


/*
|--------------------------------------------------------------------------
| ADMIN AREA
|--------------------------------------------------------------------------
|
| Loaded lazily from App.jsx so the whole admin panel is one separate
| JavaScript chunk — public visitors and search crawlers never download it.
| Everything admin-related must stay inside this single chunk: the admin
| pages share CSS classes that are defined in a few of the page stylesheets.
|
*/

function AdminArea() {

    return (

        <>

            <Seo
                title="Administration"
                description="ZAN GATES Adventures administration."
                path="/admin"
                noindex
            />

            <Routes>

                <Route
                    path="login"
                    element={<AdminLogin />}
                />

                <Route element={<ProtectedRoute />}>

                    <Route element={<AdminLayout />}>

                        <Route
                            path="dashboard"
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="bookings"
                            element={<AdminBookings />}
                        />

                        <Route
                            path="bookings/:id"
                            element={<AdminBookingDetails />}
                        />

                        <Route
                            path="tours"
                            element={<AdminTours />}
                        />

                        <Route
                            path="tours/new"
                            element={<AdminTourForm />}
                        />

                        <Route
                            path="tours/:id/edit"
                            element={<AdminTourForm />}
                        />

                        <Route
                            path="categories"
                            element={<AdminCategories />}
                        />

                        <Route
                            path="destinations"
                            element={<AdminDestinations />}
                        />

                    </Route>

                </Route>

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/admin/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </>

    );

}


export default AdminArea;
