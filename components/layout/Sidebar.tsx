"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store/store";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Workflow,
  BarChart3,
  Scale,
  Zap,
  Settings,
  LogOut,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Data Extraction", href: "/data-extraction", icon: FileText },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Workflows", href: "/workflows", icon: Workflow },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Budgeting", href: "/budgeting", icon: Scale },
  { name: "Tax Filing", href: "/tax-filing", icon: Calculator },
  { name: "Integrations", href: "/integrations", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
  };

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">FinSight</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-6 text-base font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
        <div className="mt-4 text-xs text-sidebar-foreground/40 text-center">
          NET Labs <br /> © 2025
        </div>
      </div>
    </div>
  );
}
