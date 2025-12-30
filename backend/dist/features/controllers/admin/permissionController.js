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
exports.index = void 0;
const permissions_1 = require("@/config/permissions");
const prisma_1 = __importDefault(require("@/config/prisma"));
// This function seeds the permissions table and returns all permissions.
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use a transaction to find or create permissions
        // This makes the seeding process idempotent
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            for (const perm of permissions_1.PERMISSIONS) {
                yield tx.permission.upsert({
                    where: { name: perm },
                    update: {},
                    create: { name: perm },
                });
            }
        }));
        // Return all permissions from the database
        const allPermissions = yield prisma_1.default.permission.findMany({
            orderBy: { name: 'asc' }
        });
        res.status(200).json(allPermissions);
    }
    catch (error) {
        console.error("Error seeding or fetching permissions:", error);
        res.status(500).json({ error: 'Failed to retrieve permissions.' });
    }
});
exports.index = index;
