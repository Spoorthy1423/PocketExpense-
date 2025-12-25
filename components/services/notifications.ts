import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { isBudgetExceeded, isTotalBudgetExceeded } from "./budget";

let notificationsAvailable = true;
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, 
      shouldPlaySound: true, 
      shouldSetBadge: true, 
    }),
  });
} catch (error) {
  notificationsAvailable = false;
  console.log("Notifications not available in Expo Go. Use development build for notifications.");
}
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!notificationsAvailable) {
    console.log("Notifications not available in Expo Go");
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("budget-alerts", {
        name: "Budget Alerts", 
        importance: Notifications.AndroidImportance.HIGH, 
        vibrationPattern: [0, 250, 250, 250], 
        lightColor: "#9333ea", 
      });
    }
    return finalStatus === "granted"; 
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};
export const checkAndNotifyBudgetExceeded = async (
  category: string,
  month?: string
): Promise<void> => {
  if (!notificationsAvailable) return;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("Notification permission not granted");
      return; 
    }
    const exceeded = await isBudgetExceeded(category, month);
    if (exceeded) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Budget Exceeded! 💸", 
          body: `You've exceeded your ${category} budget for this month.`, 
          data: { category, month }, 
          sound: true, 
        },
        trigger: null, 
      });
      console.log(`Budget exceeded notification sent for ${category}`);
    }
  } catch (error) {
    console.error("Error checking and notifying budget exceeded:", error);
  }
};
export const checkAndNotifyTotalBudgetExceeded = async (month?: string): Promise<void> => {
  if (!notificationsAvailable) return;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }
    const exceeded = await isTotalBudgetExceeded(month);
    if (exceeded) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Total Budget Exceeded! ⚠️", 
          body: "You've exceeded your total monthly budget. Review your spending.", 
          data: { type: "total", month }, 
          sound: true,
        },
        trigger: null, 
      });
      console.log("Total budget exceeded notification sent");
    }
  } catch (error) {
    console.error("Error checking and notifying total budget exceeded:", error);
  }
};
export const checkAndNotifyBudgetWarning = async (
  category: string,
  threshold: number = 80, 
  month?: string
): Promise<void> => {
  if (!notificationsAvailable) return;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }
    const { getBudgetStatus } = await import("./budget");
    const status = await getBudgetStatus(category, month);
    if (status.budget && status.percentageUsed >= threshold && !status.isExceeded) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Budget Warning ⚠️", 
          body: `You've used ${status.percentageUsed.toFixed(1)}% of your ${category} budget.`, 
          data: { category, month, type: "warning" }, 
          sound: true,
        },
        trigger: null, 
      });
      console.log(`Budget warning sent for ${category} at ${status.percentageUsed.toFixed(1)}%`);
    }
  } catch (error) {
    console.error("Error checking and notifying budget warning:", error);
  }
};
export const cancelAllNotifications = async (): Promise<void> => {
  if (!notificationsAvailable) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All notifications cancelled");
  } catch (error) {
    console.error("Error cancelling notifications:", error);
  }
};
export const getScheduledNotifications = async () => {
  if (!notificationsAvailable) return [];
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
};