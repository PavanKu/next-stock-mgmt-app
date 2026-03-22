"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { OrderForm } from "@/modules/orders/ui/components/order-form";

export default function NewOrderPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 px-4 md:px-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/orders">
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Order</h1>
        <p className="text-muted-foreground">
          Fill out the details below to create a new purchase or sale order.
        </p>
      </div>

      <div className="max-w-4xl">
        <OrderForm
          onSuccess={(orderNumber) => {
            router.push(`/orders/${orderNumber}`);
          }}
          onCancel={() => {
            router.push("/orders");
          }}
        />
      </div>
    </div>
  );
}
