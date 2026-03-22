"use client";

import {
  ShoppingCartIcon,
  TruckIcon,
} from "lucide-react";

import { CommandSelect } from "@/components/command-select";
import { OrderType } from "../../types";
import { useOrdersFilters } from "../hooks/use-orders-filters";

const options = [
  {
    id: OrderType.Purchase,
    value: OrderType.Purchase,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <TruckIcon className="size-4" />
        {OrderType.Purchase}
      </div>
    ),
  },
  {
    id: OrderType.Sale,
    value: OrderType.Sale,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <ShoppingCartIcon className="size-4" />
        {OrderType.Sale}
      </div>
    ),
  },
];

export function TypeFilter() {
  const [filters, setFilters] = useOrdersFilters();
  return (
    <CommandSelect
      options={options}
      placeholder="Type"
      className="h-9"
      value={filters.type ?? ""}
      onSelect={(value) => setFilters({ type: value as OrderType })}
    />
  );
}
