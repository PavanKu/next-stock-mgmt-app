"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { DataPagination } from "../../../../components/data-pagination";
import { DataTable } from "../../../../components/data-table";
import { AgentGetOne } from "../../types";
import { columns } from "../components/columns";
import { useAgentsFilters } from "../hooks/use-agents-filters";

export function AgentsView() {
  const [filters, setFilters] = useAgentsFilters();
  const router = useRouter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.agent.getMany.queryOptions({
      ...filters,
    })
  );

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleRowClick = (row:AgentGetOne) => {
    router.push(`/agents/${row.id}`)
  }

  return (
    <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
      <DataTable columns={columns} data={data.items} onRowClick={handleRowClick}/>
      <DataPagination
        page={filters.page}
        totalPages={data.pages}
        onPageChange={handlePageChange}
      />
      {data.items.length === 0 && <AgentViewListEmpty />}
    </div>
  );
}

export function AgentViewListEmpty() {
  return (
    <EmptyState
      title="Create your first agent"
      description="Create an agent to join your meetings and take notes."
    />
  );
}

export function AgentViewLoading() {
  return (
    <LoadingState
      title="Loading Agents"
      description="This may take few seconds..."
    />
  );
}

export function AgentViewError() {
  return (
    <ErrorState
      title="Failed to load agents"
      description="Something went wrong..."
    />
  );
}
