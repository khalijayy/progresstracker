import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Signup: create user, hash password, return token + user (safe fields)
export const signup = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Basic validation
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        // Check existing user by email
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: 'Email already registered' });

        // Create username fallback
        const userName = username || (name ? name.split(' ')[0] : email.split('@')[0]);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ username: userName, fullName: name, email, password: hashed });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

  res.status(201).json({ token, user: { _id: user._id, username: user.username, fullName: user.fullName, email: user.email } });
    } catch (error) {
        console.error('Signup error', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

// Login: verify credentials and return token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'Account not found. Please check your email or sign up for a new account.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ 
        message: 'Incorrect password. Please try again.',
        code: 'INVALID_PASSWORD'
      });
    }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  res.json({ token, user: { _id: user._id, username: user.username, fullName: user.fullName, email: user.email } });
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};