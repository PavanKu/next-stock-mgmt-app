import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CallEnded() {

  return (
    <div className="flex flex-col items-center justify-center bg-radial from-sidebar-accent to-sidebar-accent h-full">
      <div className="py-4 px-8 flex justify-center items-center flex-1">
        <div className="flex flex-col justify-center items-center gap-y-6 bg-background p-10 shadow-sm rounded-lg">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">You have ended the call</h6>
            <p className="text-sm">Summary will appear in a few minutes.</p>
          </div>
					<Button asChild>
              <Link href="/meetings">Back to meetings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
