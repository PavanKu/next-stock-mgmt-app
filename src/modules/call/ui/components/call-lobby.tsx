import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { generateAvatarURI } from "@/lib/utils";
import {
	DefaultVideoPlaceholder,
	StreamVideoParticipant,
	ToggleAudioPreviewButton,
	ToggleVideoPreviewButton,
	useCallStateHooks,
	VideoPreview,
} from "@stream-io/video-react-sdk";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { CallLoader } from "./call-provider";

interface Props {
  onJoin: () => void;
}

function DisabledVideoPreview() {
  const { data, isPending } = authClient.useSession();
	if (!data || isPending) {
			return <CallLoader />
		}
  const user = data?.user;

  return (
    <DefaultVideoPlaceholder
      participant={
        {
          name: user.name,
          image:
            user.image ??
            generateAvatarURI({ seed: user?.name ?? "", variant: "initials" }),
        } as StreamVideoParticipant
      }
    />
  );
}

function AllowBrowserPermissions() {
  return (
    <p className="text-sm">
      Please grant your browser a permission to access your camera and
      microphone.
    </p>
  );
}

export function CallLobby({ onJoin }: Props) {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const { hasBrowserPermission: hasCameraPermission } = useCameraState();

  const hasBrowserMediaPermission = hasMicPermission && hasCameraPermission;

  return (
    <div className="flex flex-col items-center justify-center bg-radial from-sidebar-accent to-sidebar-accent h-full">
      <div className="py-4 px-8 flex justify-center items-center flex-1">
        <div className="flex flex-col justify-center items-center gap-y-6 bg-background p-10 shadow-sm rounded-lg">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">Ready to join?</h6>
            <p className="text-sm">Set up your call before joining</p>
          </div>
          <VideoPreview
            DisabledVideoPreview={
              hasBrowserMediaPermission
                ? DisabledVideoPreview
                : AllowBrowserPermissions
            }
          />
					<div className="flex gap-x-2">
						<ToggleAudioPreviewButton />
						<ToggleVideoPreviewButton />
					</div>
					<div className="flex gap-x-2 justify-between w-full">
						<Button asChild variant="ghost">
							<Link href="/meetings">
							Cancel
							</Link>
						</Button>
						<Button onClick={onJoin}>
							<LogInIcon />
							Join Call
						</Button>
					</div>
        </div>
      </div>
    </div>
  );
}
