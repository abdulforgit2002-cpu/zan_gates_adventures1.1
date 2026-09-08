import api from "./api";


/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE TOURS
|--------------------------------------------------------------------------
|
| Retrieves all active tours and enriches each tour with its images.
|
| The public /tours endpoint currently returns tour information but does
| not include image information. Therefore, we use the existing
| /tours/{id}/images endpoint for each tour.
|
*/

export const getTours = async () => {
    const response =
        await api.get("/tours");

    const tours =
        Array.isArray(response.data)
            ? response.data
            : [];

    if (tours.length === 0) {
        return [];
    }

    const toursWithImages =
        await Promise.all(
            tours.map(
                async (tour) => {

                    try {

                        const images =
                            await getTourImages(
                                tour.id
                            );

                        const normalizedImages =
                            Array.isArray(images)
                                ? images
                                : [];

                        /*
                        |--------------------------------------------------------------------------
                        | FIND PRIMARY IMAGE
                        |--------------------------------------------------------------------------
                        |
                        | The backend uses is_primary to identify the main image.
                        | If no primary image exists, use the first available image.
                        |
                        */

                        const primaryImage =
                            normalizedImages.find(
                                (image) =>
                                    image?.is_primary === true ||
                                    image?.is_primary === 1 ||
                                    image?.is_primary === "1"
                            ) ||
                            normalizedImages[0] ||
                            null;

                        return {
                            ...tour,

                            /*
                            |--------------------------------------------------------------------------
                            | ALL TOUR IMAGES
                            |--------------------------------------------------------------------------
                            */

                            images:
                                normalizedImages,

                            /*
                            |--------------------------------------------------------------------------
                            | PRIMARY IMAGE URL
                            |--------------------------------------------------------------------------
                            |
                            | TourCard.jsx already supports image_url.
                            |
                            */

                            image_url:
                                primaryImage?.image_url ||
                                primaryImage?.url ||
                                null,

                            /*
                            |--------------------------------------------------------------------------
                            | IMAGE ALT TEXT
                            |--------------------------------------------------------------------------
                            */

                            image_alt:
                                primaryImage?.alt_text ||
                                tour.title ||
                                "Zanzibar tour experience",
                        };

                    } catch (imageError) {

                        /*
                        |--------------------------------------------------------------------------
                        | IMAGE ERROR HANDLING
                        |--------------------------------------------------------------------------
                        |
                        | If one tour's images fail to load, the other tours should
                        | still appear normally.
                        |
                        */

                        console.warn(
                            `Unable to load images for tour ${tour.id}:`,
                            imageError
                        );

                        return {
                            ...tour,
                            images: [],
                            image_url: null,
                            image_alt:
                                tour.title ||
                                "Zanzibar tour experience",
                        };
                    }
                }
            )
        );

    return toursWithImages;
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