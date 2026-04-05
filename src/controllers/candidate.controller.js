import { Candidate } from '../models/Candidate.model.js';
import { AppError } from '../utils/AppError.js';

export const createCandidate = async (req, res, next) => {
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

export const getCandidates = async (req, res, next) => {
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

    if (pastIndustry) {
      query.pastIndustry = new RegExp(pastIndustry, 'i');
    }

    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [candidates, total] = await Promise.all([
      Candidate.find(search ? { $text: { $search: search } } : query)
        .sort(sort)
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

export const getCandidateById = async (req, res, next) => {
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

export const updateCandidate = async (req, res, next) => {
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

export const deleteCandidate = async (req, res, next) => {
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

export const getCandidateStats = async (_req, res, next) => {
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
