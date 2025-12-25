import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  Budget,
  deleteBudget,
  getBudgets,
  getBudgetStatus,
  saveBudget,
} from "../../components/services/budget";
import { getExpenses } from "../../components/services/storage";
export default function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<{ [key: string]: any }>({});
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const loadedBudgets = await getBudgets();
      setBudgets(loadedBudgets);
      const statuses: { [key: string]: any } = {};
      for (const budget of loadedBudgets) {
        const status = await getBudgetStatus(budget.category, budget.month);
        statuses[budget.id] = status;
      }
      setBudgetStatuses(statuses);
    } catch (error) {
      console.error("Error loading budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [])
  );
  const handleAddBudget = async () => {
    if (!newBudgetCategory.trim() || !newBudgetAmount.trim()) {
      Alert.alert("Error", "Please enter both category and amount");
      return;
    }
    const amount = Number(newBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    try {
      const budget: Budget = {
        id: Date.now().toString(), 
        category: newBudgetCategory.trim(),
        amount: amount,
        month: new Date().toISOString().slice(0, 7), 
        createdAt: new Date().toISOString(),
      };
      await saveBudget(budget);
      await loadBudgets();
      setNewBudgetCategory("");
      setNewBudgetAmount("");
      setShowAddBudget(false);
      Alert.alert("Success", "Budget added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add budget");
      console.error("Error adding budget:", error);
    }
  };
  const handleDeleteBudget = async (budgetId: string) => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBudget(budgetId);
              await loadBudgets();
              Alert.alert("Success", "Budget deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete budget");
            }
          },
        },
      ]
    );
  };
  const getAvailableCategories = async (): Promise<string[]> => {
    const expenses = await getExpenses();
    const categories = new Set<string>();
    expenses.forEach((exp) => categories.add(exp.category));
    return Array.from(categories).sort();
  };
  return (
    <View style={styles.container}>
      {}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Budget Management</Text>
        <Text style={styles.subtitle}>
          Set monthly budget limits and track your spending
        </Text>
      </Animated.View>
      {}
      {showAddBudget ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.addBudgetContainer}>
          <Text style={styles.addBudgetTitle}>Add New Budget</Text>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter category (e.g., Food, Travel)"
            value={newBudgetCategory}
            onChangeText={setNewBudgetCategory}
          />
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter budget amount"
            value={newBudgetAmount}
            onChangeText={setNewBudgetAmount}
            keyboardType="numeric"
          />
          <View style={styles.addBudgetButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowAddBudget(false);
                setNewBudgetCategory("");
                setNewBudgetAmount("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddBudget}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddBudget(true)}
          >
            <Text style={styles.addButtonText}>+ Add Budget</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : budgets.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No budgets set</Text>
          <Text style={styles.emptySubtext}>
            Add a budget to start tracking your spending limits
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const status = budgetStatuses[item.id];
            if (!status) return null;
            const percentageUsed = status.percentageUsed || 0;
            const isExceeded = status.isExceeded || false;
            return (
              <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
                <View style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetCategory}>{item.category}</Text>
                    <TouchableOpacity onPress={() => handleDeleteBudget(item.id)}>
                      <Text style={styles.deleteButton}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.budgetAmounts}>
                    <View>
                      <Text style={styles.budgetLabel}>Budget</Text>
                      <Text style={styles.budgetValue}>₹{item.amount.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text style={styles.budgetLabel}>Spent</Text>
                      <Text
                        style={[
                          styles.budgetValue,
                          isExceeded && styles.budgetValueExceeded,
                        ]}
                      >
                        ₹{status.spending.toLocaleString()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.budgetLabel}>Remaining</Text>
                      <Text
                        style={[
                          styles.budgetValue,
                          status.remaining < item.amount * 0.2 && styles.budgetValueWarning,
                        ]}
                      >
                        ₹{status.remaining.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  {}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(percentageUsed, 100)}%`,
                          backgroundColor: isExceeded
                            ? "#ef4444"
                            : percentageUsed > 80
                            ? "#f59e0b"
                            : "#22c55e",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageText}>
                    {percentageUsed.toFixed(1)}% used
                    {isExceeded && " (Exceeded!)"}
                  </Text>
                </View>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eff6ff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
    backgroundColor: "white",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 16,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addButton: {
    backgroundColor: "#9333ea",
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  addBudgetContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
  },
  addBudgetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: "#1f2937",
  },
  addBudgetButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#9333ea",
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#9ca3af",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#d1d5db",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  budgetCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  budgetCategory: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  deleteButton: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  budgetAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  budgetValueExceeded: {
    color: "#ef4444",
  },
  budgetValueWarning: {
    color: "#f59e0b",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});