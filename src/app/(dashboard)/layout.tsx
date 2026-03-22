import { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavBar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="flex flex-col h-screen w-screen">
        <DashboardNavBar />
        {children}
      </main>
    </SidebarProvider>
  );
}
