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
exports.getSalesOverTime = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const date_fns_1 = require("date-fns");
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const today = new Date();
        const last7Days = (0, date_fns_1.subDays)(today, 7);
        const last30Days = (0, date_fns_1.subDays)(today, 30);
        // Perform all aggregations in parallel
        const [totalRevenue, totalOrders, totalCustomers, revenueLast7Days, revenueLast30Days,] = yield prisma_1.default.$transaction([
            prisma_1.default.venta.aggregate({
                where: { tenantId },
                _sum: { total_pago: true },
            }),
            prisma_1.default.venta.count({
                where: { tenantId },
            }),
            prisma_1.default.cliente.count({
                where: { tenantId },
            }),
            prisma_1.default.venta.aggregate({
                where: { tenantId, created_at: { gte: last7Days } },
                _sum: { total_pago: true },
            }),
            prisma_1.default.venta.aggregate({
                where: { tenantId, created_at: { gte: last30Days } },
                _sum: { total_pago: true },
            }),
        ]);
        res.status(200).json({
            totalRevenue: totalRevenue._sum.total_pago || 0,
            totalOrders: totalOrders || 0,
            totalCustomers: totalCustomers || 0,
            revenueLast7Days: revenueLast7Days._sum.total_pago || 0,
            revenueLast30Days: revenueLast30Days._sum.total_pago || 0,
        });
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
    }
});
exports.getDashboardStats = getDashboardStats;
const getSalesOverTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const thirtyDaysAgo = (0, date_fns_1.subDays)(new Date(), 30);
        // This is a raw query because groupBy on date parts is complex in Prisma
        // Note: This syntax is specific to MySQL.
        const salesData = yield prisma_1.default.$queryRaw `
            SELECT 
                DATE(created_at) as date, 
                SUM(total_pago) as sales
            FROM Venta
            WHERE tenantId = ${tenantId} AND created_at >= ${thirtyDaysAgo}
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC;
        `;
        // Format data for charting libraries
        const formattedData = salesData.map(d => (Object.assign(Object.assign({}, d), { sales: Number(d.sales), date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })));
        res.status(200).json(formattedData);
    }
    catch (error) {
        console.error("Error fetching sales over time:", error);
        res.status(500).json({ message: 'Failed to fetch sales data.' });
    }
});
exports.getSalesOverTime = getSalesOverTime;
