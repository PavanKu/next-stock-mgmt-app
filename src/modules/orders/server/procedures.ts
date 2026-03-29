import { count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { orders, products, vendors } from "@/db/schema";
import {
  orderInsertSchema,
  orderUpdateSchema,
} from "@/modules/orders/schemas";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrderByOrderNumber,
  getOrders,
  updateOrder,
} from "@/modules/orders/server/orders";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const orderRouter = createTRPCRouter({
  /**
   * Create a new order with items
   */
  create: protectedProcedure
    .input(orderInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return createOrder(input, user.id);
    }),

  /**
   * Get orders with filtering and pagination
   */
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),

        type: z.enum(["purchase", "sale"]).nullish(),
        vendorId: z.string().nullish(),
        dateFrom: z.string().nullish(),
        dateTo: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const {
        page,
        pageSize,
        search,
        type,
        vendorId,
        dateFrom,
        dateTo,
      } = input;

      return getOrders(
        {
          search: search || undefined,
          type: type || undefined,
          vendorId: vendorId || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          pageSize,
        }
      );
    }),

  /**
   * Get single order by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return getOrderById(input.id);
    }),

  /**
   * Get single order by ID (alias for getById)
   */
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return getOrderById(input.id);
    }),

  /**
   * Get single order by order number
   */
  getByOrderNumber: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return getOrderByOrderNumber(input.orderNumber);
    }),



  /**
   * Update order details (notes)
   */
  update: protectedProcedure
    .input(orderUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      const { id, ...updates } = input;
      return updateOrder(id, updates, user.id);
    }),

  /**
   * Delete order (only pending orders)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      return deleteOrder(input.id);
    }),

  /**
   * Get order statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.auth;
    
    const [totalOrders] = await db
      .select({ count: count() })
      .from(orders);

    const [totalValue] = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(orders);

    return {
      totalOrders: totalOrders.count,
      totalValue: totalValue.total || 0,
    };
  }),

  /**
   * Get recent orders
   */
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx.auth;
      
      const recentOrders = await db
        .select({
          ...getTableColumns(orders),
          vendor: {
            id: vendors.id,
            name: vendors.name,
          },
        })
        .from(orders)
        .innerJoin(vendors, eq(orders.vendorId, vendors.id))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit);

      return recentOrders;
    }),

  /**
   * Get low stock alerts related to orders
   */
  getLowStockAlerts: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.auth;
    
    // Get products with low stock (quantity < 10)
    const lowStockProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        quantity: products.quantity,
      })
      .from(products)
      .where(sql`${products.quantity} < 10`)
      .orderBy(products.quantity);

    return lowStockProducts;
  }),
});