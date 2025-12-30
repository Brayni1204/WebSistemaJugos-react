// src/features/controllers/admin/dashboardController.ts
import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { subDays } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;

    try {
        const today = new Date();
        const last7Days = subDays(today, 7);
        const last30Days = subDays(today, 30);

        // Perform all aggregations in parallel
        const [
            totalRevenue,
            totalOrders,
            totalCustomers,
            revenueLast7Days,
            revenueLast30Days,
        ] = await prisma.$transaction([
            prisma.venta.aggregate({
                where: { tenantId },
                _sum: { total_pago: true },
            }),
            prisma.venta.count({
                where: { tenantId },
            }),
            prisma.cliente.count({
                where: { tenantId },
            }),
            prisma.venta.aggregate({
                where: { tenantId, created_at: { gte: last7Days } },
                _sum: { total_pago: true },
            }),
            prisma.venta.aggregate({
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
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
    }
};

export const getSalesOverTime = async (req: Request, res: Response) => {
    const tenantId = req.tenant?.id;
    
    try {
        const thirtyDaysAgo = subDays(new Date(), 30);
        
        // This is a raw query because groupBy on date parts is complex in Prisma
        // Note: This syntax is specific to MySQL.
        const salesData = await prisma.$queryRaw<
            { date: string; sales: number }[]
        >`
            SELECT 
                DATE(created_at) as date, 
                SUM(total_pago) as sales
            FROM Venta
            WHERE tenantId = ${tenantId} AND created_at >= ${thirtyDaysAgo}
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC;
        `;

        // Format data for charting libraries
        const formattedData = salesData.map(d => ({
            ...d,
            sales: Number(d.sales),
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        
        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching sales over time:", error);
        res.status(500).json({ message: 'Failed to fetch sales data.' });
    }
}
