import express from 'express';
import {
  getDoctorProfile,
  setHospital,
  getConsentedPatients,
} from '../controllers/doctorController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('doctor'));

router.get('/profile', getDoctorProfile);
router.post('/hospital', setHospital);
router.get('/patients', getConsentedPatients);

export default router;
