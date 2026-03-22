"use client";

import { CommandSelect } from "@/components/command-select";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useOrdersFilters } from "../hooks/use-orders-filters";

export function VendorFilter() {
  const [filters, setFilters] = useOrdersFilters();
  const trpc = useTRPC();
  const [vendorSearch, setVendorSearch] = useState("");
  
  const { data } = useQuery(
    trpc.vendor.getMany.queryOptions({
      pageSize: 100,
      search: vendorSearch,
    })
  );

  return (
    <CommandSelect
      options={(data?.items ?? []).map((vendor) => ({
        id: vendor.id,
        value: vendor.id,
        children: (
          <div className="flex items-center gap-x-2">
            <span>{vendor.name}</span>
          </div>
        ),
      }))}
      className="h-9"
      placeholder="Vendor"
      onSelect={(value) => setFilters({ vendorId: value })}
      onSearch={setVendorSearch}
      value={filters.vendorId ?? ""}
    />
  );
}
