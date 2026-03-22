"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DollarSignIcon, HashIcon, PackageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProductGetMany } from "../../types";

export const columns: ColumnDef<ProductGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: "Product Info",
		cell: ({ row }) => (
			<div className="flex flex-col gap-y-1">
				<div className="flex items-center gap-x-2">
					<PackageIcon className="size-6 text-blue-600" />
					<span className="font-semibold capitalize">{row.original.name}</span>
				</div>
				<div className="flex flex-col gap-y-1 ml-8">
					<div className="flex items-center gap-x-1">
						<HashIcon className="size-3 text-muted-foreground" />
						<span className="text-sm text-muted-foreground font-mono">{row.original.sku}</span>
					</div>
					{row.original.description && (
						<div className="text-sm text-muted-foreground max-w-xs truncate">
							{row.original.description}
						</div>
					)}
				</div>
			</div>
		)
  },
  {
    accessorKey: "pricing",
    header: "Pricing",
		cell: ({ row }) => {
			const costPrice = row.original.costPrice ? parseFloat(row.original.costPrice) : null;
			const sellingPrice = row.original.sellingPrice ? parseFloat(row.original.sellingPrice) : null;
			const margin = costPrice && sellingPrice ? sellingPrice - costPrice : null;
			
			return (
				<div className="flex flex-col gap-y-1">
					{costPrice && (
						<div className="flex items-center gap-x-1">
							<DollarSignIcon className="size-3 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Cost: ${costPrice.toFixed(2)}</span>
						</div>
					)}
					{sellingPrice && (
						<div className="flex items-center gap-x-1">
							<DollarSignIcon className="size-3 text-green-600" />
							<span className="text-sm font-medium">Price: ${sellingPrice.toFixed(2)}</span>
						</div>
					)}
					{margin && margin > 0 && (
						<div className="text-xs text-green-600">
							Margin: ${margin.toFixed(2)}
						</div>
					)}
				</div>
			)
		}
  },
  {
    accessorKey: "status",
    header: "Status",
		cell: ({row}) => (
			<Badge 
				variant={row.original.status === 'active' ? 'default' : 'secondary'} 
				className="capitalize"
			>
				{row.original.status}
			</Badge>
		)
  },
];
