import Patient from '../models/Patient.js';

/**
 * @route  GET /patient/data
 * @access Private (patient)
 * Get the logged-in patient's full profile
 */
export const getPatientData = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /patient/update
 * @access Private (patient)
 * Update patient health data (patient-editable fields only)
 */
export const updatePatientData = async (req, res, next) => {
  try {
    // Phase 2 fields — stubs for now
    const { 
      age, height, weight, symptoms, consentGiven, 
      riskScore, predictedDisease, confidence,
      symptomDuration, additionalNotes 
    } = req.body;
 
    const updateFields = {};
    if (age !== undefined) updateFields.age = age;
    if (height !== undefined) updateFields.height = height;
    if (weight !== undefined) updateFields.weight = weight;
    if (symptoms !== undefined) updateFields.symptoms = symptoms;
    if (consentGiven !== undefined) updateFields.consentGiven = consentGiven;
    if (symptomDuration !== undefined) updateFields.symptomDuration = symptomDuration;
    if (additionalNotes !== undefined) updateFields.additionalNotes = additionalNotes;
 
    // ML prediction outputs
    if (riskScore !== undefined) updateFields.riskScore = riskScore;
    if (predictedDisease !== undefined) updateFields.predictedDisease = predictedDisease;
    if (confidence !== undefined) updateFields.confidence = confidence;
    updateFields.lastUpdated = new Date();

    // BMI auto-calc is handled in pre-save hook when using save()
    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    Object.assign(patient, updateFields);
    await patient.save(); // triggers pre-save BMI hook

    res.status(200).json({ success: true, message: 'Health data updated', data: patient });
  } catch (error) {
    next(error);
  }
};
