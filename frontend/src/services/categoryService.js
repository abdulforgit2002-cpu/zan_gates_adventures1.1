import apiRequest from "./api";

export const getCategories = async () => {
    const response = await apiRequest("/categories");

    return response.data;
};