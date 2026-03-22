"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  PackageIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderGetMany } from "../../types";

const statusIconMap = {
  pending: ClockIcon,
  confirmed: PackageIcon,
  completed: CircleCheckIcon,
  cancelled: CircleXIcon,
};

const statusColorMap = {
  pending: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
  confirmed: "bg-blue-500/20 text-blue-800 border-blue-800/5",
  completed: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
  cancelled: "bg-gray-500/20 text-gray-800 border-gray-800/5",
};

const typeIconMap = {
  purchase: TruckIcon,
  sale: ShoppingCartIcon,
};

const typeColorMap = {
  purchase: "bg-green-500/20 text-green-800 border-green-800/5",
  sale: "bg-purple-500/20 text-purple-800 border-purple-800/5",
};

export const columns: ColumnDef<OrderGetMany[number]>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order Details",
    cell: ({ row }) => {
      const TypeIcon = typeIconMap[row.original.type as keyof typeof typeIconMap];
      return (
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <span className="font-semibold">{row.original.orderNumber}</span>
            <Badge
              variant="outline"
              className={cn(
                "capitalize [&>svg]:size-3",
                typeColorMap[row.original.type as keyof typeof typeColorMap]
              )}
            >
              <TypeIcon className="mr-1" />
              {row.original.type}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.vendor.name}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const Icon = statusIconMap[row.original.status as keyof typeof statusIconMap];
      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize [&>svg]:size-4 text-muted-foreground",
            statusColorMap[row.original.status as keyof typeof statusColorMap]
          )}
        >
          <Icon className="mr-1" />
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.original.totalAmount || "0");
      return (
        <div className="font-medium">
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      );
    },
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {format(new Date(row.original.orderDate), "MMM d, yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "completedAt",
    header: "Completed",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.completedAt
          ? format(new Date(row.original.completedAt), "MMM d, yyyy")
          : "-"}
      </div>
    ),
  },
];
