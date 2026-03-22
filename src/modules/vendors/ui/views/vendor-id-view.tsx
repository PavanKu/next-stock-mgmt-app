"use client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { BuildingIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";
import { VendorIdViewHeader } from "../components/vendor-id-header";
import { UpdateVendorDialog } from "../components/update-vendor-dialog";

interface Props {
  id: string;
}
export function VendorIdView({ id }: Props) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [RemoveConfirmationDialog, confirmRemove] = useConfirm({
    title: "Are you sure?",
    description: `The following action will remove the Vendor with id ${id}`,
  });
  const [updateVendorDialogOpen, setUpdateVendorDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(trpc.vendor.getOne.queryOptions({ id }));

  const removeVendor = useMutation(
    trpc.vendor.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.vendor.getMany.queryOptions({})
        );
        router.push("/vendors");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const handleVendorEditClick = () => {
    setUpdateVendorDialogOpen(true);
  };

  const handleVendorRemoveClick = async () => {
    const ok = await confirmRemove();
    if (!ok) {
      return;
    }
    removeVendor.mutate({ id });
  };

  return (
    <>
      <UpdateVendorDialog
        open={updateVendorDialogOpen}
        onOpenChange={setUpdateVendorDialogOpen}
        initialValues={data}
      />
      <RemoveConfirmationDialog />
      <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
        <VendorIdViewHeader
          id={id}
          name={data.name}
          onEdit={handleVendorEditClick}
          onRemove={handleVendorRemoveClick}
        />
        <div className="border bg-background rounded-lg">
          <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
            <div className="flex items-center gap-x-3">
              <BuildingIcon
                className="size-10 text-blue-600"
              />
              <h2 className="text-2xl font-medium">{data.name}</h2>
            </div>
            <Badge
              variant={data.status === 'active' ? 'default' : 'secondary'}
              className="w-fit capitalize"
            >
              {data.status}
            </Badge>
            <div className="flex flex-col gap-y-4">
              <p className="text-xl font-medium">Contact Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.email && (
                  <div className="flex items-center gap-x-2">
                    <MailIcon className="size-5 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-neutral-800">{data.email}</span>
                    </div>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-center gap-x-2">
                    <PhoneIcon className="size-5 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-neutral-800">{data.phone}</span>
                    </div>
                  </div>
                )}
              </div>
              {data.address && (
                <div className="flex items-start gap-x-2">
                  <MapPinIcon className="size-5 text-blue-600 mt-1" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="text-neutral-800 whitespace-pre-line">{data.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function VendorIdViewLoading() {
  return (
    <LoadingState
      title="Loading Vendor"
      description="This may take few seconds..."
    />
  );
}

export function VendorIdViewError() {
  return (
    <ErrorState
      title="Failed to load vendor"
      description="Something went wrong..."
    />
  );
}
