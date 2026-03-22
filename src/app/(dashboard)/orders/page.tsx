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
      <OrdersListHeader />
      <ErrorBoundary FallbackComponent={OrderViewError}>
        <Suspense fallback={<OrderViewLoading />}>
          <OrdersView />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
