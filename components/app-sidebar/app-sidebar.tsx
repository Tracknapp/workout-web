"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import {
  Clock10Icon,
  Dumbbell,
  LayoutDashboardIcon,
  Settings,
} from "lucide-react";
import { NavFooter } from "./nav-footer";
import { SidebarData } from "./types";
import { NavHeader } from "./nav-header";
import { NavMain } from "./nav-main";

const data: SidebarData = {
  navMain: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      id: "routines",
      title: "Routines",
      url: "#",
      icon: Clock10Icon,
    },
    {
      id: "workouts",
      title: "Workouts",
      url: "#",
      icon: Dumbbell,
    },
    {
      id: "settings",
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <NavHeader />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <NavFooter />
    </Sidebar>
  );
}
