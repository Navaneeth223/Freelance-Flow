"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.route('/')
    .get(invoice_controller_1.getInvoices)
    .post(invoice_controller_1.createInvoice);
router.route('/:id')
    .get(invoice_controller_1.getInvoiceById)
    .patch(invoice_controller_1.updateInvoice)
    .delete(invoice_controller_1.deleteInvoice);
router.post('/:id/send', invoice_controller_1.sendInvoice);
router.post('/:id/mark-paid', invoice_controller_1.markPaid);
router.get('/:id/pdf', invoice_controller_1.getInvoicePdf);
exports.default = router;
