import { count, desc, eq, getTableColumns, sql, and, gte, lte, sum } from "drizzle-orm";
import { z } from "zod";
import { subDays, format } from "date-fns";

import { db } from "@/db";
import { orders, products, vendors, orderItems } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import type {
  DashboardStats,
  StockMovementData,
  OrderTypeDistribution,
  VendorPerformance,
  RecentActivity,
  ProductPerformance,
  LowStockAlert
} from "../types";

export const dashboardRouter = createTRPCRouter({
  /**
   * Get overall dashboard statistics
   */
  getDashboardStats: protectedProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { dateFrom, dateTo } = input;

      // Build date filter conditions
      const dateConditions = [];
      if (dateFrom) {
        dateConditions.push(gte(orders.orderDate, new Date(dateFrom)));
      }
      if (dateTo) {
        dateConditions.push(lte(orders.orderDate, new Date(dateTo)));
      }

      // Get total orders count
      const [totalOrdersResult] = await db
        .select({ count: count() })
        .from(orders)
        .where(dateConditions.length > 0 ? and(...dateConditions) : undefined);

      // Get total revenue (sum of all order amounts)
      const [totalRevenueResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(orders)
        .where(dateConditions.length > 0 ? and(...dateConditions) : undefined);

      // Get active vendors count
      const [activeVendorsResult] = await db
        .select({ count: count() })
        .from(vendors)
        .where(eq(vendors.status, 'active'));

      // Get total products count
      const [totalProductsResult] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.status, 'active'));

      // Get low stock count (products with quantity < 10)
      const [lowStockResult] = await db
        .select({ count: count() })
        .from(products)
        .where(sql`${products.quantity} < 10 AND ${products.status} = 'active'`);

      const stats: DashboardStats = {
        totalOrders: totalOrdersResult.count,
        totalRevenue: Number(totalRevenueResult.total) || 0,
        activeVendors: activeVendorsResult.count,
        totalProducts: totalProductsResult.count,
        lowStockCount: lowStockResult.count,
      };

      return stats;
    }),

  /**
   * Get stock movement data for time-series chart
   */
  getStockMovementData: protectedProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).default(30),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { days, dateFrom, dateTo } = input;

      // Calculate date range
      const endDate = dateTo ? new Date(dateTo) : new Date();
      const startDate = dateFrom ? new Date(dateFrom) : subDays(endDate, days);

      // Get stock in data (purchase orders)
      const stockInData = await db
        .select({
          date: sql<string>`DATE(${orders.orderDate})`,
          total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.type, 'purchase'),
            gte(orders.orderDate, startDate),
            lte(orders.orderDate, endDate)
          )
        )
        .groupBy(sql`DATE(${orders.orderDate})`)
        .orderBy(sql`DATE(${orders.orderDate})`);

      // Get stock out data (sale orders)
      const stockOutData = await db
        .select({
          date: sql<string>`DATE(${orders.orderDate})`,
          total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.type, 'sale'),
            gte(orders.orderDate, startDate),
            lte(orders.orderDate, endDate)
          )
        )
        .groupBy(sql`DATE(${orders.orderDate})`)
        .orderBy(sql`DATE(${orders.orderDate})`);

      // Merge data and fill missing dates
      const stockInMap = new Map(stockInData.map(item => [item.date, item.total]));
      const stockOutMap = new Map(stockOutData.map(item => [item.date, item.total]));

      const result: StockMovementData[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        result.push({
          date: dateStr,
          stockIn: stockInMap.get(dateStr) || 0,
          stockOut: stockOutMap.get(dateStr) || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    }),

  /**
   * Get order type distribution (purchase vs sale)
   */
  getOrderTypeDistribution: protectedProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { dateFrom, dateTo } = input;

      // Build date filter conditions
      const dateConditions = [];
      if (dateFrom) {
        dateConditions.push(gte(orders.orderDate, new Date(dateFrom)));
      }
      if (dateTo) {
        dateConditions.push(lte(orders.orderDate, new Date(dateTo)));
      }

      const distributionData = await db
        .select({
          type: orders.type,
          count: count(),
        })
        .from(orders)
        .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
        .groupBy(orders.type);

      const totalOrders = distributionData.reduce((sum, item) => sum + item.count, 0);

      const result: OrderTypeDistribution[] = distributionData.map(item => ({
        type: item.type as 'purchase' | 'sale',
        count: item.count,
        percentage: totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0,
      }));

      return result;
    }),

  /**
   * Get top vendors by performance
   */
  getTopVendors: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { limit, dateFrom, dateTo } = input;

      // Build date filter conditions
      const dateConditions = [];
      if (dateFrom) {
        dateConditions.push(gte(orders.orderDate, new Date(dateFrom)));
      }
      if (dateTo) {
        dateConditions.push(lte(orders.orderDate, new Date(dateTo)));
      }

      const topVendorsData = await db
        .select({
          id: vendors.id,
          name: vendors.name,
          totalOrders: count(orders.id),
          totalAmount: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`,
          lastOrderDate: sql<string>`MAX(${orders.orderDate})`,
        })
        .from(vendors)
        .innerJoin(orders, eq(vendors.id, orders.vendorId))
        .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
        .groupBy(vendors.id, vendors.name)
        .orderBy(sql`SUM(CAST(${orders.totalAmount} AS DECIMAL)) DESC`)
        .limit(limit);

      const result: VendorPerformance[] = topVendorsData.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        totalOrders: vendor.totalOrders,
        totalAmount: Number(vendor.totalAmount) || 0,
        lastOrderDate: vendor.lastOrderDate,
      }));

      return result;
    }),

  /**
   * Get recent activity (orders and alerts)
   */
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { limit } = input;

      // Get recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          type: orders.type,
          totalAmount: orders.totalAmount,
          orderDate: orders.orderDate,
          vendorName: vendors.name,
        })
        .from(orders)
        .innerJoin(vendors, eq(orders.vendorId, vendors.id))
        .orderBy(desc(orders.orderDate))
        .limit(Math.floor(limit * 0.7)); // 70% of limit for orders

      // Get low stock alerts
      const lowStockAlerts = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          quantity: products.quantity,
        })
        .from(products)
        .where(sql`${products.quantity} < 10 AND ${products.status} = 'active'`)
        .orderBy(products.quantity)
        .limit(Math.ceil(limit * 0.3)); // 30% of limit for alerts

      const activities: RecentActivity[] = [];

      // Add order activities
      recentOrders.forEach(order => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: `${order.type === 'purchase' ? 'Purchase' : 'Sale'} Order ${order.orderNumber}`,
          description: `${order.type === 'purchase' ? 'Purchased from' : 'Sold to'} ${order.vendorName}`,
          timestamp: order.orderDate.toISOString(),
          status: 'success',
          orderType: order.type as 'purchase' | 'sale',
          amount: Number(order.totalAmount) || 0,
        });
      });

      // Add low stock alerts
      lowStockAlerts.forEach(product => {
        activities.push({
          id: `alert-${product.id}`,
          type: 'alert',
          title: 'Low Stock Alert',
          description: `${product.name} (${product.sku}) has only ${product.quantity} units left`,
          timestamp: new Date().toISOString(),
          status: 'warning',
        });
      });

      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return activities.slice(0, limit);
    }),

  /**
   * Get product performance metrics
   */
  getProductPerformance: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { limit, dateFrom, dateTo } = input;

      // Build date filter conditions
      const dateConditions = [];
      if (dateFrom) {
        dateConditions.push(gte(orders.orderDate, new Date(dateFrom)));
      }
      if (dateTo) {
        dateConditions.push(lte(orders.orderDate, new Date(dateTo)));
      }

      const productPerformanceData = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          currentStock: products.quantity,
          totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          revenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0)`,
        })
        .from(products)
        .leftJoin(orderItems, eq(products.id, orderItems.productId))
        .leftJoin(orders, and(
          eq(orderItems.orderId, orders.id),
          eq(orders.type, 'sale'),
          ...(dateConditions.length > 0 ? dateConditions : [])
        ))
        .where(eq(products.status, 'active'))
        .groupBy(products.id, products.name, products.sku, products.quantity)
        .orderBy(sql`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0) DESC`)
        .limit(limit);

      const result: ProductPerformance[] = productPerformanceData.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        totalSold: Number(product.totalSold) || 0,
        currentStock: product.currentStock,
        revenue: Number(product.revenue) || 0,
      }));

      return result;
    }),

  /**
   * Get low stock alerts
   */
  getLowStockAlerts: protectedProcedure
    .input(
      z.object({
        threshold: z.number().min(1).max(100).default(10),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { threshold, limit } = input;

      const lowStockData = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          currentStock: products.quantity,
        })
        .from(products)
        .where(
          and(
            sql`${products.quantity} < ${threshold}`,
            eq(products.status, 'active')
          )
        )
        .orderBy(products.quantity)
        .limit(limit);

      const result: LowStockAlert[] = lowStockData.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock: product.currentStock,
        threshold,
      }));

      return result;
    }),
});
