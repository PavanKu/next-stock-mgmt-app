"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { DataPagination } from "@/components/data-pagination";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { OrderGetMany } from "../../types";
import { columns } from "../components/columns";
import { useOrdersFilters } from "../hooks/use-orders-filters";

export function StockOutView() {
  const [filters, setFilters] = useOrdersFilters();
  const router = useRouter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.order.getMany.queryOptions({
      ...filters,
      type: "sale", // Always filter for sale orders
    })
  );

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleRowClick = (row: OrderGetMany[number]) => {
    router.push(`/orders/${row.orderNumber}`);
  };

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
      {data.items.length === 0 && <StockOutListEmpty />}
    </div>
  );
}

export function StockOutListEmpty() {
  return (
    <EmptyState
      title="Create your first sale order"
      description="Create a sale order to manage outgoing inventory and track sales to customers."
    />
  );
}

export function StockOutViewLoading() {
  return (
    <LoadingState
      title="Loading Stock Out"
      description="This may take few seconds..."
    />
  );
}

export function StockOutViewError() {
  return (
    <ErrorState
      title="Failed to load stock out"
      description="Something went wrong..."
    />
  );
}
