import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Home from "./pages/Home";
import TourDetails from "./pages/TourDetails";
import Booking from "./pages/Booking";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =========================
                    HOME
                ========================= */}
                <Route
                    path="/"
                    element={<Home />}
                />

                {/* =========================
                    TOUR DETAILS
                ========================= */}
                <Route
                    path="/tours/:slug"
                    element={<TourDetails />}
                />

                {/* =========================
                    BOOKING / ENQUIRY
                ========================= */}
                <Route
                    path="/book/:slug"
                    element={<Booking />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;