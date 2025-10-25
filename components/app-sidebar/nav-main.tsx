"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "./types";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.url ||
            pathname.startsWith(`${item.url}/`);

          return (
            <Link href={item.url as string} key={item.id}>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
