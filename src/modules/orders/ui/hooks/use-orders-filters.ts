import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants";
import { OrderStatus, OrderType } from "../../types";

export function useOrdersFilters() {
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    vendorId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    status: parseAsStringEnum(Object.values(OrderStatus)),
    type: parseAsStringEnum(Object.values(OrderType)),
    dateFrom: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    dateTo: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
}
