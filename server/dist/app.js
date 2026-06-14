"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const timeEntry_routes_1 = __importDefault(require("./routes/timeEntry.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const proposal_routes_1 = __importDefault(require("./routes/proposal.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
// Security headers
app.use((0, helmet_1.default)());
// CORS configuration - allow frontend origin
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Request logger
app.use((0, morgan_1.default)('dev'));
// Body parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Sanitize MongoDB inputs against injection queries
app.use((0, express_mongo_sanitize_1.default)());
// Rate limiting for API calls
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);
// Register routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/clients', client_routes_1.default);
app.use('/api/v1/projects', project_routes_1.default);
app.use('/api/v1/invoices', invoice_routes_1.default);
app.use('/api/v1/time-entries', timeEntry_routes_1.default);
app.use('/api/v1/expenses', expense_routes_1.default);
app.use('/api/v1/proposals', proposal_routes_1.default);
app.use('/api/v1/reports', report_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
// Base route test
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});
// Centralized error handling
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
