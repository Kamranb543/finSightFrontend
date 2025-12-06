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
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Accounts Payable */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Accounts Payable</CardTitle>
                            <CardDescription>Review and approve upcoming bills.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {payables.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                                >
                                    <div>
                                        <p className="font-semibold text-foreground">{item.vendor}</p>
                                        <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-destructive font-bold">${item.amount.toLocaleString()}</span>
                                        {item.approved ? (
                                            <span className="text-sm text-muted-foreground">Approved</span>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(item.id)}
                                                className="bg-primary hover:bg-primary/90"
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
                        <CardHeader>
                            <CardTitle>Accounts Receivable</CardTitle>
                            <CardDescription>Track outstanding invoices.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {receivables.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                                >
                                    <div>
                                        <p className="font-semibold text-foreground">{item.client}</p>
                                        <p className="text-sm text-muted-foreground">{item.status}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-green-500 font-bold">${item.amount.toLocaleString()}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
