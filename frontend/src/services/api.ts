import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string, schoolId: string) =>
    api.post('/auth/login', { email, password, schoolId }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const schoolAPI = {
  list: (page = 1, pageSize = 20) =>
    api.get('/schools', { params: { page, pageSize } }),
  get: (id: string) => api.get(`/schools/${id}`),
  create: (data: any) => api.post('/schools', data),
  update: (id: string, data: any) => api.put(`/schools/${id}`, data),
  delete: (id: string) => api.delete(`/schools/${id}`),
};

export const userAPI = {
  list: (schoolId: string, page = 1) =>
    api.get('/users', { params: { schoolId, page } }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const studentAPI = {
  list: (schoolId: string, page = 1) =>
    api.get('/students', { params: { schoolId, page } }),
  get: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const classAPI = {
  list: (schoolId: string, page = 1) =>
    api.get('/classes', { params: { schoolId, page } }),
  get: (id: string) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: string, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
};

export const gradeAPI = {
  getByStudent: (studentId: string, academicYear: string) =>
    api.get(`/grades/student/${studentId}`, { params: { academicYear } }),
  create: (data: any) => api.post('/grades', data),
  update: (id: string, data: any) => api.put(`/grades/${id}`, data),
};

export const invoiceAPI = {
  list: (schoolId: string, page = 1) =>
    api.get('/invoices', { params: { schoolId, page } }),
  get: (id: string) => api.get(`/invoices/${id}`),
  getReport: (schoolId: string) =>
    api.get('/invoices/reports/summary', { params: { schoolId } }),
};

export const subjectAPI = {
  list: (schoolId: string, page = 1) =>
    api.get('/subjects', { params: { schoolId, page } }),
  get: (id: string) => api.get(`/subjects/${id}`),
  create: (data: any) => api.post('/subjects', data),
  update: (id: string, data: any) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};

export const timetableAPI = {
  list: (classId?: string, page = 1) =>
    api.get('/timetable', { params: { classId, page } }),
  getByClass: (classId: string) =>
    api.get('/timetable', { params: { classId } }),
  create: (data: any) => api.post('/timetable', data),
  update: (id: string, data: any) => api.put(`/timetable/${id}`, data),
  delete: (id: string) => api.delete(`/timetable/${id}`),
};

export default api;
