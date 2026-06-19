import api from './axios';

export const getProducts = async (page = 1) => {
    const response = await api.get(`/warehouse/products/?page=${page}`);
    return response.data.results || response.data;
};

export const getWarehouses = async () => {
    const response = await api.get('/warehouse/list/');
    return response.data.results || response.data;
};