import api from './api.js';

/** List hospitals with optional filters */
export const getHospitals = async ({ speciality, search, page = 1 } = {}) => {
  const params = {};
  if (speciality) params.speciality = speciality;
  if (search) params.search = search;
  params.page = page;
  const response = await api.get('/hospitals', { params });
  return response.data;
};

/** Get a single hospital by ID */
export const getHospitalById = async (id) => {
  const response = await api.get(`/hospitals/${id}`);
  return response.data.data;
};

/** List doctors with optional filters */
export const getDoctors = async ({ specialization, hospitalId } = {}) => {
  const params = {};
  if (specialization) params.specialization = specialization;
  if (hospitalId) params.hospitalId = hospitalId;
  const response = await api.get('/hospitals/doctors/list', { params });
  return response.data.data;
};

/** Allow a doctor to join a hospital */
export const joinHospital = async (hospitalId) => {
  const response = await api.post('/doctor/hospital', { hospitalId });
  return response.data;
};
