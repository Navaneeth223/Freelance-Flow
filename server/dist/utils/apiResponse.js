"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    success;
    data;
    message;
    pagination;
    constructor(success, data, message, pagination) {
        this.success = success;
        this.data = data;
        this.message = message;
        if (pagination) {
            this.pagination = pagination;
        }
    }
    static success(data, message = 'Success', pagination) {
        return new ApiResponse(true, data, message, pagination);
    }
    static error(message = 'Error', data = null) {
        return new ApiResponse(false, data, message);
    }
}
exports.ApiResponse = ApiResponse;
