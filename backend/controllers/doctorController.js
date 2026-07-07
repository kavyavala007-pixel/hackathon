import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import Patient from '../models/Patient.js';

/**
 * @route  GET /doctor/profile
 * @access Private (doctor)
 */
export const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone')
      .populate('hospitalId');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /doctor/hospital
 * @access Private (doctor)
 * Associate doctor with an existing or new hospital
 */
export const setHospital = async (req, res, next) => {
  try {
    const { hospitalId, newHospital } = req.body;

    let hospital;
    if (hospitalId) {
      hospital = await Hospital.findById(hospitalId);
      if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    } else if (newHospital) {
      // Map flat lat/lng from frontend to nested coordinates for schema
      const { lat, lng, ...rest } = newHospital;
      const hospitalData = { ...rest, createdBy: req.user._id };
      
      if (lat && lng) {
        hospitalData.coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
      }
      
      hospital = await Hospital.create(hospitalData);
    } else {
      return res.status(400).json({ message: 'Provide hospitalId or newHospital data' });
    }

    await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { hospitalId: hospital._id },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Hospital set successfully', hospital });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /doctor/patients
 * @access Private (doctor)
 * View patients who have given consent (Phase 3 fully implements this)
 */
export const getConsentedPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ consentGiven: true }).populate(
      'userId',
      'name email phone'
    );
    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};
