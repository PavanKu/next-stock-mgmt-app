"use client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";
import { AgentIdViewHeader } from "../components/agent-id-header";
import { UpdateAgentDialog } from "../components/update-agent-dialog";

interface Props {
  id: string;
}
export function AgentIdView({ id }: Props) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [RemoveConfirmationDialog, confirmRemove] = useConfirm({
    title: "Are you sure?",
    description: `The following action will remove the Agent with id ${id}`,
  });
  const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(trpc.agent.getOne.queryOptions({ id }));

  const removeAgent = useMutation(
    trpc.agent.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agent.getMany.queryOptions({})
        );
        router.push("/agents");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const handleAgentEditClick = () => {
    setUpdateAgentDialogOpen(true);
  };

  const handleAgentRemoveClick = async () => {
    const ok = await confirmRemove();
    if (!ok) {
      return;
    }
    removeAgent.mutate({ id });
  };

  return (
    <>
      <UpdateAgentDialog
        open={updateAgentDialogOpen}
        onOpenChange={setUpdateAgentDialogOpen}
        initialValues={data}
      />
      <RemoveConfirmationDialog />
      <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
        <AgentIdViewHeader
          id={id}
          name={data.name}
          onEdit={handleAgentEditClick}
          onRemove={handleAgentRemoveClick}
        />
        <div className="border bg-background rounded-lg">
          <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
            <div className="flex items-center gap-x-3">
              <GeneratedAvatar
                variant="botttsNeutral"
                seed={data.name}
                className="size-10"
              />
              <h2 className="text-2xl font-medium">{data.name}</h2>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <VideoIcon className="text-blue-500" />5 meetings
            </Badge>
            <div className="flex flex-col gap-y-4">
              <p className="text-xl font-medium">Instructions</p>
              <p className="text-neutral-800">{data.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function AgentIdViewLoading() {
  return (
    <LoadingState
      title="Loading Agent"
      description="This may take few seconds..."
    />
  );
}

export function AgentIdViewError() {
  return (
    <ErrorState
      title="Failed to load agent"
      description="Something went wrong..."
    />
  );
}
