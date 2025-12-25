import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpenses } from "./storage";
const BUDGET_KEY = "MONTHLY_BUDGET";
export type Budget = {
  id: string; 
  category: string; 
  amount: number; 
  month: string; 
  createdAt: string; 
};
const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); 
  return `${year}-${month}`; 
};
export const getBudgets = async (): Promise<Budget[]> => {
  try {
    const data = await AsyncStorage.getItem(BUDGET_KEY);
    if (!data) return []; 
    const budgets = JSON.parse(data);
    return budgets;
  } catch (error) {
    console.error("Error getting budgets:", error);
    return [];
  }
};
export const getBudget = async (category: string, month?: string): Promise<Budget | null> => {
  try {
    const budgets = await getBudgets();
    const targetMonth = month || getCurrentMonth();
    const budget = budgets.find(
      (b) => b.category === category && b.month === targetMonth
    );
    return budget || null; 
  } catch (error) {
    console.error("Error getting budget:", error);
    return null;
  }
};
export const getTotalBudget = async (month?: string): Promise<Budget | null> => {
  return getBudget("Total", month); 
};
export const saveBudget = async (budget: Budget): Promise<void> => {
  try {
    const budgets = await getBudgets();
    const existingIndex = budgets.findIndex(
      (b) => b.category === budget.category && b.month === budget.month
    );
    if (existingIndex >= 0) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    console.log("Budget saved successfully");
  } catch (error) {
    console.error("Error saving budget:", error);
    throw error;
  }
};
export const deleteBudget = async (budgetId: string): Promise<void> => {
  try {
    const budgets = await getBudgets();
    const updatedBudgets = budgets.filter((b) => b.id !== budgetId);
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(updatedBudgets));
    console.log("Budget deleted successfully");
  } catch (error) {
    console.error("Error deleting budget:", error);
    throw error;
  }
};
export const calculateCategorySpending = async (category: string, month?: string): Promise<number> => {
  try {
    const expenses = await getExpenses();
    const targetMonth = month || getCurrentMonth();
    const [year, monthNum] = targetMonth.split("-").map(Number);
    const categoryExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        exp.category === category &&
        expDate.getFullYear() === year &&
        expDate.getMonth() === monthNum - 1 
      );
    });
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return total;
  } catch (error) {
    console.error("Error calculating category spending:", error);
    return 0;
  }
};
export const calculateTotalSpending = async (month?: string): Promise<number> => {
  try {
    const expenses = await getExpenses();
    const targetMonth = month || getCurrentMonth();
    const [year, monthNum] = targetMonth.split("-").map(Number);
    const monthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getFullYear() === year &&
        expDate.getMonth() === monthNum - 1
      );
    });
    const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return total;
  } catch (error) {
    console.error("Error calculating total spending:", error);
    return 0;
  }
};
export const isBudgetExceeded = async (category: string, month?: string): Promise<boolean> => {
  try {
    const budget = await getBudget(category, month);
    if (!budget) return false; 
    const spending = await calculateCategorySpending(category, month);
    return spending > budget.amount; 
  } catch (error) {
    console.error("Error checking budget exceeded:", error);
    return false;
  }
};
export const isTotalBudgetExceeded = async (month?: string): Promise<boolean> => {
  try {
    const budget = await getTotalBudget(month);
    if (!budget) return false; 
    const spending = await calculateTotalSpending(month);
    return spending > budget.amount; 
  } catch (error) {
    console.error("Error checking total budget exceeded:", error);
    return false;
  }
};
export const getBudgetStatus = async (category: string, month?: string): Promise<{
  budget: Budget | null;
  spending: number;
  remaining: number;
  percentageUsed: number;
  isExceeded: boolean;
}> => {
  try {
    const budget = await getBudget(category, month);
    const spending = await calculateCategorySpending(category, month);
    if (!budget) {
      return {
        budget: null,
        spending,
        remaining: 0,
        percentageUsed: 0,
        isExceeded: false,
      };
    }
    const remaining = Math.max(0, budget.amount - spending); 
    const percentageUsed = budget.amount > 0 ? (spending / budget.amount) * 100 : 0;
    const isExceeded = spending > budget.amount;
    return {
      budget,
      spending,
      remaining,
      percentageUsed,
      isExceeded,
    };
  } catch (error) {
    console.error("Error getting budget status:", error);
    return {
      budget: null,
      spending: 0,
      remaining: 0,
      percentageUsed: 0,
      isExceeded: false,
    };
  }
};