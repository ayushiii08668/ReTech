import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import env from '../config/env.js';
import User, { IUser, UserRole } from '../models/User.js';
import AppError from '../utils/AppError.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  formatZodError,
} from '../utils/validators.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createNotification } from '../utils/notification.js';

const signToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

const sendAuthResponse = (
  user: IUser,
  statusCode: number,
  res: Response,
  message?: string,
): void => {
  const token = signToken(user._id.toString(), user.role);

  // Exclude passwordHash from output
  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;

  res.status(statusCode).json({
    success: true,
    message: message || 'Success',
    token,
    user: userObj,
  });
};

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const { fullName, email, phone, password } = parseResult.data;

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new AppError('An account with this email already exists', 409));
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (ALWAYS Customer, never trust any role from frontend)
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: 'CUSTOMER',
      accountStatus: 'ACTIVE',
    });

    // Send welcome notification
    await createNotification(
      newUser._id,
      'Welcome to ReTech!',
      'Your customer account has been created. You can now schedule pickups for your old electronics.',
      'SUCCESS',
    );

    sendAuthResponse(newUser, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const { email, password } = parseResult.data;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash',
    );

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.accountStatus === 'DEACTIVATED') {
      return next(
        new AppError('Your account has been deactivated. Please contact support.', 403),
      );
    }

    sendAuthResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const userObj = req.user.toObject();
    delete userObj.passwordHash;

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    const user = await User.findOne({ email: parseResult.data.email.toLowerCase() });
    if (!user) {
      // Don't leak user existence
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset token has been sent.',
      });
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a production setup, this sends an email via SendGrid/SES.
    // For development and testing convenience, we return the reset token directly in response.
    res.status(200).json({
      success: true,
      message: 'Password reset token generated. Use this token to reset your password within 15 minutes.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const { token, password } = parseResult.data;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Reset token is invalid or has expired', 400));
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await createNotification(
      user._id,
      'Password Changed',
      'Your password was successfully updated.',
      'INFO',
    );

    sendAuthResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const { fullName, phone, address } = parseResult.data;
    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address) {
      updateData.address = {
        street: address.street ?? req.user.address?.street ?? '',
        city: address.city ?? req.user.address?.city ?? '',
        state: address.state ?? req.user.address?.state ?? '',
        pinCode: address.pinCode ?? req.user.address?.pinCode ?? '',
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    const userObj = updatedUser.toObject();
    delete userObj.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(new AppError(formatZodError(parseResult.error), 400));
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 400));
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await createNotification(
      user._id,
      'Security Alert: Password Changed',
      'Your account password was just changed.',
      'WARNING',
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
