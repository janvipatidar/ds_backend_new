import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { Candidate } from '../models/Candidate.model.js';
import { AppError } from '../utils/AppError.js';

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only Excel files are allowed', 400));
    }
  },
});

export const uploadMiddleware = upload.single('file');

interface ExcelRow {
  Name?: string;
  Designation?: string;
  'Date of Birth'?: string;
  Education?: string;
  Experience?: number | string;
  'Notice Period'?: string;
  'Current Employer'?: string;
  'Previous Employer'?: string;
  'Key Skills'?: string;
  'Current Location'?: string;
  'Current Industry'?: string;
  'Past Industry'?: string;
  Email?: string;
  Phone?: string;
  'Current Annual Salary'?: number | string;
  [key: string]: unknown;
}

export const uploadExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<ExcelRow>(worksheet);

    if (data.length === 0) {
      throw new AppError('Excel file is empty', 400);
    }

    // Transform and validate data
    const candidates = data.map((row) => ({
      name: row.Name || row.name || '',
      designation: row.Designation || row.designation || '',
      dateOfBirth: row['Date of Birth'] || row.dateOfBirth || row['Date of birth'] || '',
      education: row.Education || row.education || '',
      experience: Number(row.Experience || row.experience || 0),
      noticePeriod: row['Notice Period'] || row.noticePeriod || '1 month',
      currentEmployer: row['Current Employer'] || row.currentEmployer || '',
      previousEmployer: row['Previous Employer'] || row.previousEmployer || '',
      keySkills: row['Key Skills']
        ? String(row['Key Skills']).split(',').map((s) => s.trim())
        : [],
      currentLocation: row['Current Location'] || row.currentLocation || '',
      currentIndustry: row['Current Industry'] || row.currentIndustry || '',
      pastIndustry: row['Past Industry'] || row.pastIndustry || '',
      email: row.Email || row.email || '',
      phone: row.Phone || row.phone || '',
      currentAnnualSalary: Number(
        row['Current Annual Salary'] || row.currentAnnualSalary || row['Current Annual'] || 0
      ),
    }));

    // Validate required fields
    const validCandidates = candidates.filter(
      (c) => c.name && c.designation && c.email && c.phone
    );

    if (validCandidates.length === 0) {
      throw new AppError('No valid candidates found in the Excel file', 400);
    }

    // Insert into database (upsert by email)
    let insertedCount = 0;
    for (const candidate of validCandidates) {
      const existing = await Candidate.findOne({ email: candidate.email });
      if (!existing) {
        await Candidate.create(candidate);
        insertedCount++;
      } else {
        // Update existing
        await Candidate.findOneAndUpdate({ email: candidate.email }, candidate);
        insertedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${validCandidates.length} candidates`,
      data: {
        processed: validCandidates.length,
        inserted: insertedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      experienceMin,
      experienceMax,
      location,
      skills,
      currentCompany,
      salaryMin,
      salaryMax,
      noticePeriod,
      industry,
    } = req.query;

    // Build filter query (same as getCandidates)
    const query: Record<string, unknown> = {};

    if (experienceMin || experienceMax) {
      query.experience = {};
      if (experienceMin) (query.experience as Record<string, number>).$gte = Number(experienceMin);
      if (experienceMax) (query.experience as Record<string, number>).$lte = Number(experienceMax);
    }

    if (location) {
      query.currentLocation = new RegExp(location as string, 'i');
    }

    if (skills) {
      const skillArray = (skills as string).split(',').map((s) => s.trim());
      query.keySkills = { $in: skillArray };
    }

    if (currentCompany) {
      query.currentEmployer = new RegExp(currentCompany as string, 'i');
    }

    if (salaryMin || salaryMax) {
      query.currentAnnualSalary = {};
      if (salaryMin) (query.currentAnnualSalary as Record<string, number>).$gte = Number(salaryMin);
      if (salaryMax) (query.currentAnnualSalary as Record<string, number>).$lte = Number(salaryMax);
    }

    if (noticePeriod) {
      query.noticePeriod = noticePeriod;
    }

    if (industry) {
      query.$or = [
        { currentIndustry: new RegExp(industry as string, 'i') },
        { pastIndustry: new RegExp(industry as string, 'i') },
      ];
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const candidates = await Candidate.find(query).lean();

    // Transform data for Excel
    const excelData = candidates.map((c) => ({
      Name: c.name,
      Designation: c.designation,
      'Date of Birth': c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : '',
      Education: c.education,
      Experience: c.experience,
      'Notice Period': c.noticePeriod,
      'Current Employer': c.currentEmployer,
      'Previous Employer': c.previousEmployer,
      'Key Skills': c.keySkills.join(', '),
      'Current Location': c.currentLocation,
      'Current Industry': c.currentIndustry,
      'Past Industry': c.pastIndustry,
      Email: c.email,
      Phone: c.phone,
      'Current Annual Salary': c.currentAnnualSalary,
      'Created At': c.createdAt ? new Date(c.createdAt).toISOString() : '',
    }));

    // Create Excel file
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Candidates');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Name
      { wch: 20 }, // Designation
      { wch: 12 }, // DOB
      { wch: 25 }, // Education
      { wch: 10 }, // Experience
      { wch: 15 }, // Notice Period
      { wch: 20 }, // Current Employer
      { wch: 20 }, // Previous Employer
      { wch: 30 }, // Key Skills
      { wch: 15 }, // Current Location
      { wch: 20 }, // Current Industry
      { wch: 20 }, // Past Industry
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Salary
      { wch: 20 }, // Created At
    ];

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=candidates-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
