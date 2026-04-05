import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
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

// email and username indexes come from unique: true on those fields

// True while lockUntil is in the future
adminSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > new Date();
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.resetLoginAttempts();
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: new Date(Date.now() + 30 * 60 * 1000) };
  }

  await this.updateOne(updates);
};

adminSchema.methods.resetLoginAttempts = async function () {
  await this.updateOne({
    $set: { loginAttempts: 0, lockUntil: null },
  });
};

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

adminSchema.statics.createAdmin = async function (data) {
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

export const Admin = mongoose.model('Admin', adminSchema);
