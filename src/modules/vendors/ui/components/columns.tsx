"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BuildingIcon, CornerDownRightIcon, MailIcon, PhoneIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { VendorGetMany } from "../../types";

export const columns: ColumnDef<VendorGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: "Vendor Name",
		cell: ({ row }) => (
			<div className="flex flex-col gap-y-1">
				<div className="flex items-center gap-x-2">
					<BuildingIcon className="size-6 text-blue-600" />
					<span className="font-semibold capitalize">{row.original.name}</span>
				</div>
				{(row.original.email || row.original.phone) && (
					<div className="flex flex-col gap-y-1 ml-8">
						{row.original.email && (
							<div className="flex items-center gap-x-1">
								<MailIcon className="size-3 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">{row.original.email}</span>
							</div>
						)}
						{row.original.phone && (
							<div className="flex items-center gap-x-1">
								<PhoneIcon className="size-3 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">{row.original.phone}</span>
							</div>
						)}
					</div>
				)}
			</div>
		)
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
