import { Suspense } from "react";

import {
  OrdersListHeader,
  OrdersView,
  OrderViewError,
  OrderViewLoading,
} from "@/modules/orders/ui";
import { ErrorBoundary } from "react-error-boundary";

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<OrderViewLoading />}>
        <OrdersListHeader />
        <ErrorBoundary FallbackComponent={OrderViewError}>
          <OrdersView />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
