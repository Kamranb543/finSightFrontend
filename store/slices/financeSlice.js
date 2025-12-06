import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    dashboardStats: {
        cashBalance: 125730.55,
        netIncomeYTD: 48210.90,
        revenueYTD: 215600.00,
        expensesYTD: 167389.10,
    },
    cashFlowData: [
        { month: "Jan", inflow: 50, outflow: 40 },
        { month: "Feb", inflow: 60, outflow: 45 },
        { month: "Mar", inflow: 75, outflow: 50 },
        { month: "Apr", inflow: 80, outflow: 55 },
        { month: "May", inflow: 70, outflow: 60 },
        { month: "Jun", inflow: 90, outflow: 65 },
        { month: "Jul", inflow: 105, outflow: 70 },
    ],
    transactions: [
        { id: 1, date: "2025-07-12", description: "Stripe Payout", amount: 7500.00, category: "Sales Revenue", status: "Pending" },
        { id: 2, date: "2025-07-11", description: "Amazon Web Services", amount: -450.75, category: "Cloud & Hosting", status: "Pending" },
        { id: 3, date: "2025-07-10", description: "HubSpot Subscription", amount: -200.00, category: "Software & Subscriptions", status: "Pending" },
        { id: 4, date: "2025-07-09", description: "Office Depot", amount: -112.45, category: "Office Supplies", status: "Pending" },
    ],
    reportsData: [
        { month: "Jan", revenue: 30, netIncome: 5 },
        { month: "Feb", revenue: 35, netIncome: 7 },
        { month: "Mar", revenue: 42, netIncome: 10 },
        { month: "Apr", revenue: 45, netIncome: 12 },
        { month: "May", revenue: 40, netIncome: 8 },
        { month: "Jun", revenue: 50, netIncome: 15 },
        { month: "Jul", revenue: 58, netIncome: 21 },
    ],
};

const financeSlice = createSlice({
    name: "finance",
    initialState,
    reducers: {
        approveTransaction: (state, action) => {
            const id = action.payload;
            const transaction = state.transactions.find((t) => t.id === id);
            if (transaction) {
                transaction.status = "Approved";
            }
        },
    },
});

export const { approveTransaction } = financeSlice.actions;
export default financeSlice.reducer;
