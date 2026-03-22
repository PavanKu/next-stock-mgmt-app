"use client";

import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  PackageIcon,
} from "lucide-react";

import { CommandSelect } from "@/components/command-select";
import { OrderStatus } from "../../types";
import { useOrdersFilters } from "../hooks/use-orders-filters";

const options = [
  {
    id: OrderStatus.Pending,
    value: OrderStatus.Pending,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <ClockIcon className="size-4" />
        {OrderStatus.Pending}
      </div>
    ),
  },
  {
    id: OrderStatus.Confirmed,
    value: OrderStatus.Confirmed,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <PackageIcon className="size-4" />
        {OrderStatus.Confirmed}
      </div>
    ),
  },
  {
    id: OrderStatus.Completed,
    value: OrderStatus.Completed,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <CircleCheckIcon className="size-4" />
        {OrderStatus.Completed}
      </div>
    ),
  },
  {
    id: OrderStatus.Cancelled,
    value: OrderStatus.Cancelled,
    children: (
      <div className="flex items-center gap-x-2 capitalize">
        <CircleXIcon className="size-4" />
        {OrderStatus.Cancelled}
      </div>
    ),
  },
];

export function StatusFilter() {
  const [filters, setFilters] = useOrdersFilters();
  return (
    <CommandSelect
      options={options}
      placeholder="Status"
      className="h-9"
      value={filters.status ?? ""}
      onSelect={(value) => setFilters({ status: value as OrderStatus })}
    />
  );
}
