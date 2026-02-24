import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/onduty`;

// ✅ This URL now matches the router
export const fetchStudentProfile = (userId) =>
  axios.get(`${API}/profile/${userId}`);

// Apply on-duty
export const applyOnDuty = (formData) =>
  axios.post(`${API}/apply`, formData);
