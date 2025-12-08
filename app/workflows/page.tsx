"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

interface PayableItem {
    id: number;
    vendor: string;
    dueDate: string;
    amount: number;
    approved: boolean;
}

interface ReceivableItem {
    id: number;
    client: string;
    status: string;
    amount: number;
}

export default function WorkflowsPage() {
    const [payables, setPayables] = useState<PayableItem[]>([
        { id: 1, vendor: "Innovate Tech Inc.", dueDate: "Aug 14, 2025", amount: 1250.00, approved: false },
        { id: 2, vendor: "Office Supplies Co.", dueDate: "Jul 28, 2025", amount: 345.20, approved: false },
    ]);

    const receivables: ReceivableItem[] = [
        { id: 1, client: "ClientCorp", status: "Overdue by 5 days", amount: 5000.00 },
        { id: 2, client: "Global Solutions Ltd.", status: "Due in 10 days", amount: 12500.00 },
    ];

    const handleApprove = (id: number) => {
        setPayables(payables.map(p => p.id === id ? { ...p, approved: true } : p));
    };

    return (
        <ProtectedRoute>
            <AppLayout title="Accounts Payable">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                    {/* Accounts Payable */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Accounts Payable</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Review and approve upcoming bills.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            {payables.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">{item.vendor}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">Due: {item.dueDate}</p>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                                        <span className="text-destructive font-bold text-sm sm:text-base">${item.amount.toLocaleString()}</span>
                                        {item.approved ? (
                                            <span className="text-xs sm:text-sm text-muted-foreground">Approved</span>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(item.id)}
                                                className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                                            >
                                                Approve
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Accounts Receivable */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Accounts Receivable</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Track outstanding invoices.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                            {receivables.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">{item.client}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">{item.status}</p>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                                        <span className="text-green-500 font-bold text-sm sm:text-base">${item.amount.toLocaleString()}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm"
                                        >
                                            Send Reminder
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
