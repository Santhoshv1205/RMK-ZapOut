import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/admin/dashboard`;

/* =========================
   DASHBOARD STATS
========================= */
export const fetchDashboardStats = () =>
  axios.get(`${API}/stats`);

/* =========================
   DEPARTMENTS
========================= */
export const fetchDepartments = () =>
  axios.get(`${API}/departments-reports`);

/* Academic Calendar */
export const fetchCalendars = () => axios.get(`${API}/academic-calendar`);

// Upload file as FormData (Cloudinary)
export const uploadCalendar = (file) => {
  const formData = new FormData();
  formData.append("file", file); // must match parser.single("file")
  return axios.post(`${API}/academic-calendar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteCalendar = (id) =>
  axios.delete(`${API}/academic-calendar/${id}`);