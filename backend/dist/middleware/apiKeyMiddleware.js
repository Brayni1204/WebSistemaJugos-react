"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = void 0;
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-provisioning-api-key'];
    const expectedApiKey = process.env.PROVISIONING_API_KEY;
    if (!apiKey || apiKey !== expectedApiKey) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key.' });
    }
    next();
};
exports.validateApiKey = validateApiKey;
