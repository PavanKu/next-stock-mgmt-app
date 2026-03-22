import { and, count, desc, eq, ilike } from "drizzle-orm";
import { string, z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { agent } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";

export const agentRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const agentId = input.id;

      const [existingAgent] = await db
        .select()
        .from(agent)
        .where(
          and(
            eq(agent.id, agentId),
            eq(agent.userId, userId)
          )
        );

      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Agent with id ${agentId} not found.`,
        });
      }

      return existingAgent;
    }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdAgent] = await db
        .insert(agent)
        .values({ ...input, userId: ctx.auth.user.id })
        .returning();

      return createdAgent;
    }),
  update: protectedProcedure
    .input(agentsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;
      const { id: agentId } = input;

      const [updatedAgent] = await db
        .update(agent)
        .set(input)
        .where(and(eq(agent.id, agentId), eq(agent.userId, userId)))
        .returning();
      if (!updatedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Agent with id ${agentId} not found.`,
        });
      }

      return updatedAgent;
    }),
  delete: protectedProcedure
    .input(z.object({ id: string() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;
      const { id: agentId } = input;

      const [deletedAgent] = await db
        .delete(agent)
        .where(and(eq(agent.id, agentId), eq(agent.userId, userId)))
        .returning();
      if (!deletedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Agent with id ${agentId} not found.`,
        });
      }

      return deletedAgent;
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
        .from(agent)
        .where(
          and(
            eq(agent.userId, userID),
            search ? ilike(agent.name, `%${search}%`) : undefined
          )
        )
        .orderBy(desc(agent.createdAt), desc(agent.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(agent)
        .where(
          and(
            eq(agent.userId, userID),
            search ? ilike(agent.name, `%%${search}`) : undefined
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
