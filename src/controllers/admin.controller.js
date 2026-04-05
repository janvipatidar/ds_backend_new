import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.model.js';
import { AppError } from '../utils/AppError.js';
import config from '../config/env.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      throw new AppError('Invalid email or password', 401);
    }

    if (admin.isLocked) {
      throw new AppError(
        'Account is temporarily locked due to too many failed login attempts. Try again later.',
        401
      );
    }

    if (!admin.isActive) {
      throw new AppError('Your account has been deactivated. Contact administrator.', 401);
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      await admin.incrementLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }

    await admin.resetLoginAttempts();

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: admin.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user?.id);

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user?.id;

    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current and new password', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    const admin = await Admin.findById(adminId).select('+password');

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
