"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppLayoutProps {
    children: React.ReactNode;
    title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden w-0 min-w-0">
                <Header title={title} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
