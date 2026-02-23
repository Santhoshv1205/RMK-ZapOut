import axios from "axios";

const API_BASE = "http://localhost:5000/api/staff/dashboard";

/**
 * Fetch staff dashboard statistics
 * @param {number} staffId
 * @param {string} role
 */
export const fetchStaffDashboardStats = async (staffId, role) => {
  try {
    const response = await axios.get(
      `${API_BASE}/stats/${staffId}`,
      {
        params: { role },
      }
      
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    
    throw error;
  }
};