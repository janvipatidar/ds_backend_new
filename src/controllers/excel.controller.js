import multer from 'multer';
import xlsx from 'xlsx';
import { Candidate } from '../models/Candidate.model.js';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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

export const uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new AppError('Excel file is empty', 400);
    }

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

    const validCandidates = candidates.filter((c) => c.name && c.designation && c.email && c.phone);

    if (validCandidates.length === 0) {
      throw new AppError('No valid candidates found in the Excel file', 400);
    }

    let insertedCount = 0;
    for (const candidate of validCandidates) {
      const existing = await Candidate.findOne({ email: candidate.email });
      if (!existing) {
        await Candidate.create(candidate);
        insertedCount++;
      } else {
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

export const exportExcel = async (req, res, next) => {
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

    const query = {};

    if (experienceMin || experienceMax) {
      query.experience = {};
      if (experienceMin) query.experience.$gte = Number(experienceMin);
      if (experienceMax) query.experience.$lte = Number(experienceMax);
    }

    if (location) {
      query.currentLocation = new RegExp(location, 'i');
    }

    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      query.keySkills = { $in: skillArray };
    }

    if (currentCompany) {
      query.currentEmployer = new RegExp(currentCompany, 'i');
    }

    if (salaryMin || salaryMax) {
      query.currentAnnualSalary = {};
      if (salaryMin) query.currentAnnualSalary.$gte = Number(salaryMin);
      if (salaryMax) query.currentAnnualSalary.$lte = Number(salaryMax);
    }

    if (noticePeriod) {
      query.noticePeriod = noticePeriod;
    }

    if (industry) {
      query.$or = [
        { currentIndustry: new RegExp(industry, 'i') },
        { pastIndustry: new RegExp(industry, 'i') },
      ];
    }

    if (search) {
      query.$text = { $search: search };
    }

    const candidates = await Candidate.find(query).lean();

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

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Candidates');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
    ];

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=candidates-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
