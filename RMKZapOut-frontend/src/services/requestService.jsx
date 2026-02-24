import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/requests`;

/* ================= STUDENT ================= */
export const fetchStudentRequests = (userId) =>
  axios.get(`${API}/student/${userId}`);

export const cancelRequest = (requestId) =>
  axios.delete(`${API}/${requestId}`);

export const updateRequest = (requestId, data) =>
  axios.put(`${API}/${requestId}`, data);

/* ================= STAFF ================= */
export const fetchStaffRequests = (staffId, role) => {
  if (!staffId || !role) {
    return Promise.resolve({ data: { requests: [] } });
  }
  return axios.get(`${API}/staff/${staffId}/${role}`);
};

export const updateRequestStatus = (
  requestId,
  role,
  action,
  staffId,
  rejectionReason = null
) =>
  axios.put(`${API}/staff/request/${requestId}/status`, {
    role,
    action,
    staffId,
    rejectionReason,
  });
