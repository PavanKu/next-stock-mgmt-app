"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CommandSelect } from "@/components/command-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";
import { orderInsertSchema } from "../../schemas";
import { OrderGetOne } from "../../types";

// Create a modified schema for sale orders (without type field)
const saleOrderSchema = orderInsertSchema.omit({ type: true });

type OrderItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  productId: string;
  quantity: number;
  unitPrice: string | null;
  createdBy: string;
  updatedBy: string;
  orderId: string;
  totalPrice: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
  };
};

interface Props {
  onSuccess?: (orderNumber: string) => void;
  onCancel?: () => void;
  initialValues?: OrderGetOne;
}

export function SaleOrderForm({ onSuccess, onCancel, initialValues }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [vendorSearch, setVendorSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const vendors = useQuery(
    trpc.vendor.getMany.queryOptions({
      pageSize: 100,
      search: vendorSearch,
    })
  );

  const products = useQuery(
    trpc.product.getMany.queryOptions({
      pageSize: 100,
      search: productSearch,
    })
  );

  const createOrder = useMutation(
    trpc.order.create.mutationOptions({
      onSuccess: async (newOrder) => {
        await queryClient.invalidateQueries(trpc.order.getMany.queryOptions({}));
        onSuccess?.(newOrder.orderNumber);
        toast.success("Sale order created successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateOrder = useMutation(
    trpc.order.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.order.getMany.queryOptions({}));
        if(initialValues?.id) {
          await queryClient.invalidateQueries(trpc.order.getByOrderNumber.queryOptions({orderNumber: initialValues.orderNumber}));
        }
        onSuccess?.(initialValues?.orderNumber || "");
        toast.success("Sale order updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof saleOrderSchema>>({
    resolver: zodResolver(saleOrderSchema),
    defaultValues: {
      vendorId: initialValues?.vendorId ?? "",
      items: initialValues?.items?.map((item: OrderItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice || "0"),
      })) ?? [
        {
          productId: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
      notes: initialValues?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const totalAmount = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const isEdit = !!initialValues?.id;
  const isPending = createOrder.isPending || updateOrder.isPending;

  const onSubmit = (values: z.infer<typeof saleOrderSchema>) => {
    // Add the hardcoded type for sale orders
    const orderData = { ...values, type: "sale" as const };
    
    if (isEdit) {
      updateOrder.mutate({...orderData, id: initialValues.id});
    } else {
      createOrder.mutate(orderData);
    }
  };

  const addItem = () => {
    append({
      productId: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getSelectedProduct = (productId: string) => {
    return products.data?.items.find((p) => p.id === productId);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Customer Selection */}
        <FormField
          name="vendorId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <CommandSelect
                  options={(vendors.data?.items ?? []).map((vendor) => ({
                    id: vendor.id,
                    value: vendor.id,
                    children: (
                      <div className="flex flex-col">
                        <span className="font-medium">{vendor.name}</span>
                        {vendor.email && (
                          <span className="text-sm text-muted-foreground">
                            {vendor.email}
                          </span>
                        )}
                      </div>
                    ),
                  }))}
                  onSelect={field.onChange}
                  onSearch={setVendorSearch}
                  value={field.value}
                  placeholder="Select a customer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Sale Items</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={isPending}
            >
              <PlusIcon className="size-4" />
              Add Item
            </Button>
          </div>

          {fields.map((field, index) => {
            const selectedProduct = getSelectedProduct(
              form.watch(`items.${index}.productId`)
            );
            const quantity = form.watch(`items.${index}.quantity`) || 0;
            const unitPrice = form.watch(`items.${index}.unitPrice`) || 0;
            const lineTotal = quantity * unitPrice;

            return (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-4 p-4 border rounded-lg"
              >
                {/* Product Selection */}
                <div className="col-span-12 md:col-span-4">
                  <FormField
                    name={`items.${index}.productId`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <FormControl>
                          <CommandSelect
                            options={(products.data?.items ?? []).map(
                              (product) => ({
                                id: product.id,
                                value: product.id,
                                children: (
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {product.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      SKU: {product.sku} | Stock: {product.quantity}
                                    </span>
                                  </div>
                                ),
                              })
                            )}
                            onSelect={(value) => {
                              field.onChange(value);
                              // Auto-fill selling price for sales
                              const product = products.data?.items.find(
                                (p) => p.id === value
                              );
                              if (product) {
                                const price = parseFloat(product.sellingPrice || "0");
                                form.setValue(`items.${index}.unitPrice`, price);
                              }
                            }}
                            onSearch={setProductSearch}
                            value={field.value}
                            placeholder="Select product"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-6 md:col-span-2">
                  <FormField
                    name={`items.${index}.quantity`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-6 md:col-span-2">
                  <FormField
                    name={`items.${index}.unitPrice`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Line Total */}
                <div className="col-span-10 md:col-span-3">
                  <Label>Line Total</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                    ${lineTotal.toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="col-span-2 md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={fields.length === 1 || isPending}
                  >
                    <MinusIcon className="size-4" />
                  </Button>
                </div>

                {/* Stock Warning */}
                {selectedProduct &&
                  quantity > selectedProduct.quantity && (
                    <div className="col-span-12 text-sm text-destructive">
                      Warning: Requested quantity ({quantity}) exceeds available
                      stock ({selectedProduct.quantity})
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {/* Total Amount */}
        <div className="flex justify-end">
          <div className="text-right">
            <Label className="text-base font-medium">Total Amount</Label>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Notes */}
        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes for this sale order..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Sale Order" : "Create Sale Order")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
