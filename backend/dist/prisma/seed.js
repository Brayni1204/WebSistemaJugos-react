"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const client_1 = require("../generated/prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Start seeding ...`);
        const demoSubdomain = 'demo';
        const adminEmail = 'admin@demo.com';
        const adminPassword = 'password123';
        // Hash the admin password
        const hashedPassword = yield bcrypt.hash(adminPassword, 10);
        // Upsert the demo tenant
        const demoTenant = yield prisma.tenant.upsert({
            where: { subdomain: demoSubdomain },
            update: {},
            create: {
                name: 'Demo Store',
                subdomain: demoSubdomain,
                business_email: 'contact@demostore.com',
                contact_phone: '123-456-7890',
                theme_color: '#4A90E2',
                address: '123 Demo Street, Suite 100, Demo City, DC 12345',
                about_us: 'Welcome to the Demo Store! This is a sample store to showcase the features of our platform.',
                mision: 'To provide the best demo experience.',
                vision: 'To be the number one platform for all demos.',
                status: 'ACTIVE',
                social_links: {
                    facebook: 'https://facebook.com/demostore',
                    twitter: 'https://twitter.com/demostore',
                    instagram: 'https://instagram.com/demostore'
                }
            },
        });
        console.log(`Created/updated demo tenant with id: ${demoTenant.id}`);
        // Upsert the admin user for the demo tenant
        const adminUser = yield prisma.user.upsert({
            where: { email_tenantId: { email: adminEmail, tenantId: demoTenant.id } },
            update: {},
            create: {
                name: 'Demo Admin',
                email: adminEmail,
                password: hashedPassword,
                tenantId: demoTenant.id,
                is_active: true,
            },
        });
        console.log(`Created/updated demo admin user with id: ${adminUser.id}`);
        console.log(`Seeding finished.`);
        yield prisma.$disconnect();
    });
}
// This allows the script to be run directly via `ts-node prisma/seed.ts` if needed
if (require.main === module) {
    seedDatabase().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
