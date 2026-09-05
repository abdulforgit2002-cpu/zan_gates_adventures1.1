import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import adminApi from "../../services/adminApi";


const AdminLogin = () => {

    const navigate =
        useNavigate();

    const {
        login,
        isAuthenticated,
    } = useAuth();


    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | REDIRECT AUTHENTICATED ADMIN
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (isAuthenticated) {

            navigate(
                "/admin/dashboard",
                {
                    replace: true,
                }
            );
        }

    }, [
        isAuthenticated,
        navigate,
    ]);


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");


        const cleanUsername =
            username.trim();


        if (!cleanUsername) {

            setError(
                "Please enter your username."
            );

            return;
        }


        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }


        try {

            setLoading(true);


            await login(
                cleanUsername,
                password
            );


            navigate(
                "/admin/dashboard",
                {
                    replace: true,
                }
            );

        } catch (err) {

            adminApi.logout();

            setError(
                err.message ||
                "Unable to sign in."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <main className="admin-login-page">

            <div className="admin-login-background">

                <div className="admin-login-card">

                    {/* Brand */}

                    <div className="admin-login-brand">

                        <div className="admin-brand-mark">
                            ZG
                        </div>

                        <div>
                            <strong>
                                ZAN GATES
                            </strong>

                            <span>
                                ADVENTURES
                            </span>
                        </div>

                    </div>


                    {/* Heading */}

                    <div className="admin-login-heading">

                        <span>
                            ADMINISTRATION
                        </span>

                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Sign in to manage your
                            tours and booking enquiries.
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div
                            className="admin-login-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="admin-login-form"
                    >

                        <div className="admin-form-group">

                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value
                                    )
                                }
                                autoComplete="username"
                                placeholder="Enter username"
                                disabled={loading}
                            />

                        </div>


                        <div className="admin-form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="current-password"
                                placeholder="Enter password"
                                disabled={loading}
                            />

                        </div>


                        <button
                            type="submit"
                            className="admin-login-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"
                            }

                        </button>

                    </form>


                    {/* Back to website */}

                    <button
                        type="button"
                        className="admin-back-home"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        ← Back to website
                    </button>

                </div>

            </div>

        </main>
    );
};


export default AdminLogin;