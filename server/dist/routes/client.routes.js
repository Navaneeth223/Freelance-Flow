"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_controller_1 = require("../controllers/client.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.route('/')
    .get(client_controller_1.getClients)
    .post(client_controller_1.createClient);
router.route('/:id')
    .get(client_controller_1.getClientById)
    .patch(client_controller_1.updateClient)
    .delete(client_controller_1.deleteClient);
exports.default = router;
