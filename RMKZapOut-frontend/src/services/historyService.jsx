import axios from "axios";

// Base URL of your backend API
const API = `${import.meta.env.VITE_API_URL}/api/history`;

/**
 * Fetch the request history of a student
 * @param {number|string} userId - User ID of the student
 * @returns {Promise} Axios promise with the history data
 */
export const getStudentHistory = (userId) => {
  return axios.get(`${API}/${userId}`); // <-- FIXED
};

/**
 * Fetch the request history handled by a staff
 * @param {number|string} userId - User ID of the staff
 * @returns {Promise} Axios promise with the history data
 */
export const getStaffHistory = (userId) => {
  return axios.get(`${API}/staff/${userId}`);
};
