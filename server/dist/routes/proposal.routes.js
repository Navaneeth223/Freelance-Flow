"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proposal_controller_1 = require("../controllers/proposal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.route('/')
    .get(proposal_controller_1.getProposals)
    .post(proposal_controller_1.createProposal);
router.route('/:id')
    .get(proposal_controller_1.getProposalById)
    .patch(proposal_controller_1.updateProposal)
    .delete(proposal_controller_1.deleteProposal);
router.post('/:id/send', proposal_controller_1.sendProposal);
exports.default = router;
