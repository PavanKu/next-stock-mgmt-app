import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { OrderDetailView, OrderDetailViewError, OrderDetailViewLoading } from "@/modules/orders/ui/views/order-detail-view";

interface Props {
    params: Promise<{orderNumber: string}>
}

export default async function({params}: Props) {
    const {orderNumber} = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.order.getByOrderNumber.queryOptions({orderNumber}));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<OrderDetailViewLoading />}>
                <ErrorBoundary fallback={<OrderDetailViewError />}>
                    <OrderDetailView orderNumber={orderNumber} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
