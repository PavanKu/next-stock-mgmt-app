import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type ProductGetOne = inferRouterOutputs<AppRouter>["product"]["getOne"];
export type ProductGetMany = inferRouterOutputs<AppRouter>["product"]["getMany"]["items"];
