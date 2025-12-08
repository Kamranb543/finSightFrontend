"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Search, Bell, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="flex h-14 sm:h-16 lg:h-20 items-center justify-between border-b border-border bg-background px-3 sm:px-4 lg:px-6 xl:px-8 gap-2 sm:gap-4">
      <h2 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight truncate min-w-0 flex-1 sm:flex-none">
        {title}
      </h2>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6 min-w-0 flex-shrink-0">
        {/* Search */}
        <div className="relative w-full max-w-[200px] sm:max-w-[280px] lg:max-w-[360px] xl:w-96 hidden sm:block">
          <Search className="absolute left-2 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ask FinSight..."
            className="pl-8 sm:pl-10 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Mobile Search Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 xl:gap-4 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-muted-foreground hover:text-foreground hidden sm:flex">
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 cursor-pointer border border-border hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background transition-all flex-shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" alt={user?.username || "User"} />
            <AvatarFallback className="text-[10px] sm:text-xs">
              {user?.username?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>

  );
}
