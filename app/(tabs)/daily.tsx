import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeIn } from "react-native-reanimated";
import ExpenseItems from "../../components/ExpenseItems";
import { deleteExpense, getExpenses, updateExpense } from "../../components/services/storage";
export default function DailyViewScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadExpenses = async () => {
    setIsLoading(true);
    const storedExpenses = await getExpenses();
    setExpenses(storedExpenses);
    setIsLoading(false);
  };
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );
  const isSameDate = (expenseDate: string, targetDate: Date): boolean => {
    const expense = new Date(expenseDate);
    return (
      expense.getFullYear() === targetDate.getFullYear() &&
      expense.getMonth() === targetDate.getMonth() &&
      expense.getDate() === targetDate.getDate()
    );
  };
  const dailyExpenses = expenses.filter((exp) => isSameDate(exp.date, selectedDate));
  const dailyTotal = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    loadExpenses();
  };
  const handleUpdate = async (id: string, newAmount: number) => {
    await updateExpense(id, newAmount);
    loadExpenses();
  };
  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    if (isToday) {
      return "Today";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long", 
      month: "long", 
      day: "numeric", 
      year: "numeric", 
    });
  };
  return (
    <View style={styles.container}>
      {}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Daily Expenses</Text>
        {}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateSelector}
        >
          <Text style={styles.dateSelectorText}>
            {formatDateDisplay(selectedDate)}
          </Text>
        </TouchableOpacity>
        {}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              if (Platform.OS === "android") {
                setShowDatePicker(false);
              }
              if (date) {
                setSelectedDate(date);
              }
            }}
            maximumDate={new Date()} 
          />
        )}
        {}
        {showDatePicker && Platform.OS === "ios" && (
          <TouchableOpacity
            onPress={() => setShowDatePicker(false)}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
        {}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total for this day:</Text>
          <Text style={styles.totalAmount}>₹{dailyTotal.toLocaleString()}</Text>
        </View>
      </Animated.View>
      {}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : dailyExpenses.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses for this date</Text>
          <Text style={styles.emptySubtext}>
            Add an expense to get started
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={dailyExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
              <ExpenseItems
                id={item.id}
                category={item.category}
                amount={item.amount}
                date={item.date}
                paymentMethod={item.paymentMethod || "Cash"}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </Animated.View>
          )}
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
    marginBottom: 16,
  },
  dateSelector: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  doneButton: {
    backgroundColor: "#9333ea",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  doneButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  totalContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f3e8ff",
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9333ea",
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
});