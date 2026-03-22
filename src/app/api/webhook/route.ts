import {
	CallEndedEvent,
	CallRecordingReadyEvent,
	CallSessionParticipantLeftEvent,
	CallSessionStartedEvent,
	CallTranscriptionReadyEvent,
} from "@stream-io/node-sdk";
import { and, eq, not } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { meeting } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
  const reqheaders = await headers();
  const signature = reqheaders.get("x-signature");
  const apiKey = reqheaders.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 }
    );
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventType = (payload as Record<string, unknown>)?.type;

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [existingMeeting] = await db
      .select()
      .from(meeting)
      .where(
        and(
          eq(meeting.id, meetingId),
          not(eq(meeting.status, "completed")),
          not(eq(meeting.status, "active")),
          not(eq(meeting.status, "cancelled")),
          not(eq(meeting.status, "processing"))
        )
      );

    if (!existingMeeting) {
      return NextResponse.json(
        { error: `Meeting with id ${meetingId} not found.` },
        { status: 404 }
      );
    }

    await db
      .update(meeting)
      .set({
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(meeting.id, existingMeeting.id));
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1]; // call_cid as type:id

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const call = streamVideo.video.call("default", meetingId);
    call.end();
  } else if (eventType === "call.session_ended") {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId;
    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }
		await db
      .update(meeting)
      .set({
        status: "processing",
        endedAt: new Date(),
      })
      .where(and(
				eq(meeting.id, meetingId),
				eq(meeting.status, "active")
			));
  } else if(eventType === "call.transcription_ready") {
		const event = payload as CallTranscriptionReadyEvent;
		const meetingId = event.call_cid.split(":")[1];
		if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }
		const [updatedMeeting] = await db
      .update(meeting)
      .set({
        transcriptUrl: event.call_transcription.url,
      })
      .where(eq(meeting.id, meetingId))
			.returning();

			if (!updatedMeeting) {
      return NextResponse.json(
        { error: `Meeting with id ${meetingId} not found.` },
        { status: 404 }
      );
    }
	} else if (eventType === "call.recording_ready") {
		const event = payload as CallRecordingReadyEvent;
		const meetingId = event.call_cid.split(":")[1];
		if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }
		await db
      .update(meeting)
      .set({
        recordingUrl: event.call_recording.url,
      })
      .where(eq(meeting.id, meetingId));
	}
  return NextResponse.json({ status: "ok" });
}
