import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AgentIdView, AgentIdViewError, AgentIdViewLoading } from "@/modules/agents/ui/views/agent-id-view";

interface Props {
    params: Promise<{agentId: string}>
}

export default async function AgentDetailPage({params}: Props) {
    const {agentId} = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agent.getOne.queryOptions({id: agentId}));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<AgentIdViewLoading />}>
                <ErrorBoundary fallback={<AgentIdViewError />}>
                    <AgentIdView id={agentId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}