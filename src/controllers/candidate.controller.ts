import { Request, Response, NextFunction } from 'express';
import { Candidate } from '../models/Candidate.model.js';
import { AppError } from '../utils/AppError.js';

interface FilterParams {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  experienceMin?: string;
  experienceMax?: string;
  location?: string;
  skills?: string;
  currentCompany?: string;
  salaryMin?: string;
  salaryMax?: string;
  noticePeriod?: string;
  industry?: string;
  pastIndustry?: string;
}

export const createCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await Candidate.create(req.body);

    res.status(201).json({
      success: true,
      data: candidate,
      message: 'Candidate created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      sort = '-createdAt',
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
      pastIndustry,
    } = req.query as FilterParams;

    // Build filter query
    const query: Record<string, unknown> = {};

    // Experience range
    if (experienceMin || experienceMax) {
      query.experience = {};
      if (experienceMin) (query.experience as Record<string, number>).$gte = Number(experienceMin);
      if (experienceMax) (query.experience as Record<string, number>).$lte = Number(experienceMax);
    }

    // Location
    if (location) {
      query.currentLocation = new RegExp(location, 'i');
    }

    // Skills (multi-select)
    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      query.keySkills = { $in: skillArray };
    }

    // Current company
    if (currentCompany) {
      query.currentEmployer = new RegExp(currentCompany, 'i');
    }

    // Salary range
    if (salaryMin || salaryMax) {
      query.currentAnnualSalary = {};
      if (salaryMin) (query.currentAnnualSalary as Record<string, number>).$gte = Number(salaryMin);
      if (salaryMax) (query.currentAnnualSalary as Record<string, number>).$lte = Number(salaryMax);
    }

    // Notice period
    if (noticePeriod) {
      query.noticePeriod = noticePeriod;
    }

    // Industry (current & past)
    if (industry) {
      query.$or = [
        { currentIndustry: new RegExp(industry, 'i') },
        { pastIndustry: new RegExp(industry, 'i') },
      ];
    }

    if (pastIndustry) {
      query.pastIndustry = new RegExp(pastIndustry, 'i');
    }

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with sorting and pagination
    const [candidates, total] = await Promise.all([
      Candidate.find(search ? { $text: { $search: search } } : query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Candidate.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    res.status(200).json({
      success: true,
      data: candidate,
      message: 'Candidate updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Candidate.aggregate([
      {
        $group: {
          _id: null,
          totalCandidates: { $sum: 1 },
          avgExperience: { $avg: '$experience' },
          avgSalary: { $avg: '$currentAnnualSalary' },
          minSalary: { $min: '$currentAnnualSalary' },
          maxSalary: { $max: '$currentAnnualSalary' },
        },
      },
    ]);

    const locationStats = await Candidate.aggregate([
      {
        $group: {
          _id: '$currentLocation',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const skillsStats = await Candidate.aggregate([
      { $unwind: '$keySkills' },
      {
        $group: {
          _id: '$keySkills',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || { totalCandidates: 0, avgExperience: 0, avgSalary: 0 },
        byLocation: locationStats,
        topSkills: skillsStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
