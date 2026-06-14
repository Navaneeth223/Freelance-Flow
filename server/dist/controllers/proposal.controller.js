"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendProposal = exports.deleteProposal = exports.updateProposal = exports.createProposal = exports.getProposalById = exports.getProposals = void 0;
const Proposal_model_1 = require("../models/Proposal.model");
const apiResponse_1 = require("../utils/apiResponse");
const getProposals = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const { status } = req.query;
        const query = { userId: req.user.id };
        if (status)
            query.status = status;
        const proposals = await Proposal_model_1.Proposal.find(query)
            .populate('clientId', 'name email company')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(apiResponse_1.ApiResponse.success(proposals));
    }
    catch (error) {
        next(error);
    }
};
exports.getProposals = getProposals;
const getProposalById = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const proposal = await Proposal_model_1.Proposal.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('clientId')
            .populate('projectId');
        if (!proposal) {
            const error = new Error('Proposal not found');
            error.statusCode = 404;
            error.code = 'PROPOSAL_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(proposal));
    }
    catch (error) {
        next(error);
    }
};
exports.getProposalById = getProposalById;
const createProposal = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const proposal = new Proposal_model_1.Proposal({
            ...req.body,
            userId: req.user.id
        });
        await proposal.save();
        res.status(201).json(apiResponse_1.ApiResponse.success(proposal, 'Proposal created successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createProposal = createProposal;
const updateProposal = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const proposal = await Proposal_model_1.Proposal.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: req.body }, { new: true });
        if (!proposal) {
            const error = new Error('Proposal not found');
            error.statusCode = 404;
            error.code = 'PROPOSAL_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(proposal, 'Proposal updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateProposal = updateProposal;
const deleteProposal = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const proposal = await Proposal_model_1.Proposal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!proposal) {
            const error = new Error('Proposal not found');
            error.statusCode = 404;
            error.code = 'PROPOSAL_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Proposal deleted successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProposal = deleteProposal;
const sendProposal = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const proposal = await Proposal_model_1.Proposal.findOne({ _id: req.params.id, userId: req.user.id });
        if (!proposal) {
            const error = new Error('Proposal not found');
            error.statusCode = 404;
            error.code = 'PROPOSAL_NOT_FOUND';
            return next(error);
        }
        proposal.status = 'sent';
        proposal.sentAt = new Date();
        await proposal.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(proposal, 'Proposal sent successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.sendProposal = sendProposal;
