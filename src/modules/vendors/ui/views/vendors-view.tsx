"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { DataPagination } from "../../../../components/data-pagination";
import { DataTable } from "../../../../components/data-table";
import { VendorGetOne } from "../../types";
import { columns } from "../components/columns";
import { useVendorsFilters } from "../hooks/use-vendors-filters";

export function VendorsView() {
  const [filters, setFilters] = useVendorsFilters();
  const router = useRouter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.vendor.getMany.queryOptions({
      ...filters,
    })
  );

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleRowClick = (row:VendorGetOne) => {
    router.push(`/vendors/${row.id}`)
  }

  return (
    <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
      <DataTable columns={columns} data={data.items} onRowClick={handleRowClick}/>
      <DataPagination
        page={filters.page}
        totalPages={data.pages}
        onPageChange={handlePageChange}
      />
      {data.items.length === 0 && <VendorViewListEmpty />}
    </div>
  );
}

export function VendorViewListEmpty() {
  return (
    <EmptyState
      title="Create your first vendor"
      description="Add vendors to manage your inventory suppliers and partners."
    />
  );
}

export function VendorViewLoading() {
  return (
    <LoadingState
      title="Loading Vendors"
      description="This may take few seconds..."
    />
  );
}

export function VendorViewError() {
  return (
    <ErrorState
      title="Failed to load vendors"
      description="Something went wrong..."
    />
  );
}
