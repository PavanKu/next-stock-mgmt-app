"use client";

import { PlusIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DEFAULT_PAGE } from "@/constants";
import { OrderType } from "../../types";
import { useOrdersFilters } from "../hooks/use-orders-filters";
import { NewPurchaseOrderDialog } from "./new-purchase-order-dialog";
import { OrdersSearchFilter } from "./orders-search-filter";
import { VendorFilter } from "./vendor-filter";

export function StockInListHeader() {
  const [filters, setFilters] = useOrdersFilters();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const isAnyFilterModified =
    !!filters.search || !!filters.vendorId || !!filters.dateFrom || !!filters.dateTo;

  const handleClearFiltersBtnClick = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
      vendorId: "",
      type: OrderType.Purchase, // Always set to purchase for Stock In
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <>
      <NewPurchaseOrderDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">Stock In</h5>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon />
            New Purchase
          </Button>
        </div>
        <ScrollArea>
          <div className="flex items-center p-1 gap-x-2">
            <OrdersSearchFilter />
            <VendorFilter />
            {isAnyFilterModified && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFiltersBtnClick}
              >
                <XCircleIcon />
                Clear
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
}
