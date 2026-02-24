import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/student/profile`;

export const fetchStudentProfile = (userId) =>
  axios.get(`${API}/${userId}`);

export const updateStudentProfile = (userId, data) =>
  axios.put(`${API}/${userId}`, data);
