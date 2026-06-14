import { Response, NextFunction } from 'express';
import { Proposal } from '../models/Proposal.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const getProposals = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const { status } = req.query;

    const query: any = { userId: req.user.id };
    if (status) query.status = status;

    const proposals = await Proposal.find(query)
      .populate('clientId', 'name email company')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(ApiResponse.success(proposals));
  } catch (error) {
    next(error);
  }
};

export const getProposalById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const proposal = await Proposal.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('clientId')
      .populate('projectId');

    if (!proposal) {
      const error: ApiError = new Error('Proposal not found');
      error.statusCode = 404;
      error.code = 'PROPOSAL_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(proposal));
  } catch (error) {
    next(error);
  }
};

export const createProposal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const proposal = new Proposal({
      ...req.body,
      userId: req.user.id
    });

    await proposal.save();
    res.status(201).json(ApiResponse.success(proposal, 'Proposal created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProposal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!proposal) {
      const error: ApiError = new Error('Proposal not found');
      error.statusCode = 404;
      error.code = 'PROPOSAL_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(proposal, 'Proposal updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProposal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const proposal = await Proposal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!proposal) {
      const error: ApiError = new Error('Proposal not found');
      error.statusCode = 404;
      error.code = 'PROPOSAL_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(null, 'Proposal deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const sendProposal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const proposal = await Proposal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!proposal) {
      const error: ApiError = new Error('Proposal not found');
      error.statusCode = 404;
      error.code = 'PROPOSAL_NOT_FOUND';
      return next(error);
    }

    proposal.status = 'sent';
    proposal.sentAt = new Date();
    await proposal.save();

    res.status(200).json(ApiResponse.success(proposal, 'Proposal sent successfully'));
  } catch (error) {
    next(error);
  }
};
