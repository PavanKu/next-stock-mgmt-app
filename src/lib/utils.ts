import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface generateAvatarURIArg {
  seed: string;
  variant: "botttsNeutral" | "initials";
}

export function generateAvatarURI({ seed, variant}: generateAvatarURIArg) {
  let avatar;
  if(variant === "botttsNeutral") {
    avatar = createAvatar(botttsNeutral, {seed});
  } else {
    avatar = createAvatar(initials, {seed, fontWeight:500, fontSize:42});
  }

  return avatar.toDataUri();
}
