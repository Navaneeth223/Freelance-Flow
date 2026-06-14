"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timeEntry_controller_1 = require("../controllers/timeEntry.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.route('/')
    .get(timeEntry_controller_1.getTimeEntries)
    .post(timeEntry_controller_1.createTimeEntry);
router.post('/stop', timeEntry_controller_1.stopActiveTimer);
router.route('/:id')
    .patch(timeEntry_controller_1.updateTimeEntry)
    .delete(timeEntry_controller_1.deleteTimeEntry);
exports.default = router;
