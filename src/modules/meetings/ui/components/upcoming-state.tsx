import { BanIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

interface Props {
	meetingId: string,
	onCancelMeeting: (id: string) => void,
	isCancelling: boolean
}

export function UpcomingState({meetingId, onCancelMeeting, isCancelling}: Props) {

	const handleCancelMeeting = () => {
		onCancelMeeting(meetingId);
	}

  return (
    <div className="bg-white rounded-lg px-4 py-5 gap-y-8 flex flex-col items-center justify-center">
      <EmptyState
        title="Not started yet"
        description="Once you start the meeting summary will appear here."
        image="/upcoming.svg"
      />
			<div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
				<Button variant="secondary" className="w-full lg:w-auto" onClick={handleCancelMeeting} disabled={isCancelling}>
					<BanIcon />
					Cancel Meeting
				</Button>
				<Button asChild className="w-full lg:w-auto" disabled={isCancelling}>
					<Link href={`/call/${meetingId}`}>
						Start Meeting
					</Link>
				</Button>
			</div>
    </div>
  );
}
