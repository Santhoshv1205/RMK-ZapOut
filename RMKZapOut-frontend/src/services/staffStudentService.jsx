import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/staff`,
});

// Department students
export const fetchDepartmentStudents = (userId, role) =>
  API.get("/students/department", { params: { userId, role } });

// My counselling students
export const fetchMyStudents = (userId, role) =>
  API.get("/students/my", { params: { userId, role } });

// Assign student to logged-in staff
export const assignStudent = (studentId, staffUserId) =>
  API.post(`/students/${studentId}/assign`, { staffUserId });

// Unassign student
export const unassignStudent = (studentId) =>
  API.delete(`/students/${studentId}/unassign`);
