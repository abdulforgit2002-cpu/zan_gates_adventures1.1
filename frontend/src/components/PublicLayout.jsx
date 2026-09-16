import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import SocialRail from "./SocialRail";

/* =========================================================
   PUBLIC LAYOUT
   Wraps every public route with Navbar and the global
   SocialRail (WhatsApp / Facebook / Instagram / Threads)
   that stays fixed on the right-hand side.
   ========================================================= */

function PublicLayout() {
  return (
    <>
      <Navbar />

      {/* Global right-hand social rail — visible on every page */}
      <SocialRail />

      <main className="public-main">
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;