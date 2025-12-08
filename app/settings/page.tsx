"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { theme, setTheme, color, setColor } = useTheme();

    return (
        <ProtectedRoute>
            <AppLayout title="Settings">
                <div className="max-w-4xl space-y-4 sm:space-y-6">
                    <div className="space-y-1 sm:space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Appearance</h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Customize the look and feel of your workspace.
                        </p>
                    </div>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Customize the look and feel of your workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 pt-0">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="mode" className="text-sm sm:text-base font-medium">Mode</Label>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs sm:text-sm", theme === "light" ? "text-foreground font-medium" : "text-muted-foreground")}>Light</span>
                                        <Switch
                                            id="mode"
                                            checked={theme === "dark"}
                                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                        />
                                        <span className={cn("text-xs sm:text-sm", theme === "dark" ? "text-foreground font-medium" : "text-muted-foreground")}>Dark</span>
                                    </div>
                                </div>
                                <div className="h-[1px] bg-border" />
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <Label className="text-sm sm:text-base font-medium">Color Theme</Label>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    {["blue", "red", "green", "purple"].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c as any)}
                                            className={cn(
                                                "h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 flex items-center justify-center transition-all",
                                                color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                                            )}
                                            style={{
                                                backgroundColor:
                                                    c === "blue" ? "oklch(0.6 0.18 250)" :
                                                        c === "red" ? "oklch(0.6 0.2 25)" :
                                                            c === "green" ? "oklch(0.7 0.15 140)" :
                                                                "oklch(0.7 0.15 320)"
                                            }}
                                        >
                                            {color === c && <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
