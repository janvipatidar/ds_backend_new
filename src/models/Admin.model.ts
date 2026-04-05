import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'recruiter';
  isActive: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

interface IAdminModel extends Model<IAdmin> {
  seedDefaultAdmin(): Promise<void>;
}

const adminSchema = new Schema<IAdmin, IAdminModel>(
  {
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
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for authentication queries
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });

// Virtual for locked status
adminSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > new Date();
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
adminSchema.methods.incrementLoginAttempts = async function () {
  // If already locked, don't increment
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.resetLoginAttempts();
  }

  const updates: Record<string, unknown> = { $inc: { loginAttempts: 1 } };

  // Lock after 5 failed attempts for 30 minutes
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: new Date(Date.now() + 30 * 60 * 1000) }; // 30 minutes
  }

  await this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = async function () {
  await this.updateOne({
    $set: { loginAttempts: 0, lockUntil: null },
  });
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

// Static method to create new admin (only super_admin can do this)
adminSchema.statics.createAdmin = async function (data: {
  username: string;
  email: string;
  password: string;
  role?: 'super_admin' | 'recruiter';
}) {
  const existing = await this.findOne({ email: data.email });
  if (existing) {
    throw new Error('Admin with this email already exists');
  }
  
  return this.create({
    username: data.username,
    email: data.email,
    password: data.password,
    role: data.role || 'recruiter',
  });
};

export const Admin = mongoose.model<IAdmin, IAdminModel>('Admin', adminSchema);
