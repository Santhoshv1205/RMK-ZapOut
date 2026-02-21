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