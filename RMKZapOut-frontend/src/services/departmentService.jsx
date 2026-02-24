import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/departments`;

export const fetchDepartments = () => axios.get(API);

export const createDepartment = (data) =>
  axios.post(API, data);

export const updateDepartment = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteDepartment = (id) =>
  axios.delete(`${API}/${id}`);
