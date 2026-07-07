import express from 'express';
import { syncPatientData } from '../controllers/syncController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, requireRole('patient'), syncPatientData);

export default router;
