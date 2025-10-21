import type { ElementType } from "react";

export interface NavItem {
  id: string;
  title: string;
  icon: ElementType;
  url?: string;
  isActive?: boolean;
}

export interface SidebarData {
  navMain: NavItem[];
}
