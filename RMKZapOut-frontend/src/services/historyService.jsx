import axios from "axios";

// Base URL of your backend API
const API_URL = "http://localhost:5000/api/history";

/**
 * Fetch the request history of a student
 * @param {number|string} userId - User ID of the student
 * @returns {Promise} Axios promise with the history data
 */
export const getStudentHistory = (userId) => {
  return axios.get(`${API_URL}/${userId}`); // <-- FIXED
};

/**
 * Fetch the request history handled by a staff
 * @param {number|string} userId - User ID of the staff
 * @returns {Promise} Axios promise with the history data
 */
export const getStaffHistory = (userId) => {
  return axios.get(`${API_URL}/staff/${userId}`);
};
