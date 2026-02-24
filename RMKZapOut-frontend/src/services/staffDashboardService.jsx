import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/staff/dashboard`;

/**
 * Fetch staff dashboard statistics
 * @param {number} staffId
 * @param {string} role
 */
export const fetchStaffDashboardStats = async (staffId, role) => {
  try {
    const response = await axios.get(
      `${API}/stats/${staffId}`,
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