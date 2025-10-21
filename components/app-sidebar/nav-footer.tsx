"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "../mode-toggle";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "../ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export function NavFooter() {
  const user = useQuery(api.user.getUser);
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirectUrl: "/sign-in" });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarFooter className="p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 justify-around">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={user?.pictureUrl} alt={user?.name} />
              <AvatarFallback className="rounded-full">
                {user?.givenName}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium truncate">{user?.givenName}</p>

            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut size={16} aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
