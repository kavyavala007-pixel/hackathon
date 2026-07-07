import Patient from '../models/Patient.js';

/**
 * @route  POST /sync
 * @access Private (patient)
 *
 * Offline sync endpoint:
 * - Accepts locally-edited patient data from IndexedDB
 * - Resolves conflict using lastUpdated timestamp
 * - Only overwrites patient-editable fields (NOT doctor-added ML data)
 */
export const syncPatientData = async (req, res, next) => {
  try {
    const { age, height, weight, symptoms, consentGiven, lastUpdated } = req.body;

    if (!lastUpdated) {
      return res.status(400).json({ message: 'lastUpdated timestamp is required for sync' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const localTs = new Date(lastUpdated);
    const serverTs = new Date(patient.lastUpdated);

    // Conflict resolution: only update if local data is newer
    if (localTs <= serverTs) {
      return res.status(200).json({
        success: true,
        message: 'Server data is already up-to-date — no sync needed',
        data: patient,
        synced: false,
      });
    }

    // Update ONLY patient-editable fields — never overwrite ML/doctor fields
    const patientEditableFields = {};
    if (age !== undefined) patientEditableFields.age = age;
    if (height !== undefined) patientEditableFields.height = height;
    if (weight !== undefined) patientEditableFields.weight = weight;
    if (symptoms !== undefined) patientEditableFields.symptoms = symptoms;
    if (consentGiven !== undefined) patientEditableFields.consentGiven = consentGiven;
    patientEditableFields.lastUpdated = localTs;

    Object.assign(patient, patientEditableFields);
    await patient.save(); // triggers BMI pre-save hook

    res.status(200).json({
      success: true,
      message: 'Data synced successfully',
      data: patient,
      synced: true,
    });
  } catch (error) {
    next(error);
  }
};
