import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/student-dashboard`;

export const fetchStudentDashboardStats = async (studentId) => {
  return axios.get(`${API}/stats/${studentId}`);
};