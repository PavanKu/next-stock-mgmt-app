"use client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { DollarSignIcon, HashIcon, PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";
import { ProductIdViewHeader } from "../components/product-id-header";
import { UpdateProductDialog } from "../components/update-product-dialog";

interface Props {
  id: string;
}
export function ProductIdView({ id }: Props) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [RemoveConfirmationDialog, confirmRemove] = useConfirm({
    title: "Are you sure?",
    description: `The following action will remove the Product with id ${id}`,
  });
  const [updateProductDialogOpen, setUpdateProductDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(trpc.product.getOne.queryOptions({ id }));

  const removeProduct = useMutation(
    trpc.product.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.product.getMany.queryOptions({})
        );
        router.push("/products");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const handleProductEditClick = () => {
    setUpdateProductDialogOpen(true);
  };

  const handleProductRemoveClick = async () => {
    const ok = await confirmRemove();
    if (!ok) {
      return;
    }
    removeProduct.mutate({ id });
  };

  const costPrice = data.costPrice ? parseFloat(data.costPrice) : null;
  const sellingPrice = data.sellingPrice ? parseFloat(data.sellingPrice) : null;
  const margin = costPrice && sellingPrice ? sellingPrice - costPrice : null;

  return (
    <>
      <UpdateProductDialog
        open={updateProductDialogOpen}
        onOpenChange={setUpdateProductDialogOpen}
        initialValues={data}
      />
      <RemoveConfirmationDialog />
      <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
        <ProductIdViewHeader
          id={id}
          name={data.name}
          onEdit={handleProductEditClick}
          onRemove={handleProductRemoveClick}
        />
        <div className="border bg-background rounded-lg">
          <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
            <div className="flex items-center gap-x-3">
              <PackageIcon
                className="size-10 text-blue-600"
              />
              <div className="flex flex-col">
                <h2 className="text-2xl font-medium">{data.name}</h2>
                <div className="flex items-center gap-x-1 mt-1">
                  <HashIcon className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-mono">{data.sku}</span>
                </div>
              </div>
            </div>
            <Badge
              variant={data.status === 'active' ? 'default' : 'secondary'}
              className="w-fit capitalize"
            >
              {data.status}
            </Badge>
            {data.description && (
              <div className="flex flex-col gap-y-2">
                <p className="text-xl font-medium">Description</p>
                <p className="text-neutral-800 whitespace-pre-line">{data.description}</p>
              </div>
            )}
            {(costPrice || sellingPrice) && (
              <div className="flex flex-col gap-y-4">
                <p className="text-xl font-medium">Pricing Information</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {costPrice && (
                    <div className="flex items-center gap-x-2">
                      <DollarSignIcon className="size-5 text-orange-600" />
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Cost Price</span>
                        <span className="text-neutral-800 font-medium">${costPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {sellingPrice && (
                    <div className="flex items-center gap-x-2">
                      <DollarSignIcon className="size-5 text-green-600" />
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Selling Price</span>
                        <span className="text-neutral-800 font-medium">${sellingPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {margin && (
                    <div className="flex items-center gap-x-2">
                      <DollarSignIcon className="size-5 text-blue-600" />
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Profit Margin</span>
                        <span className={`font-medium ${margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${margin.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function ProductIdViewLoading() {
  return (
    <LoadingState
      title="Loading Product"
      description="This may take few seconds..."
    />
  );
}

export function ProductIdViewError() {
  return (
    <ErrorState
      title="Failed to load product"
      description="Something went wrong..."
    />
  );
}
