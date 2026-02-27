import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/watchman", // change if needed
});

/* =====================================================
   STUDENT FETCH (EXISTING — NO CHANGE)
===================================================== */

// 🔹 IMPORTANT: return res.data
export const getStudentByRegisterNumber = async (registerNumber) => {
  const res = await API.get(`/${registerNumber}`);
  return res.data;
};


/* =====================================================
   WATCHMAN PROFILE
===================================================== */

// 🔹 Get watchman profile
export const getWatchmanProfile = async (userId) => {
  const res = await API.get(`/profile/${userId}`);
  return res.data;
};

// 🔹 Update watchman profile
export const updateWatchmanProfile = async (userId, data) => {
  const res = await API.put(`/profile/${userId}`, data);
  return res.data;
};