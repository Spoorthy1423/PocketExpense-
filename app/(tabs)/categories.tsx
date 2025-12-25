import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import ExpenseItems from "../../components/ExpenseItems";
import { deleteExpense, getExpenses, updateExpense } from "../../components/services/storage";
export default function CategoriesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
  const categoryData = useMemo(() => {
    const currentMonth = new Date();
    const thisMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getFullYear() === currentMonth.getFullYear() &&
        expDate.getMonth() === currentMonth.getMonth()
      );
    });
    const total = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals: { [key: string]: number } = {};
    thisMonthExpenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    const categories = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));
    categories.sort((a, b) => b.amount - a.amount);
    return { categories, total };
  }, [expenses]);
  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses;
    return expenses.filter((exp) => exp.category === selectedCategory);
  }, [expenses, selectedCategory]);
  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    loadExpenses();
  };
  const handleUpdate = async (id: string, newAmount: number) => {
    await updateExpense(id, newAmount);
    loadExpenses();
  };
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Food: "#c2410c",
      Travel: "#1e40af",
      Shopping: "#be185d",
      Bills: "#a16207",
    };
    return colors[category] || "#6b21a8";
  };
  return (
    <View style={styles.container}>
      {}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Category Breakdown</Text>
        <Text style={styles.subtitle}>
          {selectedCategory
            ? `Showing ${selectedCategory} expenses`
            : "Tap a category to filter"}
        </Text>
      </Animated.View>
      {}
      {categoryData.categories.length > 0 && (
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categoryData.categories}
            keyExtractor={(item) => item.category}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={[
                  styles.categoryCard,
                  selectedCategory === item.category && styles.categoryCardSelected,
                ]}
              >
                <Text style={styles.categoryCardName}>{item.category}</Text>
                <Text style={styles.categoryCardAmount}>
                  ₹{item.amount.toLocaleString()}
                </Text>
                <View style={styles.percentageBar}>
                  <View
                    style={[
                      styles.percentageFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: getCategoryColor(item.category),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryCardPercentage}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </Animated.View>
            )}
          />
        </Animated.View>
      )}
      {}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : filteredExpenses.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedCategory
              ? `No ${selectedCategory} expenses found`
              : "No expenses added yet"}
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            selectedCategory && (
              <View style={styles.filterHeader}>
                <Text style={styles.filterText}>
                  Showing {filteredExpenses.length} expense
                  {filteredExpenses.length !== 1 ? "s" : ""} for {selectedCategory}
                </Text>
                <Text
                  style={styles.clearFilter}
                  onPress={() => setSelectedCategory(null)}
                >
                  Clear Filter
                </Text>
              </View>
            )
          }
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
    marginBottom: 8,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 16,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: "#9333ea",
  },
  categoryCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  categoryCardAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9333ea",
    marginBottom: 8,
  },
  percentageBar: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    borderRadius: 3,
  },
  categoryCardPercentage: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
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
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    color: "#6b7280",
  },
  clearFilter: {
    fontSize: 14,
    color: "#9333ea",
    fontWeight: "600",
  },
});