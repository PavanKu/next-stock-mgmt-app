import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { DEFAULT_PAGE } from "@/constants";
import { MeetingStatus } from "../../types";

export function useMeetignsFilters() {
    return useQueryStates({
        search: parseAsString.withDefault("").withOptions({clearOnDefault: true}),
        page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({clearOnDefault: true}),
        agentId: parseAsString.withDefault("").withOptions({clearOnDefault: true}),
        status: parseAsStringEnum(Object.values(MeetingStatus))
    })
}