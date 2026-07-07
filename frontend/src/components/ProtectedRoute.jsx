import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

/**
 * ProtectedRoute — wraps routes that require authentication
 * Optionally restrict to a specific role: role="patient" or role="doctor"
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<PatientDashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute role="doctor" />}>
 *     <Route path="/doctor/patients" element={<DoctorPatients />} />
 *   </Route>
 */
import { Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
