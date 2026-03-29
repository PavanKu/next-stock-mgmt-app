"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
    ShoppingCartIcon,
    TruckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderGetMany } from "../../types";

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

];
