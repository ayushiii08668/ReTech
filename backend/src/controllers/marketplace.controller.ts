import { Request, Response, NextFunction } from 'express';
import MarketplaceListing, {
  ListingStatus,
  ListingAvailability,
} from '../models/MarketplaceListing.js';
import MarketplaceEnquiry from '../models/MarketplaceEnquiry.js';
import Device from '../models/Device.js';
import SanitizationJob from '../models/SanitizationJob.js';
import { getNextId } from '../models/Counter.js';
import { recordLifecycleEvent } from '../models/DeviceLifecycleEvent.js';
import AppError from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Public & Customer: Browse refurbished marketplace listings
 */
export const getPublicListings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const search = (req.query.search as string)?.trim();
    const category = (req.query.category as string)?.trim();
    const condition = (req.query.condition as string)?.trim();
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const sortBy = (req.query.sortBy as string) || 'newest';

    const query: Record<string, any> = {
      listingStatus: 'PUBLISHED',
      availability: 'AVAILABLE',
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (condition && condition !== 'ALL') {
      query.condition = condition;
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.price = {};
      if (!isNaN(minPrice)) query.price.$gte = minPrice;
      if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    let sort: any = { publishedAt: -1 };
    if (sortBy === 'price-asc') sort = { price: 1 };
    else if (sortBy === 'price-desc') sort = { price: -1 };
    else if (sortBy === 'newest') sort = { publishedAt: -1 };

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      MarketplaceListing.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'deviceId category brand model storageType storageCapacity condition'),
      MarketplaceListing.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        listings,
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
 * Public & Customer: Get single marketplace product listing details
 */
export const getPublicListingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    let listing = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      listing = await MarketplaceListing.findById(id).populate('deviceId');
    }
    if (!listing) {
      listing = await MarketplaceListing.findOne({ listingId: id }).populate('deviceId');
    }

    if (!listing) {
      return next(new AppError('Marketplace product listing not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer: Submit an authentic purchase enquiry / reserve request for a device
 */
export const submitMarketplaceEnquiry = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customer = req.user!;
    const { listingId, customerMessage, offeredPrice, contactPhone } = req.body;

    if (!listingId || !customerMessage) {
      return next(new AppError('Listing selection and enquiry message are required.', 400));
    }

    let listing = null;
    if (listingId.match(/^[0-9a-fA-F]{24}$/)) {
      listing = await MarketplaceListing.findById(listingId);
    }
    if (!listing) {
      listing = await MarketplaceListing.findOne({ listingId });
    }

    if (!listing) {
      return next(new AppError('Listing not found.', 404));
    }

    if (listing.availability === 'SOLD') {
      return next(new AppError('This device has already been sold.', 400));
    }

    const enquiryId = await getNextId('ENQ');

    const enquiry = await MarketplaceEnquiry.create({
      enquiryId,
      listingId: listing._id,
      deviceId: listing.deviceId,
      customerId: customer._id,
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: contactPhone || customer.phone || 'Not provided',
      customerMessage: customerMessage.trim(),
      offeredPrice: offeredPrice ? parseFloat(offeredPrice) : undefined,
      enquiryStatus: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: `Enquiry ${enquiryId} submitted successfully. Our operations team will contact you.`,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all listings with status management
 */
export const getAdminListings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string)?.trim();
    const status = (req.query.status as string)?.trim();

    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { listingId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { retechDeviceId: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'ALL') {
      query.listingStatus = status;
    }

    const skip = (page - 1) * limit;

    const [listings, total, availableCount, soldCount] = await Promise.all([
      MarketplaceListing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('deviceId', 'deviceId category brand model condition status storageType storageCapacity'),
      MarketplaceListing.countDocuments(query),
      MarketplaceListing.countDocuments({ availability: 'AVAILABLE', listingStatus: 'PUBLISHED' }),
      MarketplaceListing.countDocuments({ availability: 'SOLD' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        listings,
        stats: {
          total,
          availableCount,
          soldCount,
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
 * Admin: Create a new marketplace listing for an eligible device
 * CRITICAL ELIGIBILITY RULE ENFORCEMENT
 */
export const createMarketplaceListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const {
      deviceId,
      title,
      description,
      price,
      originalEstimatedValue,
      condition,
      specifications,
      images,
      warrantyInformation,
      refurbishmentStatus,
    } = req.body;

    if (!deviceId || !title || price === undefined) {
      return next(new AppError('Device selection, title, and listing price are required.', 400));
    }

    let device = null;
    if (deviceId.match(/^[0-9a-fA-F]{24}$/)) {
      device = await Device.findById(deviceId);
    }
    if (!device) {
      device = await Device.findOne({ deviceId });
    }

    if (!device) {
      return next(new AppError('Device not found in inventory.', 404));
    }

    // ELIGIBILITY RULE 1: Unsafe or unsuitable classification D cannot be listed
    if (device.classification === 'D') {
      return next(
        new AppError('Device classification D (unsafe / hazardous) is strictly ineligible for resale.', 400),
      );
    }

    // ELIGIBILITY RULE 2: Device must have passed verified sanitization (status SANITIZED)
    if (device.status !== 'SANITIZED' && device.status !== 'READY_FOR_RESALE' && device.status !== 'REFURBISHED') {
      // Check if verified sanitization exists
      const verifiedJob = await SanitizationJob.findOne({
        deviceId: device._id,
        status: 'VERIFIED_SUCCESSFUL',
      });

      if (!verifiedJob) {
        return next(
          new AppError(
            'Device is INELIGIBLE for resale: Cryptographic NIST SP 800-88 sanitization has not been completed or verified. Never list devices containing residual customer data.',
            400,
          ),
        );
      }
    }

    // ELIGIBILITY RULE 3: Device cannot be assigned or transferred to recycling
    if (device.status === 'RECYCLING_PENDING' || device.status === 'TRANSFERRED_TO_RECYCLER' || device.status === 'RECYCLED') {
      return next(new AppError('Device has already been assigned to recycling and cannot be listed for resale.', 400));
    }

    // ELIGIBILITY RULE 4: Prevent duplicate active listings for the same device
    const existingListing = await MarketplaceListing.findOne({
      deviceId: device._id,
      listingStatus: { $ne: 'SOLD' },
    });

    if (existingListing) {
      return next(
        new AppError(`An active listing (${existingListing.listingId}) already exists for this device.`, 409),
      );
    }

    const listingId = await getNextId('MKT');

    const newListing = await MarketplaceListing.create({
      listingId,
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      title: title.trim(),
      description: description?.trim() || `${device.brand} ${device.model} Refurbished Electronic Device`,
      category: device.category,
      brand: device.brand,
      model: device.model,
      specifications: specifications || {
        storage: `${device.storageCapacity || '512 GB'} ${device.storageType || 'SSD'}`,
      },
      images: Array.isArray(images) && images.length > 0 ? images : device.images || [],
      condition: condition || (device.condition === 'Like new' ? 'Like new' : device.condition === 'Fair' ? 'Fair' : 'Good'),
      refurbishmentStatus: refurbishmentStatus || 'Certified Inspected & NIST SP 800-88 Sanitized',
      price: parseFloat(price),
      originalEstimatedValue: originalEstimatedValue ? parseFloat(originalEstimatedValue) : undefined,
      warrantyInformation: warrantyInformation || '90-Day ReTech Certified Functional Warranty',
      listingStatus: 'PUBLISHED',
      availability: 'AVAILABLE',
      publishedAt: new Date(),
      createdBy: adminUser._id,
    });

    // Update device status and link listing
    await Device.findByIdAndUpdate(device._id, {
      status: 'LISTED_FOR_RESALE',
      marketplaceListingId: newListing._id,
    });

    // Record lifecycle event
    await recordLifecycleEvent({
      deviceId: device._id,
      retechDeviceId: device.deviceId,
      eventType: 'LISTED_FOR_RESALE',
      title: 'Approved and Listed on Refurbished Marketplace',
      description: `Device listed for resale at ₹${newListing.price.toLocaleString('en-IN')}. Listing Ref: ${newListing.listingId}`,
      previousStatus: device.status,
      newStatus: 'LISTED_FOR_RESALE',
      performedBy: adminUser._id,
      performedByName: adminUser.fullName,
      sourceReference: newListing.listingId,
    });

    res.status(201).json({
      success: true,
      message: `Marketplace listing ${listingId} published successfully.`,
      data: newListing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update an existing listing
 */
export const updateMarketplaceListing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { listingId } = req.params;
    const { title, description, price, condition, specifications, images, warrantyInformation, listingStatus } = req.body;

    let listing = null;
    if (listingId.match(/^[0-9a-fA-F]{24}$/)) {
      listing = await MarketplaceListing.findById(listingId);
    }
    if (!listing) {
      listing = await MarketplaceListing.findOne({ listingId });
    }

    if (!listing) {
      return next(new AppError('Listing not found.', 404));
    }

    if (title) listing.title = title.trim();
    if (description) listing.description = description.trim();
    if (price !== undefined) listing.price = parseFloat(price);
    if (condition) listing.condition = condition;
    if (specifications) listing.specifications = { ...listing.specifications, ...specifications };
    if (images && Array.isArray(images)) listing.images = images;
    if (warrantyInformation) listing.warrantyInformation = warrantyInformation;
    if (listingStatus) listing.listingStatus = listingStatus as ListingStatus;

    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing ${listing.listingId} updated.`,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Mark a listing as SOLD only after actual confirmed sale
 */
export const markListingSold = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminUser = req.user!;
    const { listingId } = req.params;
    const { buyerName, buyerContact, soldPrice } = req.body;

    let listing = null;
    if (listingId.match(/^[0-9a-fA-F]{24}$/)) {
      listing = await MarketplaceListing.findById(listingId);
    }
    if (!listing) {
      listing = await MarketplaceListing.findOne({ listingId });
    }

    if (!listing) {
      return next(new AppError('Listing not found.', 404));
    }

    listing.listingStatus = 'SOLD';
    listing.availability = 'SOLD';
    listing.soldAt = new Date();
    listing.soldPrice = soldPrice ? parseFloat(soldPrice) : listing.price;
    listing.buyerName = buyerName || 'Confirmed Buyer';
    listing.buyerContact = buyerContact || 'N/A';

    await listing.save();

    // Transition device to SOLD
    await Device.findByIdAndUpdate(listing.deviceId, {
      status: 'SOLD',
    });

    // Record lifecycle event
    await recordLifecycleEvent({
      deviceId: listing.deviceId,
      retechDeviceId: listing.retechDeviceId,
      eventType: 'DEVICE_SOLD',
      title: 'Device Resale Completed',
      description: `Device sold for ₹${listing.soldPrice?.toLocaleString('en-IN') || listing.price}. Buyer: ${listing.buyerName}. Second life extended.`,
      previousStatus: 'LISTED_FOR_RESALE',
      newStatus: 'SOLD',
      performedBy: adminUser._id,
      performedByName: adminUser.fullName,
      sourceReference: listing.listingId,
    });

    res.status(200).json({
      success: true,
      message: `Listing ${listing.listingId} marked as confirmed SOLD.`,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get and manage customer enquiries
 */
export const getAdminEnquiries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const enquiries = await MarketplaceEnquiry.find()
      .sort({ createdAt: -1 })
      .populate('listingId', 'listingId title price images')
      .populate('deviceId', 'deviceId brand model category');

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

