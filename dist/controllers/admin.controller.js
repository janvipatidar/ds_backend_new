import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.model.js';
import { AppError } from '../utils/AppError.js';
import config from '../config/env.js';
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            throw new AppError('Please provide email and password', 400);
        }
        // Find admin with password
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            throw new AppError('Invalid credentials', 401);
        }
        // Check if admin is active
        if (!admin.isActive) {
            throw new AppError('Your account has been deactivated', 401);
        }
        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
        // Generate JWT
        const token = jwt.sign({ id: admin._id.toString(), email: admin.email, role: admin.role }, config.jwt.secret, { expiresIn: '24h' });
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
    }
    catch (error) {
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
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=admin.controller.js.map