import { LoaderIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { generateAvatarURI } from "@/lib/utils";
import { CallConnect } from "./call-connect";

interface Props {
  meetingId: string;
  meetingName: string;
}

export function CallProvider({ meetingId, meetingName }: Props) {
  const { data, isPending } = authClient.useSession();

  if (!data || isPending) {
    return <CallLoader />;
  }

  const { user } = data;

  return (
    <CallConnect
      meetingId={meetingId}
      meetingName={meetingName}
      userId={user.id}
      userName={user.name}
      userImage={
        user.image ??
        generateAvatarURI({ seed: user.name, variant: "initials" })
      }
    />
  );
}

export function CallLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-radial from-sidebar-accent to-sidebar">
      <LoaderIcon className="size-6 animate-spin" />
    </div>
  );
}
