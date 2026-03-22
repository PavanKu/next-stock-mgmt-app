import { ResponsiveDialog } from "@/components/responsive-dialog";
import { VendorForm } from "./vendor-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewVendorDialog({ open, onOpenChange }: Props) {
  return (
    <ResponsiveDialog
      title="New Vendor"
      description="Create a new vendor"
      open={open}
      onOpenChange={onOpenChange}
    >
      <VendorForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
}
