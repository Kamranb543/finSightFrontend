"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { cn } from "@/lib/utils";

interface BudgetCategory {
    id: number;
    name: string;
    spent: number;
    budget: number;
}

export default function BudgetingPage() {
    const budgetCategories: BudgetCategory[] = [
        { id: 1, name: "Marketing", spent: 10500, budget: 10000 },
        { id: 2, name: "Software & Subscriptions", spent: 1800, budget: 2000 },
        { id: 3, name: "Cloud & Hosting", spent: 600, budget: 1000 },
    ];

    const getPercentage = (spent: number, budget: number) => {
        return Math.round((spent / budget) * 100);
    };

    const getBarColor = (percentage: number) => {
        if (percentage > 100) return "bg-destructive";
        if (percentage >= 80) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <ProtectedRoute>
            <AppLayout title="Budget vs. Actuals">
                <div className="space-y-4 sm:space-y-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Budget vs. Actuals</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Track your spending against your budget in real-time. FinSight flags categories that are over budget.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                            {budgetCategories.map((category) => {
                                const percentage = getPercentage(category.spent, category.budget);
                                const isOverBudget = percentage > 100;
                                return (
                                    <div key={category.id} className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium text-foreground text-sm sm:text-base truncate">{category.name}</span>
                                            <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                                                ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}{" "}
                                                <span className={cn(isOverBudget ? "text-destructive" : "text-muted-foreground")}>
                                                    ({percentage}%)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted/50">
                                            <div
                                                className={cn("h-2 rounded-full transition-all", getBarColor(percentage))}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}
