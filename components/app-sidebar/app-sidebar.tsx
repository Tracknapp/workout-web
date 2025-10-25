"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Dumbbell, History, LayoutDashboardIcon, Settings } from "lucide-react";
import { NavFooter } from "./nav-footer";
import { SidebarData } from "./types";
import { NavHeader } from "./nav-header";
import { NavMain } from "./nav-main";

const data: SidebarData = {
  navMain: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      id: "workout-plans",
      title: "Workout Plans",
      url: "/workout",
      icon: Dumbbell,
    },
    {
      id: "workouts-history",
      title: "Workouts History",
      url: "/history",
      icon: History,
    },
    {
      id: "settings",
      title: "Settings",
      url: "/settings",
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
