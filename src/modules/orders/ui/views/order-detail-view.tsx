"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ShoppingCartIcon,
  TruckIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OrderDetailHeader } from "../components/order-detail-header";
import { UpdateOrderDialog } from "../components/update-order-dialog";

interface Props {
  orderNumber: string;
}

const typeIconMap = {
  purchase: TruckIcon,
  sale: ShoppingCartIcon,
};

const typeColorMap = {
  purchase: "bg-green-500/20 text-green-800 border-green-800/5",
  sale: "bg-purple-500/20 text-purple-800 border-purple-800/5",
};

export function OrderDetailView({ orderNumber }: Props) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [RemoveConfirmationDialog, confirmRemove] = useConfirm({
    title: "Are you sure?",
    description: `The following action will remove the Order ${orderNumber}`,
  });
  const [updateOrderDialogOpen, setUpdateOrderDialogOpen] = useState(false);

  const { data: order } = useSuspenseQuery(
    trpc.order.getByOrderNumber.queryOptions({ orderNumber })
  );



  const removeOrder = useMutation(
    trpc.order.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.order.getMany.queryOptions({})
        );
        router.push("/orders");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const handleOrderEditClick = () => {
    setUpdateOrderDialogOpen(true);
  };

  const handleOrderRemoveClick = async () => {
    const ok = await confirmRemove();
    if (!ok) {
      return;
    }
    removeOrder.mutate({ id: order.id });
  };

  const TypeIcon = typeIconMap[order.type as keyof typeof typeIconMap];

  const totalAmount = parseFloat(order.totalAmount || "0");
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + parseFloat(item.totalPrice || "0"),
    0
  );

  return (
    <>
      <UpdateOrderDialog
        open={updateOrderDialogOpen}
        onOpenChange={setUpdateOrderDialogOpen}
        initialValues={order}
      />
      <RemoveConfirmationDialog />
      <div className="px-4 py-4 md:px-8 flex flex-col gap-y-2 flex-1">
        <OrderDetailHeader
          orderNumber={orderNumber}
          name={order.orderNumber}
          onEdit={handleOrderEditClick}
          onRemove={handleOrderRemoveClick}
        />
        <div className="container mx-auto py-6 px-4 md:px-8 space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize [&>svg]:size-4",
                    typeColorMap[order.type as keyof typeof typeColorMap]
                  )}
                >
                  <TypeIcon className="mr-1" />
                  {order.type} Order
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Created {format(new Date(order.orderDate), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {item.product.sku}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(item.unitPrice || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${parseFloat(item.totalPrice || "0").toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total: ${itemsTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">{order.vendor.name}</div>
              </div>
              {order.vendor.email && (
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-sm">{order.vendor.email}</div>
                </div>
              )}
              {order.vendor.phone && (
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="text-sm">{order.vendor.phone}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Order Date</div>
                <div className="text-sm">
                  {format(new Date(order.orderDate), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
      </div>
    </>
  );
}

export function OrderDetailViewLoading() {
  return (
    <LoadingState
      title="Loading Order Details"
      description="This may take a few seconds..."
    />
  );
}

export function OrderDetailViewError() {
  return (
    <ErrorState
      title="Failed to load order"
      description="Something went wrong..."
    />
  );
}