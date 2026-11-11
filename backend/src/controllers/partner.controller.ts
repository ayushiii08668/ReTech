import { Response, NextFunction } from 'express';
import Partner, { PartnerType, PartnerStatus } from '../models/Partner.js';
import { getNextId } from '../models/Counter.js';
import AppError from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Admin: Get all partner organizations (Refurbishers & Recyclers)
 */
export const getPartners = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const partnerType = req.query.partnerType as string;
    const status = req.query.status as string;
    const search = (req.query.search as string)?.trim();

    const query: Record<string, any> = {};

    if (partnerType && partnerType !== 'ALL') {
      query.partnerType = partnerType;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { partnerId: { $regex: search, $options: 'i' } },
        { partnerName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { authorisationReference: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [partners, total, refurbishmentCount, recyclingCount] = await Promise.all([
      Partner.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Partner.countDocuments(query),
      Partner.countDocuments({ partnerType: 'REFURBISHMENT' }),
      Partner.countDocuments({ partnerType: 'RECYCLING' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        partners,
        stats: {
          total,
          refurbishmentCount,
          recyclingCount,
        },
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single partner details
 */
export const getPartnerById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let partner = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      partner = await Partner.findById(id);
    }
    if (!partner) {
      partner = await Partner.findOne({ partnerId: id });
    }

    if (!partner) {
      return next(new AppError('Partner organization record not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Register a new external partner
 */
export const createPartner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const {
      partnerType,
      partnerName,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      services,
      supportedCategories,
      authorisationReference,
      validityDates,
      status,
      internalNotes,
    } = req.body;

    if (!partnerType || !partnerName || !companyName || !email || !authorisationReference) {
      return next(
        new AppError(
          'Missing required partner registration fields: partnerType, partnerName, companyName, email, and authorisationReference are mandatory.',
          400,
        ),
      );
    }

    if (partnerType !== 'REFURBISHMENT' && partnerType !== 'RECYCLING') {
      return next(new AppError('Partner type must be either REFURBISHMENT or RECYCLING.', 400));
    }

    const partnerId = await getNextId('PTR');

    const newPartner = await Partner.create({
      partnerId,
      partnerType,
      partnerName: partnerName.trim(),
      companyName: companyName.trim(),
      contactPerson: contactPerson?.trim() || 'Managing Director',
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '+91 00000 00000',
      address: address || {},
      services: Array.isArray(services) ? services : [],
      supportedCategories: Array.isArray(supportedCategories)
        ? supportedCategories
        : ['Laptops', 'Desktops', 'Smartphones'],
      authorisationReference: authorisationReference.trim(),
      validityDates: validityDates || {},
      status: status || 'ACTIVE',
      internalNotes: internalNotes || '',
      createdBy: adminUser._id,
    });

    res.status(201).json({
      success: true,
      message: `${partnerType === 'REFURBISHMENT' ? 'Refurbishment' : 'Recycling'} partner ${newPartner.partnerName} registered successfully.`,
      data: newPartner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update partner information or status
 */
export const updatePartner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let partner = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      partner = await Partner.findById(id);
    }
    if (!partner) {
      partner = await Partner.findOne({ partnerId: id });
    }

    if (!partner) {
      return next(new AppError('Partner record not found.', 404));
    }

    const allowedUpdates = [
      'partnerName',
      'companyName',
      'contactPerson',
      'email',
      'phone',
      'address',
      'services',
      'supportedCategories',
      'authorisationReference',
      'validityDates',
      'status',
      'internalNotes',
    ];

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        (partner as any)[key] = updates[key];
      }
    }

    await partner.save();

    res.status(200).json({
      success: true,
      message: `Partner ${partner.partnerName} updated.`,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete or suspend partner
 */
export const deletePartner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let partner = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      partner = await Partner.findById(id);
    }
    if (!partner) {
      partner = await Partner.findOne({ partnerId: id });
    }

    if (!partner) {
      return next(new AppError('Partner not found.', 404));
    }

    partner.status = 'INACTIVE';
    await partner.save();

    res.status(200).json({
      success: true,
      message: `Partner ${partner.partnerName} marked as INACTIVE.`,
    });
  } catch (error) {
    next(error);
  }
};

