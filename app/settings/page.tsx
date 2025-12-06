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
                <div className="max-w-4xl space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
                        <p className="text-muted-foreground">
                            Customize the look and feel of your workspace.
                        </p>
                    </div>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of your workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="mode" className="text-base font-medium">Mode</Label>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-sm", theme === "light" ? "text-foreground font-medium" : "text-muted-foreground")}>Light</span>
                                        <Switch
                                            id="mode"
                                            checked={theme === "dark"}
                                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                        />
                                        <span className={cn("text-sm", theme === "dark" ? "text-foreground font-medium" : "text-muted-foreground")}>Dark</span>
                                    </div>
                                </div>
                                <div className="h-[1px] bg-border" />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-medium">Color Theme</Label>
                                <div className="flex items-center gap-4">
                                    {["blue", "red", "green", "purple"].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c as any)}
                                            className={cn(
                                                "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all",
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
                                            {color === c && <div className="h-3 w-3 rounded-full bg-white" />}
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
