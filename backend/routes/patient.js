import express from 'express';
import { getPatientData, updatePatientData } from '../controllers/patientController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('patient'));

router.get('/data', getPatientData);
router.post('/update', updatePatientData);

export default router;
