import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: { type: Number, min: 0, max: 150 },
    height: { type: Number, min: 0 }, // cm
    weight: { type: Number, min: 0 }, // kg
    bmi: { type: Number }, // calculated: weight / (height/100)^2
    symptoms: [{ type: String }],
    symptomDuration: { type: Number, default: 0 }, // in days
    additionalNotes: { type: String, trim: true },
    history: [
      {
        condition: String,
        diagnosedAt: Date,
        notes: String,
      },
    ],
    // ML prediction outputs
    riskScore: { type: Number, min: 0, max: 1, default: null },
    predictedDisease: { type: String, default: null },
    confidence: { type: Number, min: 0, max: 100, default: null },
    // Offline sync
    lastUpdated: { type: Date, default: Date.now },
    // Consent for doctors to view data
    consentGiven: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-calculate BMI before save
patientSchema.pre('save', function (next) {
  if (this.height && this.weight) {
    const heightM = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightM * heightM)).toFixed(2));
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
