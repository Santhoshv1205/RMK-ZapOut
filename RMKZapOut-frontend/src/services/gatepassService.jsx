import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/gatepass`;

// Fetch student info
export const fetchStudentInfo = (studentId) =>
  axios.get(`${API}/student/${studentId}`);

// Submit gatepass
export const submitGatepass = (data) =>
  axios.post(`${API}/apply`, data);
