import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { string, z } from "zod";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { agent, meeting } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarURI } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { meetingInsertSchema, meetingUpdateSchema } from "../schemas";
import { MeetingStatus } from "../types";

export const meetingRouter = createTRPCRouter({
  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.auth;
    await streamVideo.upsertUsers([
      {
        id: user.id,
        name: user.name,
        role: "admin",
        image:
          user.image ??
          generateAvatarURI({ seed: user.name, variant: "initials" }),
      },
    ]);

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamVideo.generateUserToken({
      user_id: user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    });

    return token;
  }),
  create: protectedProcedure
    .input(meetingInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const {user} = ctx.auth;
      const [createdMeeting] = await db
        .insert(meeting)
        .values({ ...input, userId: user.id })
        .returning();

      const call = streamVideo.video.call("default", createdMeeting.id);
      await call.create({
        data: {
          created_by_id: user.id,
          custom: {
            meetingId: createdMeeting.id,
            meetingName: createdMeeting.name
          },
          settings_override: {
            transcription: {
              language: "en",
              mode: "auto-on",
              closed_caption_mode: "auto-on"
            },
            recording: {
              mode: "auto-on",
              quality: "1080p"
            }
          }
        }
      });

      const [existingAgent] = await db
        .select()
        .from(agent)
        .where(
            eq(agent.id, createdMeeting.agentId)
        );

      if(!existingAgent) {
        throw new TRPCError({code: "NOT_FOUND", message: `Agent with id ${createdMeeting.agentId} not found.`});
      }
      await streamVideo.upsertUsers([{
        id: existingAgent.id,
        name: existingAgent.name,
        role: "user",
        image: generateAvatarURI({ seed: existingAgent.name, variant: "botttsNeutral" }),
      }]);
      
      return createdMeeting;
    }),
  update: protectedProcedure
    .input(meetingUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;
      const { id: meetingId } = input;

      const [updatedMeeting] = await db
        .update(meeting)
        .set(input)
        .where(and(eq(meeting.id, meetingId), eq(meeting.userId, userId)))
        .returning();
      if (!updatedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Meeting with id ${meetingId} not found.`,
        });
      }

      return updatedMeeting;
    }),
  delete: protectedProcedure
    .input(z.object({ id: string() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.auth.user;
      const { id: meetingId } = input;

      const [deletedMeeting] = await db
        .delete(meeting)
        .where(and(eq(meeting.id, meetingId), eq(meeting.userId, userId)))
        .returning();
      if (!deletedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Meeting with id ${meetingId} not found.`,
        });
      }

      return deletedMeeting;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      const meetingId = input.id;

      const [existingMeeting] = await db
        .select()
        .from(meeting)
        .where(and(eq(meeting.id, meetingId), eq(meeting.userId, userId)));

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Meeting with id ${meetingId} not found.`,
        });
      }

      return existingMeeting;
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
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Upcoming,
            MeetingStatus.Active,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Cancelled,
          ])
          .nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userID = ctx.auth.user.id;
      const { page, pageSize, search, agentId, status } = input;

      const data = await db
        .select({
          ...getTableColumns(meeting),
          agent,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            "duration"
          ),
        })
        .from(meeting)
        .innerJoin(agent, eq(meeting.agentId, agent.id))
        .where(
          and(
            eq(meeting.userId, userID),
            search ? ilike(meeting.name, `%${search}%`) : undefined,
            agentId ? eq(meeting.agentId, agentId) : undefined,
            status ? eq(meeting.status, status) : undefined
          )
        )
        .orderBy(desc(meeting.createdAt), desc(meeting.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({ count: count() })
        .from(meeting)
        .innerJoin(agent, eq(meeting.agentId, agent.id))
        .where(
          and(
            eq(meeting.userId, userID),
            search ? ilike(meeting.name, `%%${search}`) : undefined,
            agentId ? eq(meeting.agentId, agentId) : undefined,
            status ? eq(meeting.status, status) : undefined
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
