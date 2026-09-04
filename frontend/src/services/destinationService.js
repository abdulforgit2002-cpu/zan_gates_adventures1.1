import apiRequest from "./api";

export const getDestinations = async () => {
    const response = await apiRequest("/destinations");

    return response.data;
};