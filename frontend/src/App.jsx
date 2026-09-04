import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Home from "./pages/Home";
import TourDetails from "./pages/TourDetails";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/tours/:slug"
                    element={<TourDetails />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;