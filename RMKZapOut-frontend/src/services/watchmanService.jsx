import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/watchman", // change if needed
});

// 🔹 IMPORTANT: return res.data
export const getStudentByRegisterNumber = async (registerNumber) => {
  const res = await API.get(`/${registerNumber}`);
  return res.data;
};