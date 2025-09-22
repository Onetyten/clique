"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheRoleIDs = CacheRoleIDs;
const pgConnect_1 = __importDefault(require("../config/pgConnect"));
const redisConfig_1 = __importDefault(require("../config/redisConfig"));
function CacheRoleIDs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminRoleResult = yield pgConnect_1.default.query('SELECT id FROM roles WHERE name=$1', ['admin']);
            const guestRoleResult = yield pgConnect_1.default.query('SELECT id FROM roles WHERE name=$1', ['guest']);
            if (adminRoleResult.rows.length > 0) {
                yield redisConfig_1.default.set('adminId', adminRoleResult.rows[0].id);
                console.log('Cached adminId in Redis');
            }
            if (guestRoleResult.rows.length > 0) {
                yield redisConfig_1.default.set('guestId', guestRoleResult.rows[0].id);
                console.log('Cached guestId in Redis');
            }
        }
        catch (error) {
            console.error('Error caching role IDs:', error);
        }
    });
}
