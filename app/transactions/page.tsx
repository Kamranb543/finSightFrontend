"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { API_BASE_URL } from "@/lib/api/config";

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
      const res = await fetch(`${API_BASE_URL}/auth/transactions/`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/transactions/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_approved: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to approve transaction");
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
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
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Review & Reconcile</h2>
              <p className="text-muted-foreground">
                FinSight has automatically categorized new transactions. Review the suggestions and approve to reconcile your books.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
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
                <div className="text-center py-12 text-muted-foreground">
                  No transactions found. Upload a document to get started.
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
