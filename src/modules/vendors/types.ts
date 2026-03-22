import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type VendorGetOne = inferRouterOutputs<AppRouter>["vendor"]["getOne"];
export type VendorGetMany = inferRouterOutputs<AppRouter>["vendor"]["getMany"]["items"];
