import { ResponsiveDialog } from "@/components/responsive-dialog";
import { ProductForm } from "./product-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProductDialog({ open, onOpenChange }: Props) {
  return (
    <ResponsiveDialog
      title="New Product"
      description="Create a new product"
      open={open}
      onOpenChange={onOpenChange}
    >
      <ProductForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
}
