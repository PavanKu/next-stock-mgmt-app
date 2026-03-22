"use client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";
import { ActiveState } from "../components/active-state";
import { CancelledState } from "../components/cancelled-state";
import { MeetingIdViewHeader } from "../components/meeting-id-header";
import { ProcessingState } from "../components/processing-state";
import { UpcomingState } from "../components/upcoming-state";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";

interface Props {
  id: string;
}
export function MeetingIdView({ id }: Props) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [RemoveConfirmationDialog, confirmRemove] = useConfirm({
    title: "Are you sure?",
    description: `The following action will remove the Meeting with id ${id}`,
  });

  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(trpc.meeting.getOne.queryOptions({ id }));

  const removeMeeting = useMutation(
    trpc.meeting.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meeting.getMany.queryOptions({})
        );
        router.push("/meetings");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const handleMeetingEditClick = () => {
    setUpdateMeetingDialogOpen(true);
  };

  const handleMeetingRemoveClick = async () => {
    const ok = await confirmRemove();
    if (!ok) {
      return;
    }
    removeMeeting.mutate({ id });
  };

  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isActive = data.status === "active";
  const isCompleted = data.status === "completed";
  const isProcessing = data.status === "processing";

  return (
    <>
      <UpdateMeetingDialog
        open={updateMeetingDialogOpen}
        onOpenChange={setUpdateMeetingDialogOpen}
        initialValues={data}
      />
      <RemoveConfirmationDialog />
      <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
        <MeetingIdViewHeader
          id={id}
          name={data.name}
          onEdit={handleMeetingEditClick}
          onRemove={handleMeetingRemoveClick}
        />
        {isUpcoming && <UpcomingState meetingId={id} onCancelMeeting={() =>{}} isCancelling={false}/>}
        {isActive && <ActiveState meetingId={id} />}
        {isCancelled && <CancelledState />}
        {(isCompleted || isProcessing) && <ProcessingState />}
      </div>
    </>
  );
}

export function MeetingIdViewLoading() {
  return (
    <LoadingState
      title="Loading Meeting"
      description="This may take few seconds..."
    />
  );
}

export function MeetingIdViewError() {
  return (
    <ErrorState
      title="Failed to load meeting"
      description="Something went wrong..."
    />
  );
}
