import axios from "axios";

const API = "http://localhost:5000/api/student-dashboard";

export const fetchStudentDashboardStats = async (studentId) => {
  return axios.get(`${API}/stats/${studentId}`);
};