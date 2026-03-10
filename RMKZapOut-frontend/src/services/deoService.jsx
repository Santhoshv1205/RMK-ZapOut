// src/services/deoService.jsx

import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/deo`;

/* ===========================
   GET DEO PROFILE
=========================== */
export const getDeoProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching DEO profile:", error);
    throw error;
  }
};

/* ===========================
   UPDATE DEO PROFILE
=========================== */
export const updateDeoProfile = async (userId, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/${userId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating DEO profile:", error);
    throw error;
  }
};

/* ===========================
   GET ALL REQUESTS (On-Duty + Gate Pass)
=========================== */
export const getDeoRequests = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/requests/${userId}`);
    return response.data; 
    // returns:
    // {
    //   onDutyRequests: [],
    //   gatePassRequests: []
    // }
  } catch (error) {
    console.error("Error fetching DEO requests:", error);
    throw error;
  }
};

export const getDeoDashboardStats = async (userId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/deo/dashboard/${userId}`
  );
  return response.data;
};

export const fetchDepartmentStudents = (userId) => {
  return axios.get(`${API_URL}/students/${userId}`);
};
/* ===========================
   GET SINGLE STUDENT DETAILS
=========================== */
export const getDeoStudentById = async (studentId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/students/${studentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student details:", error);
    throw error;
  }
};
