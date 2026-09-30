// ============================================================
// ZAN GATES ADVENTURES — FULL APPLICATION
// ============================================================
// The Payment Hold screen is kept (commented) below for reuse.
// To re-enable the payment lock later:
//   1. Comment the App() return block that renders the real site
//   2. Uncomment the PaymentHold function + the payment App() return
// ============================================================

import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'

import { lazy, Suspense } from 'react'

import Navbar from './components/Navbar'
import SocialRail from './components/SocialRail'
import PublicLayout from './components/PublicLayout'

import Home from './pages/Home'
import Tours from './pages/Tours'
import TourDetails from './pages/TourDetails'
import Safaris from './pages/Safaris'
import DestinationsPage from './pages/DestinationsPage'
import DestinationDetailPage from './pages/DestinationDetailPage'
import HotelsPage from './pages/HotelsPage'
import HotelDetailPage from './pages/HotelDetailPage'
import Transfers from './pages/Transfers'
import Booking from './pages/Booking'
import Contact from './pages/Contact'
import About from './pages/About'
import AboutZanzibar from './pages/AboutZanzibar'
import WeddingProposals from './pages/WeddingProposals'

import { AuthProvider } from './context/AuthContext'

// Admin panel is lazy-loaded — one separate chunk
const AdminArea = lazy(() => import('./pages/admin/AdminArea'))

import './index.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            {/* =========================================
                PUBLIC WEBSITE
            ========================================= */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />

              {/* Tours */}
              <Route path="/tours" element={<Tours />} />
              <Route path="/tours/:slug" element={<TourDetails />} />

              {/* Safaris */}
              <Route path="/safaris" element={<Safaris />} />

              {/* Destinations */}
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route
                path="/destinations/:slug"
                element={<DestinationDetailPage />}
              />

              {/* Hotels */}
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:slug" element={<HotelDetailPage />} />

              {/* Transfers */}
              <Route path="/transfers" element={<Transfers />} />

              {/* About pages */}
              <Route path="/about" element={<About />} />
              <Route path="/about-zanzibar" element={<AboutZanzibar />} />

              {/* Contact */}
              <Route path="/contact" element={<Contact />} />

              {/* Booking */}
              <Route path="/book/:slug" element={<Booking />} />

              {/* Weddings & Proposals */}
              <Route
                path="/wedding-and-proposals"
                element={<WeddingProposals />}
              />
            </Route>

            {/* =========================================
                ADMIN AREA — own layout
            ========================================= */}
            <Route path="/admin/*" element={<AdminArea />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

// ============================================================
// PAYMENT HOLD SCREEN — COMMENTED (kept for reuse)
// ============================================================
// To lock the site with the "Complete Payment" screen again:
//   1. Comment out the App() function above
//   2. Uncomment the PaymentHold function below
//   3. Uncomment the alternative App() function below
// ============================================================

// function PaymentHold() {
//   return (
//     <div className="payment-hold-root">
//       <div className="payment-hold-card">
//         <div className="payment-hold-icon" aria-hidden="true">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="1.8"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             width="56"
//             height="56"
//           >
//             <rect x="2" y="5" width="20" height="14" rx="2.5" />
//             <line x1="2" y1="10" x2="22" y2="10" />
//             <line x1="6" y1="15" x2="10" y2="15" />
//             <circle cx="17" cy="15" r="1.2" fill="currentColor" stroke="none" />
//           </svg>
//         </div>
//
//         <h1 className="payment-hold-title">Complete Payment</h1>
//
//         <div className="payment-hold-divider" aria-hidden="true" />
//
//         <p className="payment-hold-message">
//           <strong>Your website is currently on hold.</strong>
//         </p>
//
//         <p className="payment-hold-message">
//           Access to this application has been temporarily suspended
//           because the outstanding balance for this project has not
//           been settled.
//         </p>
//
//         <p className="payment-hold-warning">
//           ⚠️ If payment is not completed, the website will remain
//           offline and all public and administrative pages will stay
//           inaccessible.
//         </p>
//
//         <p className="payment-hold-message">
//           To restore full access immediately, please complete the
//           outstanding payment and notify the development team. Once
//           payment is confirmed, the site will be reactivated without
//           further delay.
//         </p>
//
//         <div className="payment-hold-cta">
//           <a
//             href="mailto:billing@example.com?subject=Payment%20Completion%20-%20Website%20Reactivation"
//             className="payment-hold-button"
//           >
//             Contact Billing to Complete Payment
//           </a>
//         </div>
//
//         <p className="payment-hold-footer">
//           Thank you for your prompt attention to this matter.
//         </p>
//       </div>
//     </div>
//   )
// }

// ============================================================
// ALTERNATIVE App() — renders only PaymentHold
// Uncomment this and comment the App() above to lock the site
// ============================================================
// function App() {
//   return <PaymentHold />
// }