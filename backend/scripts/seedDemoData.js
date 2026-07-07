/**
 * Seeds demo hospitals + demo patient/doctor accounts so the UI has real data to show.
 * Run: npm run seed   (from backend/)
 *
 * Demo logins (after seed):
 *   Patient — demo.patient@medai.local / medai123
 *   Doctor  — demo.doctor@medai.local  / medai123
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const DEMO_PATIENT_EMAIL = 'demo.patient@medai.local';
const DEMO_DOCTOR_EMAIL = 'demo.doctor@medai.local';
const DEMO_PASSWORD = 'medai123';

const SAMPLE_HOSPITALS = [
  {
    name: 'MedAI City General Hospital',
    address: 'Connaught Place, New Delhi, India',
    phone: '+91-11-4000-1000',
    email: 'info@medaicity.example',
    specialities: ['General Medicine', 'Cardiology', 'Emergency'],
    coordinates: { lat: 28.6315, lng: 77.2167 },
  },
  {
    name: 'Apollo Preventive Care Centre',
    address: 'Bandra West, Mumbai, India',
    phone: '+91-22-4000-2000',
    email: 'care@apolloprev.example',
    specialities: ['Cardiology', 'Radiology', 'General Medicine'],
    coordinates: { lat: 19.0596, lng: 72.8295 },
  },
  {
    name: 'Rainbow Children’s Hospital',
    address: 'Banjara Hills, Hyderabad, India',
    phone: '+91-40-4000-3000',
    email: 'hello@rainbowkids.example',
    specialities: ['Pediatrics', 'General Medicine'],
    coordinates: { lat: 17.4239, lng: 78.4738 },
  },
  {
    name: 'NeuroCare Institute',
    address: 'Indiranagar, Bengaluru, India',
    phone: '+91-80-4000-4000',
    email: 'contact@neurocare.example',
    specialities: ['Neurology', 'Psychiatry', 'Radiology'],
    coordinates: { lat: 12.9719, lng: 77.6412 },
  },
];

async function seedHospitals() {
  let created = 0;
  for (const h of SAMPLE_HOSPITALS) {
    const exists = await Hospital.findOne({ name: h.name });
    if (exists) continue;
    await Hospital.create(h);
    created += 1;
  }
  console.log(`Hospitals: ${created} created, ${SAMPLE_HOSPITALS.length - created} already present.`);
  return Hospital.findOne({ name: SAMPLE_HOSPITALS[0].name });
}

async function seedDemoUsers(primaryHospital) {
  let patientUser = await User.findOne({ email: DEMO_PATIENT_EMAIL });
  if (!patientUser) {
    patientUser = await User.create({
      name: 'Demo Patient',
      email: DEMO_PATIENT_EMAIL,
      password: DEMO_PASSWORD,
      role: 'patient',
      phone: '+91-90000-00001',
    });
    await Patient.create({
      userId: patientUser._id,
      age: 42,
      height: 172,
      weight: 82,
      symptoms: ['Fatigue', 'Frequent Urination', 'Excessive Thirst'],
      symptomDuration: 14,
      additionalNotes: 'Family history of diabetes. Desk job, moderate stress.',
      riskScore: 0.42,
      predictedDisease: 'Type 2 Diabetes',
      confidence: 68,
      consentGiven: true,
    });
    console.log(`Created demo patient: ${DEMO_PATIENT_EMAIL}`);
  } else {
    await Patient.findOneAndUpdate(
      { userId: patientUser._id },
      {
        $set: {
          age: 42,
          height: 172,
          weight: 82,
          bmi: 27.7,
          symptoms: ['Fatigue', 'Frequent Urination', 'Excessive Thirst'],
          symptomDuration: 14,
          additionalNotes: 'Family history of diabetes. Desk job, moderate stress.',
          consentGiven: true,
        },
      }
    );
    console.log(`Demo patient already exists — profile refreshed: ${DEMO_PATIENT_EMAIL}`);
  }

  let doctorUser = await User.findOne({ email: DEMO_DOCTOR_EMAIL });
  if (!doctorUser) {
    doctorUser = await User.create({
      name: 'Demo Doctor',
      email: DEMO_DOCTOR_EMAIL,
      password: DEMO_PASSWORD,
      role: 'doctor',
      phone: '+91-90000-00002',
    });
    await Doctor.create({
      userId: doctorUser._id,
      specialization: 'Cardiology',
      experience: 12,
      hospitalId: primaryHospital?._id ?? null,
      bio: 'Demo cardiologist for hackathon demos and UI testing.',
    });
    console.log(`Created demo doctor: ${DEMO_DOCTOR_EMAIL}`);
  } else {
    await Doctor.findOneAndUpdate(
      { userId: doctorUser._id },
      {
        $set: {
          specialization: 'Cardiology',
          experience: 12,
          hospitalId: primaryHospital?._id ?? null,
          bio: 'Demo cardiologist for hackathon demos and UI testing.',
        },
      }
    );
    console.log(`Demo doctor already exists — profile refreshed: ${DEMO_DOCTOR_EMAIL}`);
  }
}

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const primaryHospital = await seedHospitals();
  await seedDemoUsers(primaryHospital);

  console.log('\n✅ Seed complete.');
  console.log('Log in with:');
  console.log(`  Patient  ${DEMO_PATIENT_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Doctor   ${DEMO_DOCTOR_EMAIL} / ${DEMO_PASSWORD}`);
  console.log('\nEnsure ML service is running for live predictions (optional).\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
