import axios from "axios";

const API_BASE = "http://localhost:5000/api/admin/reports";

export const getAdminReports = async (filters) => {
  try {
    const response = await axios.get(`${API_BASE}/data`, {
      params: filters,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    throw error;
  }
};