import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { string, z } from "zod";

import {




    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { products } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { productsInsertSchema, productsUpdateSchema } from "../schemas";

export const productRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const productId = input.id;

      const [existingProduct] = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, productId),
            // eq(products.userId, userId)
          )
        );

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Product with id ${productId} not found.`,
        });
      }

      return existingProduct;
    }),

  create: protectedProcedure
    .input(productsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const [createdProduct] = await db
        .insert(products)


        .values({ 
          ...input, 
          createdBy: userId,
          updatedBy: userId 
        })
        .returning();

      return createdProduct;
    }),
  update: protectedProcedure
    .input(productsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;

      const { id: productId, ...updateData } = input;

      const [updatedProduct] = await db
        .update(products)


        .set({ 
          ...updateData, 
          updatedBy: userId 
        })
        .where(and(eq(products.id, productId)))
        .returning();
      if (!updatedProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Product with id ${productId} not found.`,
        });
      }

      return updatedProduct;
    }),
  delete: protectedProcedure
    .input(z.object({ id: string() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;
      const { id: productId } = input;

      const [deletedProduct] = await db
        .delete(products)
        // .where(and(eq(products.id, productId), eq(products.userId, userId)))
        .where(and(eq(products.id, productId)))
        .returning();
      if (!deletedProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Product with id ${productId} not found.`,
        });
      }

      return deletedProduct;
    }),
  getBySku: protectedProcedure
    .input(z.object({ sku: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const { sku } = input;

      const [existingProduct] = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.sku, sku),
            // eq(products.userId, userId)
          )
        );

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Product with SKU ${sku} not found.`,
        });
      }

      return existingProduct;
    }),
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
      })
    )
    .query(async ({ input, ctx }) => {
      const userID = ctx.auth.user.id;
      const { page, pageSize, search } = input;

      const data = await db
        .select()
        .from(products)
        .where(
          and(
            // eq(products.userId, userID),
            search ? or(
              ilike(products.name, `%${search}%`),
              ilike(products.sku, `%${search}%`)
            ) : undefined
          )
        )
        .orderBy(desc(products.createdAt), desc(products.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(products)
        .where(
          and(
            // eq(products.userId, userID),
            search ? or(
              ilike(products.name, `%${search}%`),
              ilike(products.sku, `%${search}%`)
            ) : undefined
          )
        );

      const totalPages = Math.ceil(total.count / pageSize);
      return {
        items: data,
        total: total.count,
        pages: totalPages,
      };
    }),
});
