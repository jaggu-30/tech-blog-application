import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/User.js';

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const existingUser = findUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please log in.',
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = findUserByEmail(email.toLowerCase().trim(), true);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: formatUser(req.user)
  });
}
