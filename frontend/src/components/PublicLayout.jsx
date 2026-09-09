import {
    Outlet,
} from "react-router-dom";

import Navbar from "./Navbar";


function PublicLayout() {

    return (

        <div className="public-site">

            <Navbar />

            <Outlet />

        </div>

    );

}


export default PublicLayout;