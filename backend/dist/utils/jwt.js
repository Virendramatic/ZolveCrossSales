"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (payload) => {
    const options = {
        expiresIn: process.env.JWT_EXPIRY ? parseInt(process.env.JWT_EXPIRY, 10) : 900,
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', options);
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    const options = {
        expiresIn: process.env.JWT_REFRESH_EXPIRY ? parseInt(process.env.JWT_REFRESH_EXPIRY, 10) : 604800,
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map