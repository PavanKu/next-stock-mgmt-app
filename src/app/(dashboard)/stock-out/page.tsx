import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import {
  StockOutListHeader,
  StockOutView,
  StockOutViewError,
  StockOutViewLoading,
} from "@/modules/orders/ui";

export default function StockOutPage() {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<StockOutViewLoading />}>
        <StockOutListHeader />
        <ErrorBoundary FallbackComponent={StockOutViewError}>
          <StockOutView />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
