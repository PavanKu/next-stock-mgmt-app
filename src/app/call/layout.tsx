import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return <main className="flex flex-col h-screen w-screen">{children}</main>;
}
