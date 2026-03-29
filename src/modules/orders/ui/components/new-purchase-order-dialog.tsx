"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useRouter } from "next/navigation";
import { PurchaseOrderForm } from "./purchase-order-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPurchaseOrderDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  return (
    <ResponsiveDialog
      title="New Purchase Order"
      description="Create a new purchase order."
      open={open}
      onOpenChange={onOpenChange}
    >
      <PurchaseOrderForm
        onSuccess={(orderNumber) => {
          onOpenChange(false);
          router.push(`/orders/${orderNumber}`);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
}
