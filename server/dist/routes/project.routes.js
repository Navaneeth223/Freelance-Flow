"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.route('/')
    .get(project_controller_1.getProjects)
    .post(project_controller_1.createProject);
router.route('/:id')
    .get(project_controller_1.getProjectById)
    .patch(project_controller_1.updateProject)
    .delete(project_controller_1.deleteProject);
exports.default = router;
