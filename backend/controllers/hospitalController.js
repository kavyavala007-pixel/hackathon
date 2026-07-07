import Hospital from '../models/Hospital.js';
import Doctor from '../models/Doctor.js';

/**
 * @route  GET /hospitals
 * @access Private
 * List hospitals with optional speciality filter & search
 */
export const getHospitals = async (req, res, next) => {
  try {
    const { speciality, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (speciality) query.specialities = { $regex: speciality, $options: 'i' };
    if (search) query.name = { $regex: search, $options: 'i' };

    const hospitals = await Hospital.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Hospital.countDocuments(query);

    res.status(200).json({
      success: true,
      data: hospitals,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /hospitals/:id
 * @access Private
 */
export const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /doctors
 * @access Private
 * List doctors with optional specialization filter
 */
export const getDoctors = async (req, res, next) => {
  try {
    const { specialization, hospitalId } = req.query;
    const query = {};
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (hospitalId) query.hospitalId = hospitalId;

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone')
      .populate('hospitalId', 'name address');

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};
export const createHospital = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create hospitals' });
    }

    const { name, address, phone, email, specialities, lat, lng } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Hospital name is required' });
    }

    const hospitalData = {
      name,
      address,
      phone,
      email,
      specialities: specialities || [],
    };

    if (lat && lng) {
      hospitalData.coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    const hospital = await Hospital.create(hospitalData);

    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    next(error);
  }
};