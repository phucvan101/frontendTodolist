import axios from 'axios';
import { ElMessage } from 'element-plus';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

// Request interceptor - Tự động thêm token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi chung
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // nếu nối 401 và chưa retry; 
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post('/api/auth/refresh-token', {
                        refreshToken
                    })

                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/';
                ElMessage.error('Phiên đăng nhập đã hết hạn');
                return Promise.reject(refreshError);
            }
        }

        const message = error.response?.data?.message || 'Đã có lỗi xảy ra';
        ElMessage.error(message);
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
};

// Task APIs
export const taskAPI = {
    getAll: (params) => api.get('/tasks', { params }),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks/create', data),
    update: (id, data) => api.post(`/tasks/update/${id}`, data),
    delete: (id) => api.post(`/tasks/delete/${id}`),
    share: (id, data) => api.post(`/tasks/${id}/share`, data),
    uploadAttachment: (id, formData) => api.post(`/tasks/upload-attachment/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Category APIs

export const categoryAPI = {
    getAll: (params) => api.get('/categories', { params }),
    create: (data) => api.post('/categories/create', data),
    update: (id, data) => api.post(`/categories/update/${id}`, data),
    delete: (id) => api.post(`/categories/delete/${id}`)
}

export default api;