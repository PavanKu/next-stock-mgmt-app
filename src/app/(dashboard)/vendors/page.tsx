import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/vendors/params";
import { VendorsListHeader } from "@/modules/vendors/ui/components/vendors-list-header";
import {
  VendorsView,
  VendorViewError,
  VendorViewLoading,
} from "@/modules/vendors/ui/views/vendors-view";
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
    trpc.vendor.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <>
      <VendorsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<VendorViewLoading />}>
          <ErrorBoundary fallback={<VendorViewError />}>
            <VendorsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
