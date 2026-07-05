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
// เพิ่มคลังสินค้าใหม่
export const createWarehouse = async (data) => {
    const response = await api.post('/warehouse/list/', data);
    return response.data;
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

// สำหรับสร้างรายการ Stock Movement
export const createStockMovement = async (data) => {
    try {
        const response = await api.post('/warehouse/stock-movements/', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
};

// อัปเดตข้อมูลคลัง
export const UpdateWarehouse = async ({ id, payload }) => {
    const response = await api.put(`/warehouse/list/${id}/`, payload);
    return response.data;
};
// ลบคลัง
export const DeleteWarehouse = async (id) => {
    const response = await api.delete(`/warehouse/list/${id}/`)
    return response.data;
};
// ฟังก์ชันลบข้อมูลถาวร (Hard Delete)
export const hardDeleteData = async (type) => {
    const response = await api.delete('/warehouse/hard-delete/', {
        data: { type }
    });
    return response.data;
};
// สำหรับดึงรายการสินค้าคงเหลือในคลัง
export const getWarehouseProducts = async (warehouseId, page = 1, search = "") => {
    const response = await api.get(`/warehouse/list/${warehouseId}/products/?page=${page}&search=${search}`);
    return response.data;
};
