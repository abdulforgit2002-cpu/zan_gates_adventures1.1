import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


const ProtectedRoute = () => {

    const {
        isAuthenticated,
        loading,
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION CHECK
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="admin-loading-screen">

                <div className="admin-loading-spinner"></div>

                <p>
                    Loading administrator panel...
                </p>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REDIRECT TO LOGIN
    |--------------------------------------------------------------------------
    */

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }


    return <Outlet />;
};


export default ProtectedRoute;