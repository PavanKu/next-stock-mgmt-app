
import { EmptyState } from "@/components/empty-state";

export function ProcessingState() {
  return (
    <div className="bg-white rounded-lg px-4 py-5 gap-y-8 flex flex-col items-center justify-center">
      <EmptyState
        title="Meeting Cancelled"
        description="This meeting was completed, a summary will appear soon."
        image="/processing.svg"
      />
    </div>
  );
}
