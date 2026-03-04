import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/admin/watchmans`;

// Fetch all watchmen
export const fetchWatchmen = async () => {
  return axios.get(BASE_URL);
};

// Create a new watchman
export const createWatchman = async (data) => {
  // Only send username, email, is_active
  return axios.post(BASE_URL, {
    username: data.username,
    email: data.email,
    is_active: data.is_active
  });
};

// Update a watchman
export const updateWatchman = async (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, {
    username: data.username,
    email: data.email,
    is_active: data.is_active
  });
};

// Delete a watchman
export const deleteWatchman = async (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};