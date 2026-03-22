"use client";
import { BuildingIcon, PackageIcon, ShoppingCartIcon, StarIcon } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DashboardUserButton } from "./dashboard-user-button";

const firstSection = [
  /* {
    icon: VideoIcon,
    label: "Meetings",
    href: "/meetings",
  },
  {
    icon: BotIcon,
    label: "Agents",
    href: "/agents",
  }, */
  {
    icon: ShoppingCartIcon,
    label: "Orders",
    href: "/orders",
  },
  {
    icon: BuildingIcon,
    label: "Vendors",
    href: "/vendors",
  },
  {
    icon: PackageIcon,
    label: "Products",
    href: "/products",
  },
];

const secondSection = [
  {
    icon: StarIcon,
    label: "Upgrade",
    href: "/upgrade",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href="/" className="flex items-center gap-2 px-2 pt-2">
          <Image src="/logo.svg" alt="logo" height={36} width={36} />
          <p className="text-2xl font-semibold">Stock App</p>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2">
        <Separator />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4 py-2">
          <Separator />
        </div>
				<SidebarGroup>
					<SidebarContent>
						<SidebarMenu>
							{secondSection.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={pathname===item.href}>
										<Link href={item.href}>
											<item.icon className="size-5" />
											<span className="text-sm font-medium tracking-tight">{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarContent>
				</SidebarGroup>

      </SidebarContent>
			<SidebarFooter>
				<DashboardUserButton />
			</SidebarFooter>

    </Sidebar>
  );
}
