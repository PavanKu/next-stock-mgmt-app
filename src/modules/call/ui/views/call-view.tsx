"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CallProvider } from "../components/call-provider";

interface Props {
    meetingId: string
}
export function CallView({meetingId}: Props) {
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.meeting.getOne.queryOptions({ id: meetingId }))

    if(data.status === "completed") {
        return (
            <div className="h-screen flex items-center justify-center">
                <ErrorState title="Meeting has ended" description="You can no longer join the meeting."/>
            </div>
        )
    }

    return (
        <CallProvider meetingId={meetingId} meetingName={data.name} />
    )
}

export function CallViewLoading() {
  return (
    <LoadingState
      title="Loading Meeting"
      description="This may take few seconds..."
    />
  );
}

export function CallViewError() {
  return (
    <ErrorState
      title="Failed to load meeting"
      description="Something went wrong..."
    />
  );
}

