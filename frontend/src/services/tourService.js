import api from "./api";


/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async () => {
    const response =
        await api.get("/tours");

    return Array.isArray(response.data)
        ? response.data
        : [];
};


/*
|--------------------------------------------------------------------------
| GET TOUR BY ID
|--------------------------------------------------------------------------
*/

export const getTour = async (id) => {
    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {
        return null;
    }

    const response =
        await api.get(
            `/tours/${encodeURIComponent(
                String(id)
            )}`
        );

    return response.data ?? null;
};


/*
|--------------------------------------------------------------------------
| GET TOUR BY SLUG
|--------------------------------------------------------------------------
|
| Preferred endpoint for public pages.
|
*/

export const getTourBySlug = async (
    slug
) => {
    if (
        !slug ||
        typeof slug !== "string"
    ) {
        return null;
    }

    const response =
        await api.get(
            `/tours/slug/${encodeURIComponent(
                slug
            )}`
        );

    return response.data ?? null;
};


/*
|--------------------------------------------------------------------------
| GET TOUR PRICES
|--------------------------------------------------------------------------
*/

export const getTourPrices = async (
    id
) => {
    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {
        return [];
    }

    const response =
        await api.get(
            `/tours/${encodeURIComponent(
                String(id)
            )}/prices`
        );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


/*
|--------------------------------------------------------------------------
| GET TOUR IMAGES
|--------------------------------------------------------------------------
*/

export const getTourImages = async (
    id
) => {
    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {
        return [];
    }

    const response =
        await api.get(
            `/tours/${encodeURIComponent(
                String(id)
            )}/images`
        );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


/*
|--------------------------------------------------------------------------
| CREATE BOOKING ENQUIRY
|--------------------------------------------------------------------------
*/

export const createBookingEnquiry =
    async (bookingData) => {

        const response =
            await api.post(
                "/booking-enquiries",
                bookingData
            );

        return response.data ?? null;
    };