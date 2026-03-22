import { agentRouter } from '@/modules/agents/server/procedures';
import { meetingRouter } from '@/modules/meetings/server/procedure';
import { orderRouter } from '@/modules/orders/server/procedures';
import { productRouter } from '@/modules/products/server/procedures';
import { vendorRouter } from '@/modules/vendors/server/procedures';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  agent: agentRouter,
  meeting: meetingRouter,
  order: orderRouter,
  product: productRouter,
  vendor: vendorRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
