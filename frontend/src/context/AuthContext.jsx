import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import adminApi from "../services/adminApi";


const AuthContext =
    createContext(null);


export const AuthProvider = ({
    children,
}) => {

    const [admin, setAdmin] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING SESSION
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const initializeAuth =
            async () => {

                const token =
                    adminApi.getToken();


                if (!token) {

                    setLoading(false);

                    return;
                }


                try {

                    const response =
                        await adminApi.me();


                    setAdmin(
                        response.data
                    );

                } catch {

                    adminApi.logout();

                    setAdmin(null);

                } finally {

                    setLoading(false);
                }
            };


        initializeAuth();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    const login = async (
        username,
        password
    ) => {

        const response =
            await adminApi.login(
                username,
                password
            );


        const meResponse =
            await adminApi.me();


        setAdmin(
            meResponse.data
        );


        return response;
    };


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const logout = () => {

        adminApi.logout();

        setAdmin(null);
    };


    const value = {
        admin,
        loading,
        isAuthenticated: !!admin,
        login,
        logout,
    };


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }


    return context;
};