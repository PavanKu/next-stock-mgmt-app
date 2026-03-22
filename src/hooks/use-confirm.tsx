import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { JSX, useState } from "react";

interface Props {
  title: string;
  description: string;
}

export function useConfirm({
  title,
  description,
}: Props): [() => JSX.Element, () => Promise<unknown>] {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    return setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => {
    return (
      <ResponsiveDialog
        open={promise !== null}
        onOpenChange={handleClose}
        title={title}
        description={description}
      >
        <div className="pt-4 flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
					<Button variant="outline" onClick={handleCancel} className="w-full lg:w-auto">Cancel</Button>
					<Button onClick={handleConfirm} className="w-full lg:w-auto">Confirm</Button>
				</div>
      </ResponsiveDialog>
    );
  };

	return [ConfirmationDialog, confirm];
}
