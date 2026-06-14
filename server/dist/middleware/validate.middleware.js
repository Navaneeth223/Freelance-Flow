"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const apiError = new Error(error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '));
                apiError.statusCode = 400;
                apiError.code = 'VALIDATION_ERROR';
                return next(apiError);
            }
            return next(error);
        }
    };
};
exports.validate = validate;
