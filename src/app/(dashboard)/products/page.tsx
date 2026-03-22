import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/products/params";
import { ProductsListHeader } from "@/modules/products/ui/components/products-list-header";
import {
  ProductsView,
  ProductViewError,
  ProductViewLoading,
} from "@/modules/products/ui/views/products-view";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const filters = await loadSearchParams(searchParams);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  queryClient.prefetchQuery(
    trpc.product.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <>
      <ProductsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductViewLoading />}>
          <ErrorBoundary fallback={<ProductViewError />}>
            <ProductsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
}