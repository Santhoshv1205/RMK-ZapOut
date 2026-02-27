import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/admin/watchman", // change if backend path differs
});

/* -------- GET ALL -------- */
export const fetchWatchmen = async () => {
  const res = await API.get("/");
  return res.data;
};

/* -------- CREATE -------- */
export const createWatchman = async (data) => {
  const res = await API.post("/", data);
  return res.data;
};

/* -------- UPDATE -------- */
export const updateWatchman = async (id, adminId, data) => {
  const res = await API.put(`/${id}?adminId=${adminId}`, data);
  return res.data;
};

/* -------- DELETE -------- */
export const deleteWatchman = async (id, adminId) => {
  const res = await API.delete(`/${id}?adminId=${adminId}`);
  return res.data;
};