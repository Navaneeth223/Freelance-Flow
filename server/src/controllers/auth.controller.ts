import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

const signToken = (id: string, email: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_minimum_32_characters_long_for_auth_js';
  return jwt.sign({ id, email }, secret, { expiresIn: '7d' });
};

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, businessName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error: ApiError = new Error('User already exists with this email');
      error.statusCode = 400;
      error.code = 'USER_ALREADY_EXISTS';
      return next(error);
    }

    const user = new User({ name, email, password, businessName });
    await user.save();

    const token = signToken(user._id.toString(), user.email);

    res.status(201).json(ApiResponse.success({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName
      }
    }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error: ApiError = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return next(error);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error: ApiError = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return next(error);
    }

    const token = signToken(user._id.toString(), user.email);

    res.status(200).json(ApiResponse.success({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        plan: user.plan
      }
    }, 'User logged in successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authenticated');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      const error: ApiError = new Error('User not found');
      error.statusCode = 444;
      error.code = 'USER_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(user));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authenticated');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true }).select('-password');
    res.status(200).json(ApiResponse.success(updatedUser, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};
