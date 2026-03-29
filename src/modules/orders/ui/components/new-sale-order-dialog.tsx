"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useRouter } from "next/navigation";
import { SaleOrderForm } from "./sale-order-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSaleOrderDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  return (
    <ResponsiveDialog
      title="New Sale Order"
      description="Create a new sale order."
      open={open}
      onOpenChange={onOpenChange}
    >
      <SaleOrderForm
        onSuccess={(orderNumber) => {
          onOpenChange(false);
          router.push(`/orders/${orderNumber}`);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
}
