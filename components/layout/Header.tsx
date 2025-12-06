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
    <header className="flex h-20 items-center justify-between border-b border-border bg-background px-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

      <div className="flex items-center gap-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ask FinSight: 'What was my net income in June?'"
            className="pl-10 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </Button>

          <Avatar className="h-9 w-9 cursor-pointer border border-border hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background transition-all">
            <AvatarImage src="https://github.com/shadcn.png" alt={user?.username || "User"} />
            <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
