import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/notifications`;

const getNotifications = (userId) =>
  axios.get(`${API}/${userId}`);

const markAsRead = (id) =>
  axios.put(`${API}/read/${id}`);

const markAllAsRead = (userId) =>
  axios.put(`${API}/read-all/${userId}`);

const clearAll = (userId) =>
  axios.delete(`${API}/${userId}`);

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAll,
};
