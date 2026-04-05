import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/Contact.model.js';
import { AppError } from '../utils/AppError.js';

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("req",req.body)
    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Message sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find().sort('-createdAt').skip(skip).limit(limitNum).lean(),
      Contact.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: contacts,
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

export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};
