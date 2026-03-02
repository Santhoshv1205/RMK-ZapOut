import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/watchman`,
});

/* =====================================================
   🔴 EXIT SCAN (Fetch + Mark Exit)
===================================================== */

export const markExit = async (registerNumber) => {
  const res = await API.post(`/exit/${registerNumber}`);
  return res.data;
};


/* =====================================================
   🟢 ENTRY SCAN (Fetch + Mark Entry)
===================================================== */

export const markEntry = async (registerNumber) => {
  const res = await API.post(`/entry/${registerNumber}`);
  return res.data;
};


/* =====================================================
   👤 WATCHMAN PROFILE
===================================================== */

export const getWatchmanProfile = async (userId) => {
  const res = await API.get(`/profile/${userId}`);
  return res.data;
};

export const updateWatchmanProfile = async (userId, data) => {
  const res = await API.put(`/profile/${userId}`, data);
  return res.data;
};

/* =====================================================
   📋 WATCHMAN LOGS
===================================================== */

export const getWatchmanLogs = async () => {
  const res = await API.get(`/logs`);
  return res.data;
};