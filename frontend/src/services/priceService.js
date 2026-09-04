import api from "./api";

export const getTourPrices = async (tourId) => {
    const response = await api.get(`/tours/${tourId}/prices`);

    return response.data;
};