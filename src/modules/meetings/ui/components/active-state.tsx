import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

interface Props {
  meetingId: string;
}

export function ActiveState({ meetingId }: Props) {
  return (
    <div className="bg-white rounded-lg px-4 py-5 gap-y-8 flex flex-col items-center justify-center">
      <EmptyState
        title="meeting is active"
        description="Meeting will end once all participants have left."
        image="/upcoming.svg"
      />
      <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
        <Button asChild className="w-full lg:w-auto">
          <Link href={`/call/${meetingId}`}>Join Meeting</Link>
        </Button>
      </div>
    </div>
  );
}
