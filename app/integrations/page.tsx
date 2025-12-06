"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { cn } from "@/lib/utils";

interface Integration {
    id: number;
    name: string;
    label: string;
    color: string;
    connected: boolean;
    comingSoon?: boolean;
}

export default function IntegrationsPage() {
    const integrations: Integration[] = [
        { id: 1, name: "Payroll Systems", label: "Payroll", color: "bg-primary", connected: false },
        { id: 2, name: "CRM Platforms", label: "CRM", color: "bg-green-500", connected: false },
        { id: 3, name: "Payment Gateways", label: "Stripe", color: "bg-orange-500", connected: false },
        { id: 4, name: "HRIS", label: "HRIS", color: "bg-muted-foreground", connected: false, comingSoon: true },
    ];

    return (
        <ProtectedRoute>
            <AppLayout title="Seamless Integrations">
                <div className="flex justify-center">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-3xl w-full">
                        <CardHeader>
                            <CardTitle>Seamless Integrations</CardTitle>
                            <CardDescription>
                                Connect your favorite business tools to create a single source of truth for your financial data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {integrations.map((integration) => (
                                    <div
                                        key={integration.id}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-lg border border-border/50 transition-colors",
                                            integration.comingSoon
                                                ? "bg-muted/20 opacity-60"
                                                : "bg-muted/30 hover:bg-muted/50 cursor-pointer"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3",
                                                integration.color
                                            )}
                                        >
                                            {integration.label}
                                        </div>
                                        <p className="font-medium text-foreground text-center">{integration.name}</p>
                                        {integration.comingSoon ? (
                                            <span className="text-xs text-muted-foreground mt-1">Coming Soon</span>
                                        ) : (
                                            <button className="text-sm text-primary hover:underline mt-1">
                                                Connect
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
