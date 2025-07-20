"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
class ResponseHandler {
    /**
     * Send success response
     */
    static success(res, message = "Success", data, statusCode = 200) {
        var _a;
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
            requestId: (_a = res.locals) === null || _a === void 0 ? void 0 : _a.requestId,
        };
        console.log(`[${new Date().toISOString()}] SUCCESS: ${message}`, {
            statusCode,
            method: res.req.method,
            url: res.req.url,
            requestId: response.requestId,
        });
        return res.status(statusCode).json(response);
    }
    /**
     * Send error response
     */
    static error(res, message = "Internal Server Error", error, statusCode = 500) {
        var _a;
        const response = {
            success: false,
            message,
            error,
            timestamp: new Date().toISOString(),
            requestId: (_a = res.locals) === null || _a === void 0 ? void 0 : _a.requestId,
        };
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`, {
            statusCode,
            method: res.req.method,
            url: res.req.url,
            requestId: response.requestId,
            error,
        });
        return res.status(statusCode).json(response);
    }
    /**
     * Send validation error response
     */
    static validationError(res, message = "Validation Error", errors) {
        var _a;
        const response = {
            success: false,
            message,
            error: errors,
            timestamp: new Date().toISOString(),
            requestId: (_a = res.locals) === null || _a === void 0 ? void 0 : _a.requestId,
        };
        console.warn(`[${new Date().toISOString()}] VALIDATION ERROR: ${message}`, {
            statusCode: 400,
            method: res.req.method,
            url: res.req.url,
            requestId: response.requestId,
            errors,
        });
        return res.status(400).json(response);
    }
    /**
     * Send not found response
     */
    static notFound(res, message = "Resource not found") {
        var _a;
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString(),
            requestId: (_a = res.locals) === null || _a === void 0 ? void 0 : _a.requestId,
        };
        console.warn(`[${new Date().toISOString()}] NOT FOUND: ${message}`, {
            statusCode: 404,
            method: res.req.method,
            url: res.req.url,
            requestId: response.requestId,
        });
        return res.status(404).json(response);
    }
    /**
     * Send unauthorized response
     */
    static unauthorized(res, message = "Unauthorized") {
        var _a;
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString(),
            requestId: (_a = res.locals) === null || _a === void 0 ? void 0 : _a.requestId,
        };
        console.warn(`[${new Date().toISOString()}] UNAUTHORIZED: ${message}`, {
            statusCode: 401,
            method: res.req.method,
            url: res.req.url,
            requestId: response.requestId,
        });
        return res.status(401).json(response);
    }
}
exports.ResponseHandler = ResponseHandler;
