"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { DataPagination } from "../../../../components/data-pagination";
import { DataTable } from "../../../../components/data-table";
import { ProductGetOne } from "../../types";
import { columns } from "../components/columns";
import { useProductsFilters } from "../hooks/use-products-filters";

export function ProductsView() {
  const [filters, setFilters] = useProductsFilters();
  const router = useRouter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.product.getMany.queryOptions({
      ...filters,
    })
  );

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleRowClick = (row:ProductGetOne) => {
    router.push(`/products/${row.id}`)
  }

  return (
    <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
      <DataTable columns={columns} data={data.items} onRowClick={handleRowClick}/>
      <DataPagination
        page={filters.page}
        totalPages={data.pages}
        onPageChange={handlePageChange}
      />
      {data.items.length === 0 && <ProductViewListEmpty />}
    </div>
  );
}

export function ProductViewListEmpty() {
  return (
    <EmptyState
      title="Create your first product"
      description="Add products to manage your inventory catalog and pricing."
    />
  );
}

export function ProductViewLoading() {
  return (
    <LoadingState
      title="Loading Products"
      description="This may take few seconds..."
    />
  );
}

export function ProductViewError() {
  return (
    <ErrorState
      title="Failed to load products"
      description="Something went wrong..."
    />
  );
}
