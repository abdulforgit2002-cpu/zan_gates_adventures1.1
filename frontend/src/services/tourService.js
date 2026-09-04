import api from "./api";

/**
 * Get all active tours.
 */
export const getTours = async () => {
    const response = await api.get("/tours");

    return Array.isArray(response.data)
        ? response.data
        : [];
};


/**
 * Get a single tour by ID.
 */
export const getTour = async (id) => {
    const response = await api.get(`/tours/${id}`);

    return response.data ?? null;
};

/** * Get a single tour by slug. * * Example: * /api/tours/slug/safari-blue-zanzibar */ 
export const getTourBySlug = async (slug) => { 
    const response = await api.get( `/tours/slug/${encodeURIComponent(slug)}` ); 
    
    return response.data ?? null; };


/**
 * Get prices for a specific tour.
 */
export const getTourPrices = async (id) => {
    const response = await api.get(`/tours/${id}/prices`);

    return Array.isArray(response.data)
        ? response.data
        : [];
};