import { ResponsiveDialog } from "@/components/responsive-dialog";
import { VendorGetOne } from "../../types";
import { VendorForm } from "./vendor-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: VendorGetOne
}

export function UpdateVendorDialog({ open, onOpenChange, initialValues }: Props) {
  return (
    <ResponsiveDialog
      title="Edit Vendor"
      description="Edit the vendor"
      open={open}
      onOpenChange={onOpenChange}
    >
      <VendorForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
}
