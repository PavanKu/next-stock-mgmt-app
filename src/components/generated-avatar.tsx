import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant: "initials" | "botttsNeutral";
}
export function GeneratedAvatar({
  seed,
  className,
  variant,
}: GeneratedAvatarProps) {
  let avatar;

  switch (variant) {
    case "botttsNeutral":
      avatar = createAvatar(botttsNeutral, { seed });
      break;
    case "initials":
    default:
      avatar = createAvatar(initials, { seed, fontSize: 42, fontWeight: 500 });
      break;
  }

  return (
		<Avatar className={cn(className)}>
			<AvatarImage src={avatar.toDataUri()} alt="avatar" />
			<AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
		</Avatar>
	)
}
