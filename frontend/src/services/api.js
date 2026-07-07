import axios from 'axios';
import useAuthStore from '../store/authStore.js';

// Setup Mock Database in LocalStorage
const getMockUsers = () => {
  const users = localStorage.getItem('mock_users');
  if (!users) {
    const defaultUsers = [
      { id: 'patient-123', name: 'Demo Patient', email: 'patient@demo.com', role: 'patient', phone: '1234567890' },
      { id: 'doctor-123', name: 'Dr. Smith', email: 'doctor@demo.com', role: 'doctor', phone: '0987654321', specialization: 'Cardiology', experience: '10' }
    ];
    localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(users);
};
const saveMockUser = (user) => {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem('mock_users', JSON.stringify(users));
};

const getMockPatientData = (userId) => {
  const allData = JSON.parse(localStorage.getItem('mock_patient_data') || '{}');
  return allData[userId] || {
    bloodSugar: 90,
    systolicBP: 120,
    diastolicBP: 80,
    cholesterol: 180,
    bmi: 22.5,
    heartRate: 72,
    physicalActivity: 30,
    age: 35,
    gender: 'male',
  };
};

const saveMockPatientData = (userId, data) => {
  const allData = JSON.parse(localStorage.getItem('mock_patient_data') || '{}');
  allData[userId] = { ...(allData[userId] || {}), ...data };
  localStorage.setItem('mock_patient_data', JSON.stringify(allData));
  return allData[userId];
};

const getMockMessages = (userId, otherId) => {
  const key = [userId, otherId].sort().join('_');
  const allMessages = JSON.parse(localStorage.getItem('mock_messages') || '{}');
  return allMessages[key] || [
    { id: 1, senderId: otherId, receiverId: userId, content: "Hello! How can I help you today?", createdAt: new Date(Date.now() - 3600000).toISOString() }
  ];
};

const addMockMessage = (senderId, receiverId, content) => {
  const key = [senderId, receiverId].sort().join('_');
  const allMessages = JSON.parse(localStorage.getItem('mock_messages') || '{}');
  if (!allMessages[key]) allMessages[key] = [];
  const newMessage = {
    id: Date.now(),
    senderId,
    receiverId,
    content,
    createdAt: new Date().toISOString()
  };
  allMessages[key].push(newMessage);
  localStorage.setItem('mock_messages', JSON.stringify(allMessages));
  return newMessage;
};

// Setup Mock Database in LocalStorage for Hospitals
const getMockHospitals = () => {
  const custom = JSON.parse(localStorage.getItem('mock_hospitals') || '[]');
  const defaultHospitals = [
    { id: '1', name: 'Metro General Hospital', address: '123 Health Ave, Cityville', speciality: 'Cardiology', lat: 40.7128, lng: -74.0060, phone: '555-0199', rating: 4.8 },
    { id: '2', name: 'St. Jude Medical Center', address: '456 Wellness Blvd, Metro City', speciality: 'Pediatrics', lat: 40.7258, lng: -74.0180, phone: '555-0188', rating: 4.6 },
    { id: '3', name: 'Care First Clinic', address: '789 Care Rd, Suburbia', speciality: 'General Medicine', lat: 40.7018, lng: -73.9980, phone: '555-0177', rating: 4.2 },
  ];
  return [...defaultHospitals, ...custom];
};

const saveMockHospital = (hosp) => {
  const custom = JSON.parse(localStorage.getItem('mock_hospitals') || '[]');
  custom.push(hosp);
  localStorage.setItem('mock_hospitals', JSON.stringify(custom));
};

const MOCK_DOCTORS = [
  { id: 'doc1', name: 'Dr. Sarah Connor', specialization: 'Cardiology', hospitalId: '1', experience: 12, rating: 4.9 },
  { id: 'doc2', name: 'Dr. John Doe', specialization: 'Pediatrics', hospitalId: '2', experience: 8, rating: 4.7 },
  { id: 'doc3', name: 'Dr. Alan Grant', specialization: 'General Medicine', hospitalId: '3', experience: 15, rating: 4.5 },
];

// Helper to extract JWT token payload
const getUserFromToken = (token) => {
  if (!token) return null;
  const users = getMockUsers();
  // Find user by matching token
  const found = users.find(u => token.includes(u.email));
  if (found) return found;
  // Fallback
  return { id: 'patient-123', name: 'Demo Patient', email: 'patient@demo.com', role: 'patient' };
};

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Custom Axios Adapter for Mocking Backend
api.defaults.adapter = async (config) => {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  
  // Parse body
  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch (e) {
      body = {};
    }
  }

  // Get current user from Auth Store (via Authorization header)
  const token = config.headers.Authorization ? config.headers.Authorization.replace('Bearer ', '') : null;
  const currentUser = token ? getUserFromToken(token) : null;

  // Delay to simulate network latency
  await new Promise(r => setTimeout(r, 150));

  let responseData = null;
  let status = 200;

  // Route Handling
  if (url.endsWith('/auth/register') && method === 'post') {
    const { name, email, password, role, phone, specialization, experience } = body;
    const users = getMockUsers();
    if (users.find(u => u.email === email)) {
      return {
        data: { message: 'User already exists' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config
      };
    }
    const newUser = { id: 'mock-user-' + Date.now(), name, email, role: role || 'patient', phone, specialization, experience };
    saveMockUser(newUser);
    responseData = { token: `mock-token-${email}-${Date.now()}`, user: newUser };
  } 
  else if (url.endsWith('/auth/login') && method === 'post') {
    const { email, password } = body;
    const users = getMockUsers();
    let user = users.find(u => u.email === email);
    if (!user) {
      // Auto-create user for testing convenience
      user = { id: 'mock-user-' + Date.now(), name: email.split('@')[0], email, role: email.includes('doctor') ? 'doctor' : 'patient' };
      saveMockUser(user);
    }
    responseData = { token: `mock-token-${email}-${Date.now()}`, user };
  } 
  else if (url.endsWith('/auth/me') && method === 'get') {
    if (!currentUser) {
      status = 401;
      responseData = { message: 'Unauthorized' };
    } else {
      responseData = { user: currentUser };
    }
  } 
  else if (url.endsWith('/patient/data') && method === 'get') {
    const userId = currentUser ? currentUser.id : 'demo-patient';
    responseData = { data: getMockPatientData(userId) };
  } 
  else if (url.endsWith('/patient/update') && method === 'post') {
    const userId = currentUser ? currentUser.id : 'demo-patient';
    const updated = saveMockPatientData(userId, body);
    responseData = { data: updated };
  } 
  else if (url.endsWith('/predict') && method === 'post') {
    const glucose = Number(body.bloodSugar || 90);
    const sys = Number(body.systolicBP || 120);
    const bmi = Number(body.bmi || 22.5);
    
    let riskLevel = 'Low Risk';
    let recommendations = ['Maintain your healthy lifestyle.', 'Exercise regularly for 30 minutes daily.'];

    if (glucose > 140 || sys > 140 || bmi > 30) {
      riskLevel = 'High Risk';
      recommendations = [
        'Consult with a physician immediately.',
        'Monitor blood sugar levels multiple times a day.',
        'Adopt a low-sodium, low-glycemic index diet.',
        'Schedule a cardiovascular check-up.'
      ];
    } else if (glucose > 100 || sys > 130 || bmi > 25) {
      riskLevel = 'Moderate Risk';
      recommendations = [
        'Limit sugar and processed carb intake.',
        'Aim for at least 150 minutes of aerobic exercise per week.',
        'Re-test your vitals in 2-4 weeks.'
      ];
    }

    responseData = {
      riskResult: {
        riskLevel,
        recommendations,
        timestamp: new Date().toISOString(),
        metrics: body
      }
    };
  } 
  else if (url.includes('/hospitals/') && !url.includes('/doctors/list') && method === 'get') {
    const id = url.split('/').pop();
    const list = getMockHospitals();
    const hosp = list.find(h => h.id === id) || list[0];
    responseData = { data: hosp };
  } 
  else if (url.endsWith('/hospitals') && method === 'get') {
    responseData = { data: getMockHospitals() };
  } 
  else if (url.endsWith('/hospitals/doctors/list') && method === 'get') {
    responseData = { data: MOCK_DOCTORS };
  } 
  else if (url.endsWith('/doctor/patients') && method === 'get') {
    responseData = { data: [
      { _id: 'pat1', name: 'John Doe', email: 'john@example.com', role: 'patient' },
      { _id: 'pat2', name: 'Jane Smith', email: 'jane@example.com', role: 'patient' },
    ] };
  } 
  else if (url.endsWith('/doctor/hospital') && method === 'post') {
    const { hospitalId, newHospital } = body;
    if (newHospital) {
      const created = {
        id: 'hosp-' + Date.now(),
        name: newHospital.name,
        address: newHospital.address,
        speciality: Array.isArray(newHospital.specialities) ? newHospital.specialities[0] : (newHospital.specialities || 'General'),
        lat: newHospital.lat,
        lng: newHospital.lng,
        phone: newHospital.phone,
        rating: 5.0,
      };
      saveMockHospital(created);
      responseData = { success: true, message: 'Hospital created successfully', data: created };
    } else {
      responseData = { success: true, message: 'Joined hospital successfully' };
    }
  } 
  else if (url.includes('/chat/') && method === 'get') {
    const otherId = url.split('/').pop();
    const myId = currentUser ? currentUser.id : 'me';
    responseData = { data: getMockMessages(myId, otherId) };
  } 
  else if (url.endsWith('/chat') && method === 'post') {
    const { receiverId, content } = body;
    const myId = currentUser ? currentUser.id : 'me';
    const msg = addMockMessage(myId, receiverId, content);
    responseData = { data: msg };
  } 
  else {
    responseData = { message: 'Mock endpoint fallback response', data: {} };
  }

  if (status >= 400) {
    throw Object.assign(new Error(responseData.message || 'Request failed'), {
      response: {
        data: responseData,
        status,
        statusText: status === 401 ? 'Unauthorized' : 'Bad Request',
        headers: {},
        config
      }
    });
  }

  return {
    data: responseData,
    status,
    statusText: 'OK',
    headers: {},
    config
  };
};

export default api;
