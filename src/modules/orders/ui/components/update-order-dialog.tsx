import { ResponsiveDialog } from "@/components/responsive-dialog";
import { OrderGetOne } from "../../types";
import { OrderForm } from "./order-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: OrderGetOne;
}

export function UpdateOrderDialog({ open, onOpenChange, initialValues }: Props) {
  return (
    <ResponsiveDialog
      title="Edit Order"
      description="Edit the order"
      open={open}
      onOpenChange={onOpenChange}
    >
      <OrderForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
}