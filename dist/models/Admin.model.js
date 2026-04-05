import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['super_admin', 'recruiter'],
        default: 'recruiter',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
// Index for authentication queries
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
// Static method to seed default admin
adminSchema.statics.seedDefaultAdmin = async function () {
    const exists = await this.findOne({ email: 'admin@recruiter.com' });
    if (!exists) {
        await this.create({
            username: 'admin',
            email: 'admin@recruiter.com',
            password: 'admin123',
            role: 'super_admin',
        });
        console.log('Default admin seeded successfully');
    }
};
export const Admin = mongoose.model('Admin', adminSchema);
//# sourceMappingURL=Admin.model.js.map