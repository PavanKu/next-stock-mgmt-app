import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type OrderGetOne = inferRouterOutputs<AppRouter>["order"]["getOne"];
export type OrderGetMany = inferRouterOutputs<AppRouter>["order"]["getMany"]["items"];

export enum OrderType {
  Purchase = "purchase",
  Sale = "sale",
}


