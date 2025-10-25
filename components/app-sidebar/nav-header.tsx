"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { Logo } from "../logo";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function NavHeader() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <SidebarHeader>
      <div
        className="flex items-center justify-between px-2 pb-0 pt-3 cursor-pointer"
        onClick={() => {
          router.push("/");
        }}
      >
        <Logo isDark={isDark} />
      </div>
    </SidebarHeader>
  );
}
