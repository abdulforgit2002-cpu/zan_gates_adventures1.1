import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/*
|--------------------------------------------------------------------------
| INTERNATIONALIZATION
|--------------------------------------------------------------------------
| IMPORTANT:
| i18n must be initialized before the React application renders.
*/
import "./i18n/config.js";

/*
|--------------------------------------------------------------------------
| APPLICATION
|--------------------------------------------------------------------------
*/
import App from "./App.jsx";

/*
|--------------------------------------------------------------------------
| GLOBAL STYLES
|--------------------------------------------------------------------------
*/
import "./index.css";


createRoot(
    document.getElementById("root")
).render(

    <StrictMode>
        <App />
    </StrictMode>

);