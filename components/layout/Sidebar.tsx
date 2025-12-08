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
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className={`flex lg:items-center justify-between bg-sidebar border-b border-sidebar-border py-3 px-1 sm:py-4 sm:px-4 lg:hidden`}>
        <h1 className={`text-base sm:text-lg font-bold text-primary hidden sm:block`}>FinSight</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 sm:h-10 sm:w-10"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16 lg:w-20" : "w-72 sm:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4">
          {!collapsed && (
            <h1 className="text-lg sm:text-xl font-bold text-primary truncate ">FinSight</h1>
          )}

          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-2 sm:py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center justify-start gap-2 sm:gap-3 px-2 sm:px-3 py-3 sm:py-5 text-xs sm:text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground/70",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 sm:p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2 sm:gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 text-xs sm:text-sm",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            {!collapsed && <span className="truncate">Logout</span>}
          </Button>

          {!collapsed && (
            <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-sidebar-foreground/40 text-center">
              NET Labs <br /> © 2025
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
