import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/admin`;

/* ================= DEPARTMENTS ================= */
export const fetchDepartments = () =>
  axios.get(`${API}/departments`);
console.log("API URL:", import.meta.env.VITE_API_URL);

/* ================= COUNSELLORS + COORDINATORS ================= */
export const fetchStaffByDept = (deptId) =>
  axios.get(`${API}/staff/${deptId}`);
/* ================= STUDENTS ================= */
export const fetchStudents = () =>
  axios.get(`${API}/students`);

export const createStudent = (data) =>
  axios.post(`${API}/students`, data);

export const updateStudent = (id, data) =>
  axios.put(`${API}/students/${id}`, data);

export const deleteStudent = (id) =>
  axios.delete(`${API}/students/${id}`);
