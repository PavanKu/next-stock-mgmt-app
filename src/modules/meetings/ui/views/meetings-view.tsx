"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { DataPagination } from "@/components/data-pagination";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { columns } from "@/modules/meetings/ui/components/columns";
import { useTRPC } from "@/trpc/client";
import { MeetingGetOne } from "../../types";
import { useMeetignsFilters } from "../hooks/use-meetings-filters";

export function MeetingsView() {
  const [filters, setFilters] = useMeetignsFilters();
  const router = useRouter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meeting.getMany.queryOptions({
      ...filters,
    })
  );

  const handlePageChange = (page: number) => {
      setFilters({ page });
    };
  
    const handleRowClick = (row:MeetingGetOne) => {
      router.push(`/meetings/${row.id}`)
    }
  

  return (
    <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
      <DataTable
        columns={columns}
        data={data.items}
        onRowClick={handleRowClick}
      />
      <DataPagination
        page={filters.page}
        totalPages={data.pages}
        onPageChange={handlePageChange}
      />
      {data.items.length === 0 && <MeetingListEmpty />}
    </div>
  );
}

export function MeetingListEmpty() {
  return (
    <EmptyState
      title="Create your first meeting"
      description="Create a meeting which an agent can join and take notes."
    />
  );
}

export function MeetingViewLoading() {
  return (
    <LoadingState
      title="Loading Meeting"
      description="This may take few seconds..."
    />
  );
}

export function MeetingViewError() {
  return (
    <ErrorState
      title="Failed to load meetings"
      description="Something went wrong..."
    />
  );
}
