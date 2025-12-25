import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import ExpenseItems from "../components/ExpenseItems";
import { deleteExpense, getExpenses, updateExpense } from "../components/services/storage";
const isToday = (dateString: string): boolean => {
  const expenseDate = new Date(dateString);
  const today = new Date();
  return (
    expenseDate.getFullYear() === today.getFullYear() && 
    expenseDate.getMonth() === today.getMonth() && 
    expenseDate.getDate() === today.getDate() 
  );
};
const isThisMonth = (dateString: string): boolean => {
  const expenseDate = new Date(dateString);
  const today = new Date();
  return (
    expenseDate.getFullYear() === today.getFullYear() && 
    expenseDate.getMonth() === today.getMonth() 
  );
};
const calculateInsights = (expenses: any[]) => {
  const thisMonthExpenses = expenses.filter((exp) => isThisMonth(exp.date));
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1); 
  const previousMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return (
      expDate.getFullYear() === previousMonth.getFullYear() &&
      expDate.getMonth() === previousMonth.getMonth()
    );
  });
  const totalThisMonth = thisMonthExpenses.reduce(
    (sum, exp) => sum + exp.amount, 
    0 
  );
  const totalLastMonth = previousMonthExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );
  const totalPercentageChange =
    totalLastMonth > 0
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
      : 0;
  const categoryTotals: { [key: string]: number } = {};
  thisMonthExpenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  const previousCategoryTotals: { [key: string]: number } = {};
  previousMonthExpenses.forEach((exp) => {
    previousCategoryTotals[exp.category] =
      (previousCategoryTotals[exp.category] || 0) + exp.amount;
  });
  const categoryInsights = Object.keys(categoryTotals).map((category) => {
    const currentAmount = categoryTotals[category];
    const previousAmount = previousCategoryTotals[category] || 0;
    const percentageChange =
      previousAmount > 0
        ? ((currentAmount - previousAmount) / previousAmount) * 100
        : 0; 
    return {
      category,
      amount: currentAmount,
      previousAmount,
      percentageChange,
    };
  });
  const highestCategory = Object.keys(categoryTotals).reduce(
    (max, cat) =>
      categoryTotals[cat] > (categoryTotals[max] || 0) ? cat : max,
    "" 
  );
  return {
    totalThisMonth, 
    totalLastMonth, 
    totalPercentageChange, 
    highestCategory, 
    highestCategoryAmount: categoryTotals[highestCategory] || 0, 
    categoryInsights, 
  };
};
export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
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
  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    loadExpenses();
  };
  const handleUpdate = async (id: string, newAmount: number) => {
    await updateExpense(id, newAmount);
    loadExpenses();
  };
  const groupedExpenses = useMemo(() => {
    const todayExpenses = expenses.filter((exp) => isToday(exp.date));
    const thisMonthExpenses = expenses.filter(
      (exp) => isThisMonth(exp.date) && !isToday(exp.date)
    );
    const sections: Array<{
      title: string; 
      data: any[]; 
    }> = [];
    if (todayExpenses.length > 0) {
      sections.push({
        title: "Today", 
        data: todayExpenses, 
      });
    }
    if (thisMonthExpenses.length > 0) {
      sections.push({
        title: "This Month", 
        data: thisMonthExpenses, 
      });
    }
    return sections;
  }, [expenses]); 
  const insights = useMemo(() => calculateInsights(expenses), [expenses]);
  return (
    <View style={styles.container}>
      {}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        {}
      <Text style={styles.title}>Expenses</Text>
        {}
        <Text style={styles.subtitle}>
          {}
          {expenses.length === 0
            ? "No expenses yet" 
            : `${expenses.length} expense${expenses.length > 1 ? "s" : ""} total`}
          {}
        </Text>
      </Animated.View>
      {}
      {}
      {expenses.length > 0 && (
        <Animated.View
          entering={FadeIn.delay(200).duration(400)} 
          style={styles.insightsCard}
        >
          <Text style={styles.insightsTitle}>Insights</Text>
          {}
          <View style={styles.insightItem}>
            <Text style={styles.insightText}>
              You spent{" "}
              {}
              <Text style={styles.insightAmount}>
                ₹{insights.totalThisMonth.toLocaleString()}
              </Text>{" "}
              this month
            </Text>
          </View>
          {}
          {}
          {insights.totalLastMonth > 0 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightText}>
                You spent{" "}
                <Text
                  style={[
                    styles.insightAmount,
                    insights.totalPercentageChange > 0
                      ? styles.insightIncrease
                      : styles.insightDecrease,
                  ]}
                >
                  {Math.abs(insights.totalPercentageChange).toFixed(1)}%
                </Text>{" "}
                {insights.totalPercentageChange > 0 ? "more" : "less"} this month
                {insights.totalPercentageChange > 0 ? " 📈" : " 📉"}
              </Text>
            </View>
          )}
          {}
          {insights.highestCategory && (
            <View style={styles.insightItem}>
              <Text style={styles.insightText}>
                {}
                <Text style={styles.insightCategory}>
                  {insights.highestCategory}
                </Text>{" "}
                is your highest category with{" "}
                {}
                <Text style={styles.insightAmount}>
                  ₹{insights.highestCategoryAmount.toLocaleString()}
                </Text>
              </Text>
            </View>
          )}
          {}
          {insights.categoryInsights
            ?.filter((cat) => {
              return cat.previousAmount > 0 && Math.abs(cat.percentageChange) > 5;
            })
            .slice(0, 3) 
            .map((cat) => (
              <View key={cat.category} style={styles.insightItem}>
                <Text style={styles.insightText}>
                  You spent{" "}
                  <Text
                    style={[
                      styles.insightAmount,
                      cat.percentageChange > 0
                        ? styles.insightIncrease
                        : styles.insightDecrease,
                    ]}
                  >
                    {Math.abs(cat.percentageChange).toFixed(1)}%
                  </Text>{" "}
                  {cat.percentageChange > 0 ? "more" : "less"} on{" "}
                  <Text style={styles.insightCategory}>{cat.category}</Text> this month
                </Text>
              </View>
            ))}
        </Animated.View>
      )}
      {}
      {}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : expenses.length === 0 ? (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.emptyContainer}
        >
          <Text style={styles.emptyText}>No expenses added yet</Text>
          <Text style={styles.emptySubtext}>
            Tap "Add Expense" to get started
          </Text>
        </Animated.View>
      ) : (
        <SectionList
          sections={groupedExpenses} 
          keyExtractor={(item) => item.id} 
          contentContainerStyle={styles.listContent} 
          renderSectionHeader={({ section: { title } }) => (
            <Animated.View entering={FadeIn.duration(300)} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </Animated.View>
          )}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
              {}
              <ExpenseItems
                id={item.id} 
                category={item.category} 
                amount={item.amount} 
                date={item.date || new Date().toISOString()} 
                paymentMethod={item.paymentMethod || "Cash"} 
                onDelete={handleDelete} 
                onUpdate={handleUpdate} 
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No expenses to display</Text>
            </View>
          }
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
  insightsCard: {
    marginHorizontal: 20, 
    marginTop: 16, 
    padding: 16, 
    backgroundColor: "white", 
    borderRadius: 12, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 2, 
    borderWidth: 1, 
    borderColor: "#f3f4f6", 
  },
  insightsTitle: {
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#1f2937", 
    marginBottom: 12, 
  },
  insightItem: {
    marginBottom: 8, 
  },
  insightText: {
    color: "#4b5563", 
    fontSize: 14, 
  },
  insightAmount: {
    fontWeight: "bold", 
    color: "#9333ea", 
  },
  insightCategory: {
    fontWeight: "600", 
  },
  insightIncrease: {
    color: "#ef4444", 
  },
  insightDecrease: {
    color: "#22c55e", 
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
  sectionHeader: {
    marginTop: 24, 
    marginBottom: 12, 
  },
  sectionTitle: {
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#374151", 
  },
});