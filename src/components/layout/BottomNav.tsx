"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Timer, Settings, ListTodo } from "lucide-react";
import { cn } from "../../lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dash",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Focus",
      icon: Timer,
      href: "/timer",
      active: pathname === "/timer",
    },
    // NEW: The Tasks Tab
    {
      label: "Tasks",
      icon: ListTodo,
      href: "/tasks",
      active: pathname === "/tasks",
    },
    {
      label: "Config",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings", // Changed from /config to match your folder
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-[#09090b]/90 backdrop-blur-xl border-t border-zinc-800 z-50">
      <div className="flex justify-around items-center h-16">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
              route.active ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <route.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{route.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}