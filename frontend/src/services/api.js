import axios from 'axios';

// The Vite proxy redirects /api to the backend
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const studentService = {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    search: (keyword) => api.get(`/students/search?keyword=${keyword}`),
    updateStatus: (id, status) => api.patch(`/students/${id}/status`, { status }),
    getDashboardStats: () => api.get('/students/dashboard/stats'),
    getByStatus: (status) => api.get(`/students/status/${status}`),
    getByDepartment: (department) => api.get(`/students/department/${department}`),
    getByCourse: (course) => api.get(`/students/course/${course}`),
};

export default api;
