import express from 'express';
import axios from 'axios';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /predict
 * @desc    Send user health data to ML API and return risk
 * @access  Private (patient)
 */
router.post('/', protect, requireRole('patient'), async (req, res, next) => {
  try {
    console.log('ML URL:', process.env.ML_SERVICE_URL);

    const { age, bmi, symptoms, symptomDuration, additionalNotes } = req.body;
    
    if (!age || !bmi) {
      return res.status(400).json({
        success: false,
        message: 'age and bmi are required',
      });
    }

    const symptomList = symptoms || [];

    console.log('Sending to ML URL:', `${process.env.ML_SERVICE_URL}/predict`);
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict`,
      { 
        age, 
        bmi, 
        symptoms: symptomList,
        duration: symptomDuration,
        notes: additionalNotes 
      },
      { timeout: 5000 }
    );

    console.log('ML Response:', mlResponse.data);

    return res.status(200).json({
      success: true,
      riskResult: {
        riskScore: mlResponse.data.riskScore,
        predictedDisease: mlResponse.data.predictedDisease,
        confidence: mlResponse.data.confidence,
      },
    });

  } catch (error) {
    console.error('--- Prediction Error Details ---');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('-------------------------------');

    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
      return res.status(503).json({
        success: false,
        message: 'Prediction service unavailable (Connection Refused/Timeout). Please ensure ML server is running.',
      });
    }

    return res.status(500).json({
      success: false,
      message: `ML Service Error: ${error.response?.data?.detail?.[0]?.msg || error.message}`,
    });
  }
});

export default router;