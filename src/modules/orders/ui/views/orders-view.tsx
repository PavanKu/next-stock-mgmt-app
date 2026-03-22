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

export function OrdersView() {
  const [filters, setFilters] = useOrdersFilters();
  const router = useRouter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.order.getMany.queryOptions({
      ...filters,
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
      {data.items.length === 0 && <OrderListEmpty />}
    </div>
  );
}

export function OrderListEmpty() {
  return (
    <EmptyState
      title="Create your first order"
      description="Create an order to manage your inventory and track purchases or sales."
    />
  );
}

export function OrderViewLoading() {
  return (
    <LoadingState
      title="Loading Orders"
      description="This may take few seconds..."
    />
  );
}

export function OrderViewError() {
  return (
    <ErrorState
      title="Failed to load orders"
      description="Something went wrong..."
    />
  );
}
