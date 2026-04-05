import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { config } from '../config/env.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/AppError.js';
export class AuthService {
    async register(name, email, password) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        const tokens = this.generateTokens({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            },
            tokens,
        };
    }
    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }
        if (!user.isActive) {
            throw new UnauthorizedError('Account is inactive');
        }
        const tokens = this.generateTokens({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            },
            tokens,
        };
    }
    async getUserById(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new BadRequestError('User not found');
        }
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.secret);
            const tokens = this.generateTokens({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            });
            return tokens;
        }
        catch {
            throw new UnauthorizedError('Invalid refresh token');
        }
    }
    generateTokens(user) {
        const payload = { id: user.id, email: user.email, role: user.role };
        const secret = config.jwt.secret;
        const token = jwt.sign(payload, secret, { expiresIn: '7d' });
        const refreshToken = jwt.sign(payload, secret, { expiresIn: '30d' });
        return { token, refreshToken };
    }
}
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map