import api from './axios';
// ดึงข้อมูลสินค้า
export const getProducts = async (page = 1) => {
    const response = await api.get(`/warehouse/products/?page=${page}`);
    return response.data.results || response.data;
};
// ดึงข้อมูลสำหรับสร้าง page
export const getPaginatedProducts = async (page = 1) => {
    const response = await api.get(`/warehouse/products/?page=${page}`);
    return response.data;
};
// ดึงข้อมูลสินค้าทั้งหมด (สำหรับเพิ่มสินค้าใหม่)
export const getAllProducts = async () => {
    const response = await api.get(`/warehouse/products/?all=true`);
    return response.data;
};
// ดึงข้อมูล warehouse ทั้งหมด
export const getWarehouses = async () => {
    const response = await api.get('/warehouse/list/');
    return response.data.results || response.data;
};
// ดึงข้อมูลสินค้าสำหรับลบ
export const DeleteProduct = async (id) => {
    const response = await api.delete(`/warehouse/products/${id}/`)
    return response.data
};
// ดึงข้อมูล Activity Logs
export const getActivityLogs = async (page = 1) => {
    const response = await api.get(`/warehouse/log/?page=${page}`);
    return response.data;
};
// อัพเดตสินค้า
export const UpdateProduct = async ({ id, payload }) => {
    const response = await api.put(`/warehouse/products/${id}/`, payload);
    return response.data;
};
// ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับหน้า Settings)
export const getAllUsers = async () => {
    const response = await api.get('/warehouse/users/');
    return response.data;
};
// อัปเดตสิทธิ์ผู้ใช้ทีละอย่าง (Toggle)
export const updateUserPermission = async (userId, data) => {
    const response = await api.patch(`/warehouse/users/${userId}/`, data);
    return response.data;
}
