"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useRouter } from "next/navigation";
import { OrderForm } from "./order-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewOrderDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  return (
    <ResponsiveDialog
      title="New Order"
      description="Create a new order."
      open={open}
      onOpenChange={onOpenChange}
    >
      <OrderForm
        onSuccess={(orderNumber) => {
          onOpenChange(false);
          router.push(`/orders/${orderNumber}`);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
}
