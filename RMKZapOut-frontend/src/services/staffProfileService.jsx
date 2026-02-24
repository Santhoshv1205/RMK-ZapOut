import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/staff/profile`;

export const fetchStaffProfile = (userId) =>
  axios.get(`${API}/${userId}`);

export const updateStaffProfile = (userId, data) =>
  axios.put(`${API}/${userId}`, data);
