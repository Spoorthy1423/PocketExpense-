import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
type ExpenseItemProps = {
  id: string; 
  category: string; 
  amount: number; 
  date: string; 
  paymentMethod: string; 
  onDelete: (id: string) => void; 
  onUpdate: (id: string, newAmount: number) => void; 
};
export default function ExpenseItems({
  id, 
  category, 
  amount, 
  date, 
  paymentMethod, 
  onDelete, 
  onUpdate, 
}: ExpenseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(amount.toString());
  const handleDeleteClick = () => {
    console.log("Delete button clicked for expense:", id, "Amount:", amount);
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to delete this ₹${amount} expense? This action cannot be undone.`
      );
      if (confirmed) {
        console.log("Delete confirmed, removing expense:", id);
        onDelete(id);
      } else {
        console.log("Delete cancelled by user");
      }
    } else {
      Alert.alert(
        "Delete Expense", 
        `Are you sure you want to delete this ₹${amount} expense? This action cannot be undone.`, 
        [
          {
            text: "Cancel", 
            style: "cancel", 
            onPress: () => {
              console.log("Delete cancelled by user"); 
            },
          },
          {
            text: "Delete", 
            style: "destructive", 
            onPress: () => {
              console.log("Delete confirmed, removing expense:", id); 
              onDelete(id);
            },
          },
        ],
        { cancelable: true } 
      );
    }
  };
  const handleSave = () => {
    const newAmount = Number(editAmount);
    if (newAmount > 0) {
      onUpdate(id, newAmount);
      setIsEditing(false);
    }
  };
  const handleCancel = () => {
    setEditAmount(amount.toString());
    setIsEditing(false);
  };
  const formatDate = (dateString: string) => {
    const expenseDate = new Date(dateString);
    const today = new Date();
    const isToday =
      expenseDate.getDate() === today.getDate() && 
      expenseDate.getMonth() === today.getMonth() && 
      expenseDate.getFullYear() === today.getFullYear(); 
    if (isToday) {
      return "Today";
    }
    return expenseDate.toLocaleDateString("en-US", {
      month: "short", 
      day: "numeric", 
    });
  };
  const getCategoryStyle = () => {
    switch (category) {
      case "Food":
        return { bg: styles.categoryFoodBg, text: styles.categoryFoodText };
      case "Travel":
        return { bg: styles.categoryTravelBg, text: styles.categoryTravelText };
      case "Shopping":
        return { bg: styles.categoryShoppingBg, text: styles.categoryShoppingText };
      case "Bills":
        return { bg: styles.categoryBillsBg, text: styles.categoryBillsText };
      default:
        return { bg: styles.categoryOtherBg, text: styles.categoryOtherText };
    }
  };
  const categoryStyle = getCategoryStyle();
    return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container} 
    >
      {}
      <View style={styles.leftSection}>
        {}
        <View style={styles.categoryContainer}>
          {}
          <View style={[styles.categoryBadge, categoryStyle.bg]}>
            {}
            <Text style={[styles.categoryText, categoryStyle.text]}>
              {category}
            </Text>
          </View>
        </View>
        {}
        {isEditing ? (
          <View style={styles.editContainer}>
            {}
            <TextInput
              value={editAmount} 
              onChangeText={setEditAmount} 
              keyboardType="numeric" 
              style={styles.editInput} 
              autoFocus 
            />
            {}
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.buttonText}>✓</Text>
            </TouchableOpacity>
            {}
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
            <View>
            {}
            <Text style={styles.amount}>
              {}
              {}
              ₹{amount.toLocaleString()}
            </Text>
            {}
            <Text style={styles.date}>
              {}
              {formatDate(date)}
            </Text>
            {}
            <View style={styles.paymentMethodBadge}>
              <Text style={styles.paymentMethodText}>
                {paymentMethod || "Cash"} {}
              </Text>
            </View>
          </View>
        )}
            </View>
      {}
      {!isEditing && (
        <View style={styles.buttonContainer}>
          {}
          <TouchableOpacity
            onPress={() => setIsEditing(true)} 
            style={styles.editButton}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          {}
          <TouchableOpacity
            onPress={handleDeleteClick} 
            style={styles.deleteButton}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
    container: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: "white", 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3, 
    borderWidth: 1, 
    borderColor: "#f3f4f6", 
  },
  leftSection: {
    flex: 1, 
  },
  categoryContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 4, 
  },
  categoryBadge: {
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 999, 
  },
  categoryFoodBg: {
    backgroundColor: "#fed7aa", 
  },
  categoryFoodText: {
    color: "#c2410c", 
  },
  categoryTravelBg: {
    backgroundColor: "#dbeafe", 
  },
  categoryTravelText: {
    color: "#1e40af", 
  },
  categoryShoppingBg: {
    backgroundColor: "#fce7f3", 
  },
  categoryShoppingText: {
    color: "#be185d", 
  },
  categoryBillsBg: {
    backgroundColor: "#fef9c3", 
  },
  categoryBillsText: {
    color: "#a16207", 
  },
  categoryOtherBg: {
    backgroundColor: "#f3e8ff", 
  },
  categoryOtherText: {
    color: "#6b21a8", 
  },
  categoryText: {
    fontSize: 12, 
    fontWeight: "600", 
  },
    amount: {
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#1f2937", 
  },
  date: {
    fontSize: 12, 
    color: "#6b7280", 
    marginTop: 4, 
  },
  paymentMethodBadge: {
    marginTop: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    backgroundColor: "#f3f4f6", 
    borderRadius: 4, 
    alignSelf: "flex-start", 
  },
  paymentMethodText: {
    fontSize: 10, 
    color: "#6b7280", 
    fontWeight: "500", 
  },
  editContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
  },
  editInput: {
    flex: 1, 
    backgroundColor: "#f9fafb", 
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#1f2937", 
  },
  saveButton: {
    backgroundColor: "#22c55e", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8, 
  },
  cancelButton: {
    backgroundColor: "#9ca3af", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8, 
  },
  buttonContainer: {
    flexDirection: "row", 
    gap: 8, 
    marginLeft: 12, 
  },
  editButton: {
    backgroundColor: "#3b82f6", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8, 
  },
  deleteButton: {
    backgroundColor: "#ef4444", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8, 
  },
  buttonText: {
    color: "white", 
    fontWeight: "600", 
    fontSize: 14, 
  },
});