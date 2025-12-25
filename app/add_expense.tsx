import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { checkAndNotifyBudgetExceeded, checkAndNotifyTotalBudgetExceeded } from "../components/services/notifications";
import { saveExpense } from "../components/services/storage";
export default function AddExpenseScreen() {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const paymentMethods = ["Cash", "Card", "UPI", "Net Banking", "Wallet", "Other"];
  const router = useRouter();
  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    if (category === "Other" && !customCategory.trim()) {
      Alert.alert(
        "Category Required", 
        "Please enter a category name for 'Other'", 
        [{ text: "OK" }] 
      );
      return; 
    }
    const newExpense = {
      id: Date.now().toString(), 
      amount: Number(amount), 
      category: category === "Other" ? customCategory.trim() : category,
      date: selectedDate.toISOString(), 
      paymentMethod: paymentMethod,
    };
    await saveExpense(newExpense);
    checkAndNotifyBudgetExceeded(newExpense.category).catch(console.error);
    checkAndNotifyTotalBudgetExceeded().catch(console.error);
    setAmount("");
    setCustomCategory("");
    router.back();
  };
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    if (selectedCategory === "Other") {
      Alert.prompt(
        "Enter Category", 
        "What category is this expense for?", 
        [
          {
            text: "Cancel", 
            style: "cancel", 
            onPress: () => {
              setCategory("Food");
              setCustomCategory("");
            },
          },
          {
            text: "OK", 
            onPress: (categoryName: string | undefined) => {
              if (categoryName && categoryName.trim()) {
                setCustomCategory(categoryName.trim()); 
              } else {
                setCategory("Food");
                setCustomCategory("");
              }
            },
          },
        ],
        "plain-text" 
      );
    } else {
      setCustomCategory("");
    }
  };
  const categories = ["Food", "Travel", "Shopping", "Bills", "Other"];
    return (
      <View style={styles.container}>
        <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
      <Animated.View
        entering={FadeInDown.duration(400)} 
        style={styles.content}
      >
        {}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
              <Text style={styles.title}>Add Expense</Text>
              <Text style={styles.subtitle}>Track your spending easily</Text>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <Text style={styles.dateLabel}>Expense Date</Text>
              <TouchableOpacity
            onPress={() => setShowDatePicker(true)} 
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>
              {}
              {selectedDate.toLocaleDateString("en-US", {
                month: "short", 
                day: "numeric", 
                year: "numeric", 
              })}
              </Text>
              </TouchableOpacity>
              
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
                if (Platform.OS === "ios") {
                }
              }}
              maximumDate={new Date()} 
              />
              )}
              
              {showDatePicker && Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.datePickerDoneButton}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(300).duration(400)}>
              <TextInput
            label="Amount" 
            value={amount} 
            onChangeText={setAmount} 
            keyboardType="numeric" 
            mode="outlined" 
            style={styles.input} 
            theme={{
              colors: {
                text: "#1f2937", 
                primary: "#9333ea", 
              },
            }}
              contentStyle={{ fontSize: 18, fontWeight: "600" }}
              />
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <Text style={styles.categoryLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
              <TouchableOpacity
                key={cat} 
                onPress={() => handleCategorySelect(cat)} 
                style={[
                  styles.categoryButton,
                  category === cat
                    ? styles.categoryButtonSelected 
                    : styles.categoryButtonUnselected, 
                ]}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat
                      ? styles.categoryButtonTextSelected 
                      : styles.categoryButtonTextUnselected, 
                  ]}
                >
                  {cat}
                </Text>
                </TouchableOpacity>
                ))}
              </View>
              
              {category === "Other" && customCategory && (
                <View style={styles.customCategoryContainer}>
                  <Text style={styles.customCategoryLabel}>
                    Selected: {customCategory}
                  </Text>
                </View>
              )}
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(500).duration(400)}>
              <Text style={styles.paymentMethodLabel}>Payment Method</Text>
              <View style={styles.paymentMethodContainer}>
                {paymentMethods.map((method) => (
         <TouchableOpacity
           key={method}
           onPress={() => setPaymentMethod(method)}
           style={[
             styles.paymentMethodButton,
             paymentMethod === method
               ? styles.paymentMethodButtonSelected
               : styles.paymentMethodButtonUnselected,
           ]}
         >
           <Text
             style={[
               styles.paymentMethodButtonText,
               paymentMethod === method
                 ? styles.paymentMethodButtonTextSelected
                 : styles.paymentMethodButtonTextUnselected,
             ]}
           >
             {method}
                </Text>
                </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(600).duration(400)}>
              <TouchableOpacity
                onPress={handleSave} 
                style={[
                  styles.saveButton,
                  (!amount || Number(amount) <= 0) && styles.saveButtonDisabled,
                ]}
                disabled={!amount || Number(amount) <= 0}
              >
                <Text style={styles.saveButtonText}>Save Expense</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </View>
    );
}
const styles = StyleSheet.create({
    container: {
    flex: 1, 
    backgroundColor: "#faf5ff", 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24, 
    paddingTop: 64, 
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
    marginBottom: 32, 
  },
  input: {
    marginBottom: 24, 
    backgroundColor: "white", 
  },
  categoryLabel: {
    color: "#374151", 
    fontWeight: "600", 
    marginBottom: 12, 
    fontSize: 16, 
  },
  categoryContainer: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 12, 
    marginBottom: 32, 
  },
  categoryButton: {
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 999, 
  },
  categoryButtonSelected: {
    backgroundColor: "#9333ea", 
  },
  categoryButtonUnselected: {
    backgroundColor: "white", 
    borderWidth: 2, 
    borderColor: "#e5e7eb", 
  },
  categoryButtonText: {
    fontWeight: "600", 
  },
  categoryButtonTextSelected: {
    color: "white", 
  },
  categoryButtonTextUnselected: {
    color: "#374151", 
  },
  customCategoryContainer: {
    marginTop: 12, 
    padding: 12, 
    backgroundColor: "#f3e8ff", 
    borderRadius: 8, 
  },
  customCategoryLabel: {
    color: "#6b21a8", 
    fontWeight: "600", 
    fontSize: 14, 
  },
  saveButton: {
    backgroundColor: "#9333ea", 
    paddingVertical: 16, 
    borderRadius: 12, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 5,
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: "#d1d5db", 
    opacity: 0.6, 
  },
  saveButtonText: {
    color: "white", 
    textAlign: "center", 
    fontSize: 18, 
    fontWeight: "bold", 
  },
  dateLabel: {
    color: "#374151", 
    fontWeight: "600", 
    marginBottom: 12, 
    fontSize: 16, 
  },
  dateButton: {
    backgroundColor: "white", 
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 8, 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    marginBottom: 24, 
  },
  dateButtonText: {
    color: "#1f2937", 
    fontSize: 16, 
    fontWeight: "500", 
  },
  datePickerDoneButton: {
    backgroundColor: "#9333ea", 
    paddingVertical: 12, 
    borderRadius: 8, 
    marginTop: 12, 
  },
  datePickerDoneText: {
    color: "white", 
    textAlign: "center", 
    fontWeight: "600", 
    fontSize: 16, 
  },
  paymentMethodLabel: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 12,
    fontSize: 16,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  paymentMethodButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  paymentMethodButtonSelected: {
    backgroundColor: "#9333ea",
  },
  paymentMethodButtonUnselected: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  paymentMethodButtonText: {
    fontWeight: "600",
  },
  paymentMethodButtonTextSelected: {
    color: "white",
  },
  paymentMethodButtonTextUnselected: {
    color: "#374151",
  },
});