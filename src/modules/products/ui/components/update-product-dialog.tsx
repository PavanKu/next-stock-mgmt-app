import { ResponsiveDialog } from "@/components/responsive-dialog";
import { ProductGetOne } from "../../types";
import { ProductForm } from "./product-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: ProductGetOne
}

export function UpdateProductDialog({ open, onOpenChange, initialValues }: Props) {
  return (
    <ResponsiveDialog
      title="Edit Product"
      description="Edit the product"
      open={open}
      onOpenChange={onOpenChange}
    >
      <ProductForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
}
