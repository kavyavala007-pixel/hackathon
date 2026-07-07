import express from 'express';
import {
  getHospitals,
  getHospitalById,
  getDoctors,
} from '../controllers/hospitalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Static paths must be registered before `/:id` so "doctors" is not parsed as an ObjectId.
router.get('/doctors/list', getDoctors);
router.get('/', getHospitals);
router.get('/:id', getHospitalById);

export default router;
