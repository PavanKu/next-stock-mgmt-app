import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import {
  StockInListHeader,
  StockInView,
  StockInViewError,
  StockInViewLoading,
} from "@/modules/orders/ui";

export default function StockInPage() {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<StockInViewLoading />}>
        <StockInListHeader />
        <ErrorBoundary FallbackComponent={StockInViewError}>
          <StockInView />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
