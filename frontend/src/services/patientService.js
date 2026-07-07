import api from './api.js';

/** Get logged-in patient's data */
export const getPatientData = async () => {
  const response = await api.get('/patient/data');
  return response.data.data;
};

/** Update patient health fields */
export const updatePatientData = async (fields) => {
  const response = await api.post('/patient/update', fields);
  return response.data.data;
};

/** Request ML prediction */
export const predictDisease = async (data) => {
  const response = await api.post('/predict', data);
  return response.data.riskResult;
};
