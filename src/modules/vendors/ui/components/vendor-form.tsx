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
import { vendorsInsertSchema } from "../../schemas";
import { VendorGetOne } from "../../types";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: VendorGetOne;
}
export function VendorForm({ onSuccess, onCancel, initialValues }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createVendor = useMutation(
    trpc.vendor.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.vendor.getMany.queryOptions({}));
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateVendor = useMutation(
    trpc.vendor.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.vendor.getMany.queryOptions({}));
        if(initialValues?.id) {
          await queryClient.invalidateQueries(trpc.vendor.getOne.queryOptions({id: initialValues.id}));
        }
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof vendorsInsertSchema>>({
    resolver: zodResolver(vendorsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      address: initialValues?.address ?? "",
    },
  });

  const isEdit = !!initialValues?.id;
  const isPending = createVendor.isPending || updateVendor.isPending;

  const onSubmit = (values: z.infer<typeof vendorsInsertSchema>) => {
    if (isEdit) {
      updateVendor.mutate({...values, id: initialValues.id});
    } else {
      createVendor.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. ABC Corporation" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="e.g. contact@abccorp.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="phone"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="address"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="e.g. 123 Business Street, City, State 12345"
                  rows={3}
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
