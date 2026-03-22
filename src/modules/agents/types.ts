import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type AgentGetOne = inferRouterOutputs<AppRouter>["agent"]["getOne"];
export type AgentGetMany = inferRouterOutputs<AppRouter>["agent"]["getMany"]["items"];