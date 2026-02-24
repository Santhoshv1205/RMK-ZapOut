import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

// Step 1: check email
export const checkEmail = (email) =>
  axios.post(`${API_URL}/check-email`, { email });

// Step 2: login
export const loginUser = (email, password) =>
  axios.post(`${API_URL}/login`, { email, password });

// Step 3: update password
export const updatePassword = (email, newPassword) =>
  axios.put(`${API_URL}/update-password`, {
    email,
    newPassword,
  });
