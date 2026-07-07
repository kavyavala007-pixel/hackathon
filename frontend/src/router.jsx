import { createBrowserRouter, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore.js';

// Pages
import Landing          from './pages/Landing.jsx';
import Login            from './pages/Login.jsx';
import Signup           from './pages/Signup.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import DoctorDashboard  from './pages/DoctorDashboard.jsx';
import HealthForm       from './pages/HealthForm.jsx';
import Predictions      from './pages/Predictions.jsx';
import Hospitals        from './pages/Hospitals.jsx';
import Doctors          from './pages/Doctors.jsx';
import Chat             from './pages/Chat.jsx';
import CreateHospital    from './pages/CreateHospital.jsx';
import Help              from './pages/Help.jsx';

// Guards
import ProtectedRoute   from './components/ProtectedRoute.jsx';

/**
 * Smart /dashboard redirect — sends to the correct dashboard based on role
 */
const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (user?.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

const router = createBrowserRouter([
  // Public
  { path: '/',       element: <Landing /> },
  { path: '/login',  element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/help',   element: <Help /> },

  // Protected — all authenticated users
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardRedirect /> },
      { path: '/hospitals', element: <Hospitals /> },
      { path: '/doctors',   element: <Doctors /> },
      { path: '/chat',      element: <Chat /> },
    ],
  },

  // Protected — patients only
  {
    element: <ProtectedRoute role="patient" />,
    children: [
      { path: '/health-form',  element: <HealthForm /> },
      { path: '/predictions',  element: <Predictions /> },
    ],
  },

  // Protected — doctors only
  {
    element: <ProtectedRoute role="doctor" />,
    children: [
      { path: '/doctors/patients', element: <DoctorDashboard /> },
      { path: '/hospitals/create', element: <CreateHospital /> },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
