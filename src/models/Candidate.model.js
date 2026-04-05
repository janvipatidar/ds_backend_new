import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    education: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    noticePeriod: {
      type: String,
      required: true,
      enum: ['Immediate', '15 days', '1 month', '2 months', '3 months', '6 months'],
    },
    currentEmployer: {
      type: String,
      trim: true,
      index: 'text',
    },
    previousEmployer: {
      type: String,
      trim: true,
    },
    keySkills: {
      type: [String],
      default: [],
      index: 'text',
    },
    currentLocation: {
      type: String,
      trim: true,
      index: true,
    },
    currentIndustry: {
      type: String,
      trim: true,
      index: true,
    },
    pastIndustry: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    currentAnnualSalary: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

candidateSchema.index({ experience: 1 });
// currentLocation: index already set on the field definition
candidateSchema.index({ currentAnnualSalary: 1 });
candidateSchema.index({ noticePeriod: 1 });
candidateSchema.index({ currentIndustry: 1, pastIndustry: 1 });
candidateSchema.index({ keySkills: 1 });

candidateSchema.index(
  { name: 'text', designation: 'text', keySkills: 'text', currentEmployer: 'text' },
  { default_language: 'english' }
);

export const Candidate = mongoose.model('Candidate', candidateSchema);
