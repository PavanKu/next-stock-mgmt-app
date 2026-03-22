import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { productsInsertSchema } from "../../schemas";
import { ProductGetOne } from "../../types";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: ProductGetOne;
}
export function ProductForm({ onSuccess, onCancel, initialValues }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createProduct = useMutation(
    trpc.product.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.product.getMany.queryOptions({}));
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateProduct = useMutation(
    trpc.product.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.product.getMany.queryOptions({}));
        if(initialValues?.id) {
          await queryClient.invalidateQueries(trpc.product.getOne.queryOptions({id: initialValues.id}));
        }
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof productsInsertSchema>>({
    resolver: zodResolver(productsInsertSchema),
    defaultValues: {
      sku: initialValues?.sku ?? "",
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      costPrice: initialValues?.costPrice ?? "",
      sellingPrice: initialValues?.sellingPrice ?? "",
    },
  });

  const isEdit = !!initialValues?.id;
  const isPending = createProduct.isPending || updateProduct.isPending;

  const onSubmit = (values: z.infer<typeof productsInsertSchema>) => {
    if (isEdit) {
      updateProduct.mutate({...values, id: initialValues.id});
    } else {
      createProduct.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="sku"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. PROD-001" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Wireless Headphones" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="e.g. High-quality wireless headphones with noise cancellation"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="costPrice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="sellingPrice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selling Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="e.g. 99.99"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button type="button" variant="ghost" disabled={isPending} onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
