import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { VendorIdView, VendorIdViewError, VendorIdViewLoading } from "@/modules/vendors/ui/views/vendor-id-view";

interface Props {
    params: Promise<{vendorId: string}>
}

export default async function VendorDetailPage({params}: Props) {
    const {vendorId} = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.vendor.getOne.queryOptions({id: vendorId}));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<VendorIdViewLoading />}>
                <ErrorBoundary fallback={<VendorIdViewError />}>
                    <VendorIdView id={vendorId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
