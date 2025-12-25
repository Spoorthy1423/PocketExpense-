import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpenses } from "./storage";
const PENDING_SYNC_KEY = "PENDING_SYNC_EXPENSES";
const API_BASE_URL = "http://localhost:8082/api";
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};
export const addToPendingSync = async (expense: any) => {
  try {
    const pending = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    const pendingExpenses = pending ? JSON.parse(pending) : [];
    pendingExpenses.push(expense);
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingExpenses));
    console.log("Added expense to pending sync queue");
  } catch (error) {
    console.error("Error adding to pending sync:", error);
  }
};
export const syncExpensesToBackend = async (): Promise<boolean> => {
  try {
    const online = await isOnline();
    if (!online) {
      console.log("Device is offline, cannot sync");
      return false; 
    }
    const expenses = await getExpenses();
    if (expenses.length === 0) {
      console.log("No expenses to sync");
      return true; 
    }
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenses }),
      });
      if (!response.ok) {
        throw new Error("Failed to sync expenses");
      }
      await AsyncStorage.removeItem(PENDING_SYNC_KEY);
      console.log(`Successfully synced ${expenses.length} expenses to backend`);
      return true;
    } catch (error) {
      console.log("Backend not available, expenses will sync when backend is ready");
      return false;
    } 
  } catch (error) {
    console.error("Error syncing expenses:", error);
    return false; 
  }
};
export const syncPendingExpenses = async (): Promise<boolean> => {
  try {
    const online = await isOnline();
    if (!online) {
      return false; 
    }
    const pending = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    if (!pending) {
      return true; 
    }
    const pendingExpenses = JSON.parse(pending);
    if (pendingExpenses.length === 0) {
      return true; 
    }
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/sync-pending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenses: pendingExpenses }),
      });
      if (!response.ok) {
        throw new Error("Failed to sync pending expenses");
      }
      await AsyncStorage.removeItem(PENDING_SYNC_KEY);
      console.log(`Successfully synced ${pendingExpenses.length} pending expenses`);
      return true;
    } catch (error) {
      console.log("Backend not available, keeping expenses in pending queue");
      return false;
    } 
  } catch (error) {
    console.error("Error syncing pending expenses:", error);
    return false; 
  }
};
export const setupAutoSync = (callback?: () => void) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      console.log("Device is online, syncing expenses...");
      syncPendingExpenses().then((success) => {
        if (success && callback) {
          callback(); 
        }
      });
    } else {
      console.log("Device is offline");
    }
  });
  return unsubscribe;
};