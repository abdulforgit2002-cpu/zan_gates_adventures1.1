// ============================================================
// PAYMENT HOLD SCREEN — ALL ROUTES TEMPORARILY DISABLED
// ============================================================

// import {
//   BrowserRouter,
//   Route,
//   Routes,
// } from 'react-router-dom'

// import Navbar from './components/layout/Navbar'
// import Footer from './components/layout/Footer'
// import SocialRail from './components/ui/SocialRail'
// import Destinations from './pages/Destinations'
// import DestinationDetails from './pages/DestinationDetails'
// import Experiences from './pages/Experiences'
// import ExperienceDetails from './pages/ExperienceDetails'
// import Home from './pages/Home'
// import Book from './pages/Book'
// import BookingSuccess from './pages/BookingSuccess'
// import Contact from './pages/Contact'
// import About from './pages/About'
// import Impact from './pages/Impact'
// import Journal from './pages/Journal'

// import AdminLayout from './pages/admin/AdminLayout'
// import AdminLogin from './pages/admin/AdminLogin'
// import AdminDashboard from './pages/admin/AdminDashboard'
// import AdminBookings from './pages/admin/AdminBookings'
// import AdminBookingDetail from './pages/admin/AdminBookingDetail'
// import AdminMessages from './pages/admin/AdminMessages'
// import AdminTours from './pages/admin/AdminTours'
// import AdminTourForm from './pages/admin/AdminTourForm'
// import AdminDestinations from './pages/admin/AdminDestinations'
// import AdminDestinationForm from './pages/admin/AdminDestinationForm'

import './index.css'

function PaymentHold() {
  return (
    <div className="payment-hold-root">
      <div className="payment-hold-card">
        <div className="payment-hold-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="56"
            height="56"
          >
            <rect x="2" y="5" width="20" height="14" rx="2.5" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="6" y1="15" x2="10" y2="15" />
            <circle cx="17" cy="15" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h1 className="payment-hold-title">Complete Payment</h1>

        <div className="payment-hold-divider" aria-hidden="true" />

        <p className="payment-hold-message">
          <strong>Your website is currently on hold.</strong>
        </p>

        <p className="payment-hold-message">
          Access to this application has been temporarily suspended
          because the outstanding balance for this project has not
          been settled.
        </p>

        <p className="payment-hold-warning">
          ⚠️ If payment is not completed, the website will remain
          offline and all public and administrative pages will stay
          inaccessible.
        </p>

        <p className="payment-hold-message">
          To restore full access immediately, please complete the
          outstanding payment and notify the development team. Once
          payment is confirmed, the site will be reactivated without
          further delay.
        </p>

        {/* <div className="payment-hold-cta">
          <a
            href="mailto:billing@example.com?subject=Payment%20Completion%20-%20Website%20Reactivation"
            className="payment-hold-button"
          >
            Contact Billing to Complete Payment
          </a>
        </div> */}

        <p className="payment-hold-footer">
          Thank you.
        </p>
      </div>
    </div>
  )
}

function App() {
  return <PaymentHold />
}

export default App