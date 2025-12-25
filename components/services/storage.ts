import AsyncStorage from "@react-native-async-storage/async-storage";
import { addToPendingSync, syncExpensesToBackend } from "./sync";
const EXPENSES_KEY = "EXPENSES";
export const getExpenses = async () => {
  try {
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    if (!data) return [];
    const expenses = JSON.parse(data);
    return expenses.map((expense: any) => {
      if (!expense.date) {
        return { ...expense, date: new Date().toISOString() };
      }
      if(!expense.paymentMethod) {
        return {...expense, paymentMethod: "Cash"};
      }
      return expense;
    });
  } catch (error) {
    console.log("error getting expenses : ", error);
    return [];
  }
};
export const saveExpense = async (expense: any) => {
  try {
    const existingExpenses = await getExpenses();
    const updatedExpense = [expense, ...existingExpenses];
    await AsyncStorage.setItem(
      EXPENSES_KEY,
      JSON.stringify(updatedExpense)
    );
    syncExpensesToBackend().catch((err) => {
      addToPendingSync(expense).catch(console.error);
    });
  } catch (error) {
    console.log("Error saving expense", error);
  }
};
export const updateExpense = async (
  id: string, 
  newAmount: number 
) => {
  try {
    const expenses = await getExpenses();
    const updatedExpense = expenses.map((expense: any) =>
      expense.id === id
        ? { ...expense, amount: newAmount } 
        : expense 
    );
    await AsyncStorage.setItem(
      EXPENSES_KEY,
      JSON.stringify(updatedExpense)
    );
    const updatedExp = updatedExpense.find((e: any) => e.id === id);
    if (updatedExp) {
      syncExpensesToBackend().catch((err) => {
        addToPendingSync(updatedExp).catch(console.error);
      });
    }
  } catch (error) {
    console.log("Error updating expense", error);
  }
};
export const deleteExpense = async (id: string) => {
  try {
    const expenses = await getExpenses();
    const filteredExpenses = expenses.filter(
      (expense: any) => expense.id !== id 
    );
    await AsyncStorage.setItem(
      EXPENSES_KEY,
      JSON.stringify(filteredExpenses)
    );
    syncExpensesToBackend().catch(console.error);
  } catch (error) {
    console.log("Error deleting expense", error);
  }
};