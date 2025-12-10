"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { apiClient, ApiError } from "@/lib/api/client";

type FilterType = "ALL" | "INCOME" | "EXPENSE";

interface Transaction {
  id: number;
  description: string;
  amount: string;
  is_approved: boolean;
  type: "INCOME" | "EXPENSE";
  tax: string | null;
  category: { id: number; categoryname: string } | null;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "ALL") return true;
    return t.type === filter;
  });

  const fetchTransactions = async () => {
    try {
      const data = await apiClient.get<Transaction[]>("/auth/transactions/");
      setTransactions(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch transactions";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await apiClient.patch(`/auth/transactions/${id}/`, { is_approved: true });
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t))
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to approve transaction";
      setError(errorMessage);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <AppLayout title="Transactions">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Review & Reconcile</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                FinSight has automatically categorized new transactions. Review the suggestions and approve to reconcile your books.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant={filter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("ALL")}
              >
                All
              </Button>
              <Button
                variant={filter === "INCOME" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("INCOME")}
                className={filter === "INCOME" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Income
              </Button>
              <Button
                variant={filter === "EXPENSE" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("EXPENSE")}
                className={filter === "EXPENSE" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                Expense
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center">
              {error}
            </div>
          )}

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground px-4">
                  No transactions found. Upload a document to get started.
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-6">Date</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-muted/50 border-border/50 transition-colors">
                            <TableCell className="pl-6 font-medium text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">{transaction.description}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                transaction.type === "INCOME" 
                                  ? "bg-green-500/10 text-green-500 ring-green-500/20"
                                  : "bg-red-500/10 text-red-500 ring-red-500/20"
                              )}>
                                {transaction.type}
                              </span>
                            </TableCell>
                            <TableCell className={cn("font-bold", transaction.type === "INCOME" ? "text-green-500" : "text-destructive")}>
                              {transaction.type === "INCOME" ? "+" : "-"}${parseFloat(transaction.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                {transaction.category?.categoryname || "Uncategorized"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              {!transaction.is_approved ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(transaction.id)}
                                  className="text-green-500 hover:text-green-400 hover:bg-green-500/10 font-semibold"
                                >
                                  Approve
                                </Button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                  <Check className="h-4 w-4" /> Approved
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-border/50">
                    {filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(transaction.created_at)}</p>
                          </div>
                          <div className={cn("text-lg font-bold flex-shrink-0", transaction.type === "INCOME" ? "text-green-500" : "text-destructive")}>
                            {transaction.type === "INCOME" ? "+" : "-"}${parseFloat(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                              transaction.type === "INCOME" 
                                ? "bg-green-500/10 text-green-500 ring-green-500/20"
                                : "bg-red-500/10 text-red-500 ring-red-500/20"
                            )}>
                              {transaction.type}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                              {transaction.category?.categoryname || "Uncategorized"}
                            </span>
                          </div>
                          {!transaction.is_approved ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(transaction.id)}
                              className="text-green-500 hover:text-green-400 hover:bg-green-500/10 font-semibold text-xs"
                            >
                              Approve
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <Check className="h-3 w-3" /> Approved
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
