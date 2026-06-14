"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const apiResponse_1 = require("../utils/apiResponse");
const signToken = (id, email) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_minimum_32_characters_long_for_auth_js';
    return jsonwebtoken_1.default.sign({ id, email }, secret, { expiresIn: '7d' });
};
const register = async (req, res, next) => {
    try {
        const { name, email, password, businessName } = req.body;
        const existingUser = await User_model_1.User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists with this email');
            error.statusCode = 400;
            error.code = 'USER_ALREADY_EXISTS';
            return next(error);
        }
        const user = new User_model_1.User({ name, email, password, businessName });
        await user.save();
        const token = signToken(user._id.toString(), user.email);
        res.status(201).json(apiResponse_1.ApiResponse.success({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                businessName: user.businessName
            }
        }, 'User registered successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_model_1.User.findOne({ email });
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            return next(error);
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            return next(error);
        }
        const token = signToken(user._id.toString(), user.email);
        res.status(200).json(apiResponse_1.ApiResponse.success({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                businessName: user.businessName,
                plan: user.plan
            }
        }, 'User logged in successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            return next(error);
        }
        const user = await User_model_1.User.findById(req.user.id).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 444;
            error.code = 'USER_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(user));
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            return next(error);
        }
        const updatedUser = await User_model_1.User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true }).select('-password');
        res.status(200).json(apiResponse_1.ApiResponse.success(updatedUser, 'Profile updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
