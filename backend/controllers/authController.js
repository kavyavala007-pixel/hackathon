import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import generateToken from '../utils/generateToken.js';

/**
 * @route  POST /auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;
    const role = req.body.role;
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : undefined;
    const specialization =
      typeof req.body.specialization === 'string' ? req.body.specialization.trim() : '';
    const experience = req.body.experience;

    // Check for required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role,
      ...(phone ? { phone } : {}),
    });

    // Create role-specific profile
    if (role === 'patient') {
      await Patient.create({ userId: user._id });
    } else if (role === 'doctor') {
      if (!specialization) {
        await user.deleteOne();
        return res.status(400).json({ message: 'Specialization is required for doctors' });
      }
      await Doctor.create({ userId: user._id, specialization, experience: experience || 0 });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};
