import { and, count, desc, eq, ilike } from "drizzle-orm";
import { string, z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { vendorsInsertSchema, vendorsUpdateSchema } from "../schemas";

export const vendorRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const vendorId = input.id;

      const [existingVendor] = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.id, vendorId),
            // eq(vendors.userId, userId)
          )
        );

      if (!existingVendor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vendor with id ${vendorId} not found.`,
        });
      }

      return existingVendor;
    }),

  create: protectedProcedure
    .input(vendorsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const [createdVendor] = await db
        .insert(vendors)
        .values({ 
          ...input, 
          createdBy: userId,
          updatedBy: userId 
        })
        .returning();

      return createdVendor;
    }),
  update: protectedProcedure
    .input(vendorsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;
      const { id: vendorId, ...updateData } = input;

      const [updatedVendor] = await db
        .update(vendors)
        .set({ 
          ...updateData, 
          updatedBy: userId 
        })
        .where(and(eq(vendors.id, vendorId)))
        .returning();
      if (!updatedVendor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vendor with id ${vendorId} not found.`,
        });
      }

      return updatedVendor;
    }),
  delete: protectedProcedure
    .input(z.object({ id: string() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;
      const { id: vendorId } = input;

      const [deletedVendor] = await db
        .delete(vendors)
        // .where(and(eq(vendors.id, vendorId), eq(vendors.userId, userId)))
        .where(and(eq(vendors.id, vendorId)))
        .returning();
      if (!deletedVendor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vendor with id ${vendorId} not found.`,
        });
      }

      return deletedVendor;
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
        .from(vendors)
        .where(
          and(
            // eq(vendors.userId, userID),
            search ? ilike(vendors.name, `%${search}%`) : undefined
          )
        )
        .orderBy(desc(vendors.createdAt), desc(vendors.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(vendors)
        .where(
          and(
            // eq(vendors.userId, userID),
            search ? ilike(vendors.name, `%${search}%`) : undefined
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
