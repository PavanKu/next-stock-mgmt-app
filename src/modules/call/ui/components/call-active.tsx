import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Image from "next/image";
import Link from "next/link";

interface Props {
  meetingName: string;
  onLeave: () => void;
}

export function CallActive({ meetingName, onLeave }: Props) {
  return (
    <div className="flex flex-col justify-between p-4 h-full">
      <div className="rounded-full p-4 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center justify-center p-1 rounded-full"
        >
          <Image src="/logo.svg" height={22} width={22} alt="Logo" />
        </Link>
        <h4 className="text-base">{meetingName}</h4>
      </div>
      <SpeakerLayout />
      <div className="rounded-full px-4">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
}
