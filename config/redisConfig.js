"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ioredis_1 = __importDefault(require("ioredis"));
const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    throw new Error("REDIS_URL not found update your environment variables");
};
const redis = new ioredis_1.default(getRedisUrl());
redis.on('connect', () => {
    console.log("connected to redis");
});
redis.on('error', (err) => {
    console.log("Redis connection error", err);
});
process.on('SIGTERM', () => {
    redis.quit();
});
exports.default = redis;
