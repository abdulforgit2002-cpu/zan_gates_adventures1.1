import api from "./api";

/**
 * Submit a tour booking enquiry.
 *
 * The backend is responsible for:
 * - validating the request
 * - verifying the tour
 * - selecting the official price
 * - calculating the estimated total
 * - assigning PENDING status
 */
export const createBookingEnquiry = async (bookingData) => {
    const response = await api.post(
        "/booking-enquiries",
        bookingData
    );

    return response.data ?? null;
};