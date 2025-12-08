"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function ReportsPage() {
    const { reportsData } = useSelector((state: RootState) => state.finance);

    return (
        <ProtectedRoute>
            <AppLayout title="Reports">
                <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-1 sm:space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Profit & Loss</h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Financial performance over the last 7 months.
                        </p>
                    </div>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Profit & Loss (YTD)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--color-muted)/0.2' }}
                                            contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius)' }}
                                            itemStyle={{ color: 'var(--color-foreground)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="revenue" name="Revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="netIncome" name="Net Income" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
