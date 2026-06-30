import api from './axios';

export const getProducts = async (page = 1) => {
    const response = await api.get(`/warehouse/products/?page=${page}`);
    return response.data.results || response.data;
};

export const getPaginatedProducts = async (page = 1) => {
    const response = await api.get(`/warehouse/products/?page=${page}`);
    return response.data;
};

export const getAllProducts = async () => {
    const response = await api.get(`/warehouse/products/?all=true`);
    return response.data;
};

export const getWarehouses = async () => {
    const response = await api.get('/warehouse/list/');
    return response.data.results || response.data;
};

export const DeleteProduct = async(id) => {
    const response = await api.delete(`/warehouse/products/${id}/`)
    return response.data
};

export const getActivityLogs = async (page = 1) => {
    const response = await api.get(`/warehouse/log/?page=${page}`);
    return response.data;
};