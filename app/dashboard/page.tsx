"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ArrowUpRight, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { apiClient } from "@/lib/api/client";

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

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  cashBalance: number;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    cashBalance: 0,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiClient.get<Transaction[]>("/auth/transactions/");
        setTransactions(data);

        // Calculate stats
        const totalIncome = data
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpenses = data
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const netIncome = totalIncome - totalExpenses;
        const cashBalance = netIncome;

        setStats({ totalIncome, totalExpenses, netIncome, cashBalance });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Generate monthly cash flow data from transactions
  const generateCashFlowData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    const monthlyData = months.map((month, index) => {
      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.created_at);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });

      const inflow = monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const outflow = monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return { month, inflow, outflow };
    });

    return monthlyData;
  };

  const cashFlowData = generateCashFlowData();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout title="Dashboard">
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout title="Dashboard">
        <div className="space-y-4 sm:space-y-6">
          {/* Stats Row */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${stats.cashBalance >= 0 ? "text-primary" : "text-destructive"}`}>
                  ${stats.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Net Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${stats.netIncome >= 0 ? "text-green-500" : "text-destructive"}`}>
                  ${stats.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">
                  ${stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-destructive">
                  ${stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            {/* Chart */}
            <Card className="lg:col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Cash Flow</CardTitle>
              </CardHeader>
              <CardContent className="pl-1 sm:pl-2">
                <div className="h-[250px] sm:h-[300px] lg:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowData}>
                      <defs>
                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius)' }}
                        itemStyle={{ color: 'var(--color-foreground)' }}
                      />
                      <Area type="monotone" dataKey="inflow" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" name="Income" />
                      <Area type="monotone" dataKey="outflow" stroke="var(--color-destructive)" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-sm text-muted-foreground">Expenses</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="lg:col-span-3 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">FinSight Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="mt-1 bg-green-500/10 p-1.5 sm:p-2 rounded-full h-fit flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Summary</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {transactions.length} total transactions recorded.
                      {stats.netIncome >= 0 ? " You're in profit!" : " Expenses exceed income."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="mt-1 bg-orange-500/10 p-1.5 sm:p-2 rounded-full h-fit flex-shrink-0">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Pending Approvals</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {transactions.filter((t) => !t.is_approved).length} transactions awaiting approval.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="mt-1 bg-blue-500/10 p-1.5 sm:p-2 rounded-full h-fit flex-shrink-0">
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Breakdown</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {transactions.filter((t) => t.type === "INCOME").length} income &amp; {transactions.filter((t) => t.type === "EXPENSE").length} expense transactions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
