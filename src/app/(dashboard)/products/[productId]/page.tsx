import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ProductIdView, ProductIdViewError, ProductIdViewLoading } from "@/modules/products/ui/views/product-id-view";

interface Props {
    params: Promise<{productId: string}>
}

export default async function({params}: Props) {
    const {productId} = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.product.getOne.queryOptions({id: productId}));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<ProductIdViewLoading />}>
                <ErrorBoundary fallback={<ProductIdViewError />}>
                    <ProductIdView id={productId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}