import { lazy, Suspense } from "react";

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
import Transfers from "./pages/Transfers";
import Safaris from "./pages/Safaris";
import WeddingProposals from "./pages/WeddingProposals";


/*
|--------------------------------------------------------------------------
| PUBLIC LAYOUT
|--------------------------------------------------------------------------
*/

import PublicLayout from "./components/PublicLayout";

import {
    AuthProvider,
} from "./context/AuthContext";


/*
|--------------------------------------------------------------------------
| ADMIN AREA (lazy-loaded)
|--------------------------------------------------------------------------
|
| The whole admin panel is one separate chunk, fetched only when someone
| actually opens /admin/*. See pages/admin/AdminArea.jsx.
|
*/

const AdminArea = lazy(() => import("./pages/admin/AdminArea"));


function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Suspense fallback={null}>

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
                            SAFARIS LISTING
                        ============================================= */}

                        <Route
                            path="/safaris"
                            element={<Safaris />}
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

                        {/* =============================================
                            HOTELS
                            /hotels       → listing page
                            /hotels/:slug → hotel detail
                        ============================================= */}

                        <Route
                            path="/hotels"
                            element={<HotelsPage />}
                        />

                        <Route
                            path="/hotels/:slug"
                            element={<HotelDetailPage />}
                        />

                        {/* =============================================
                            TRANSFERS
                            ✅ This was missing — that's why the
                            Transfers nav link was redirecting to /
                        ============================================= */}

                        <Route
                            path="/transfers"
                            element={<Transfers />}
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

                        <Route
                            path="/wedding-and-proposals"
                            element={<WeddingProposals />}
                        />

                    </Route>


                    {/* =====================================================
                        ADMIN AREA
                        /admin/login and every protected admin page
                        (see pages/admin/AdminArea.jsx)
                    ===================================================== */}

                    <Route
                        path="/admin/*"
                        element={<AdminArea />}
                    />


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

                </Suspense>

            </AuthProvider>

        </BrowserRouter>

    );

}


export default App;