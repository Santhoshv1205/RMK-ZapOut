import axios from "axios";
const API = `${import.meta.env.VITE_API_URL}/api`;

/* CREATE STAFF */
export const createStaff = (data) => axios.post(`${API}/admin/staff`, data);

/* FETCH STAFFS */
export const fetchStaffs = () => axios.get(`${API}/admin/staff`);

/* DELETE STAFF */
export const deleteStaff = (staffId, adminId) =>
  axios.delete(`${API}/admin/staff/${staffId}`, { params: { adminId } });

/* UPDATE STAFF */
export const updateStaff = (staffId, adminId, data) =>
  axios.put(`${API}/admin/staff/${staffId}`, { adminId, ...data });
