import axios from "axios";

const API_BASE = "http://localhost:5000/api/staff/dashboard";

/**
 * Fetch staff dashboard statistics.
 * @param {number} staffId - The ID of the staff member
 * @param {string} role - The role of the staff member (COUNSELLOR, COORDINATOR, HOD)
 * @returns {Promise} - Returns a promise with year-wise stats and counts
 */
export const fetchStaffDashboardStats = async (staffId, role) => {
  try {
    const response = await axios.get(`${API_BASE}/stats/${staffId}`, {
      params: { role }, // role stays as query param
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching staff dashboard stats:", error);
    throw error;
  }
};