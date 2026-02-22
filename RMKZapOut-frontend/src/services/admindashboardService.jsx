import axios from "axios";

const API = "http://localhost:5000/api/admin/dashboard";

/* =========================
   DASHBOARD STATS
========================= */
export const fetchDashboardStats = () =>
  axios.get(`${API}/stats`);

/* =========================
   DEPARTMENTS
========================= */
export const fetchDepartments = () =>
  axios.get("http://localhost:5000/api/admin/dashboard/departments-reports");

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