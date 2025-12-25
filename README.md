# 💰 PocketExpense

A modern, feature-rich expense tracking mobile application built with React Native and Expo. Track your daily expenses, manage budgets, analyze spending patterns, and stay on top of your finances with an intuitive and beautiful user interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0.30-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg)

---

## 📱 Features

### Core Functionality
- **Expense Management**: Add, edit, and delete expenses with detailed information
- **Category Tracking**: Organize expenses by categories (Food, Travel, Shopping, Bills, etc.)
- **Budget Management**: Set monthly budget limits for categories and track spending
- **Daily View**: View expenses for any specific date with date picker
- **Monthly View**: Analyze monthly spending patterns and trends
- **Category Breakdown**: Visual breakdown of expenses by category with percentages

### Advanced Features
- **Real-time Budget Tracking**: Monitor budget usage with visual progress bars
- **Budget Alerts**: Color-coded warnings when approaching or exceeding budget limits
- **Offline Support**: Full functionality works offline with AsyncStorage
- **Auto Sync**: Background synchronization with backend server
- **User Authentication**: Secure login and registration system
- **Smooth Animations**: Beautiful fade-in animations using React Native Reanimated
- **Responsive Design**: Optimized for both iOS and Android platforms

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0.30) - Development platform and toolchain
- **TypeScript** (5.9.2) - Type-safe JavaScript
- **Expo Router** (~6.0.21) - File-based routing system
- **React Navigation** (^7.1.8) - Navigation library

### UI & Styling
- **React Native Reanimated** (~4.1.1) - Smooth animations
- **React Native Paper** (^5.14.5) - Material Design components
- **NativeWind** (^4.2.1) - Tailwind CSS for React Native
- **Expo Haptics** (~15.0.8) - Haptic feedback

### Data Management
- **AsyncStorage** (^2.2.0) - Local persistent storage
- **Axios** (^1.13.2) - HTTP client for API calls
- **React Native NetInfo** (^11.4.1) - Network status detection

### Development Tools
- **ESLint** (^9.25.0) - Code linting
- **TypeScript** - Static type checking

---

## 📁 Project Structure

```
PocketExpense/
├── app/                          # Main application screens
│   ├── _layout.tsx              # Root layout with navigation
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── index.tsx            # Home screen
│   │   ├── daily.tsx           # Daily expense view
│   │   ├── monthly.tsx          # Monthly expense view
│   │   ├── categories.tsx       # Category breakdown screen
│   │   └── budget.tsx           # Budget management screen
│   ├── add_expense.tsx          # Add/Edit expense modal
│   ├── expenses.tsx             # Expenses list component
│   ├── login.tsx                # Login screen
│   └── register.tsx             # Registration screen
├── components/                   # Reusable components
│   ├── ExpenseItems.tsx         # Expense item card component
│   ├── haptic-tab.tsx           # Haptic feedback tab button
│   ├── services/                # Business logic services
│   │   ├── auth.ts             # Authentication service
│   │   ├── budget.ts           # Budget management service
│   │   ├── storage.ts          # Local storage service
│   │   ├── sync.ts             # Backend sync service
│   │   └── notifications.ts    # Push notifications
│   └── ui/                      # UI components
│       └── icon-symbol.tsx      # Icon component
├── constants/                    # App constants
│   ├── config.ts               # API configuration
│   └── theme.ts                # Theme colors
├── hooks/                        # Custom React hooks
│   └── use-color-scheme.ts     # Color scheme detection
├── backend/                      # Backend server
│   ├── server.js               # Express server
│   └── package.json            # Backend dependencies
└── assets/                      # Images and assets
```

---

## 🎯 Key Components Explained

### 1. **Categories Screen** (`app/(tabs)/categories.tsx`)
Displays category-wise expense breakdown for the current month.

**Features:**
- Horizontal scrollable category cards
- Real-time percentage calculation using `useMemo`
- Category filtering by tapping on cards
- Visual progress bars for each category
- Color-coded categories (Food, Travel, Shopping, Bills)

**How it works:**
- Filters current month expenses
- Groups expenses by category
- Calculates totals and percentages
- Sorts by highest amount first
- Allows filtering expenses by selected category

### 2. **Budget Management** (`app/(tabs)/budget.tsx`)
Comprehensive budget tracking and management system.

**Features:**
- Add/Delete budgets for categories
- Real-time budget status calculation
- Visual progress bars with color coding:
  - 🔴 Red: Budget exceeded
  - 🟠 Orange: Warning (>80% used)
  - 🟣 Purple: Normal usage
- Shows: Budget, Spent, Remaining amounts
- Percentage usage display

**How it works:**
- Uses `getBudgetStatus()` to calculate spending vs budget
- Compares current month expenses with budget limits
- Updates status on screen focus
- Provides delete functionality with confirmation

### 3. **Daily View** (`app/(tabs)/daily.tsx`)
View expenses for any specific date.

**Features:**
- Date picker (iOS spinner, Android default)
- "Today" indicator for current date
- Daily total calculation
- Filter expenses by exact date match
- Platform-specific date picker UI

**How it works:**
- Uses `isSameDate()` helper to match dates exactly
- Filters expenses by year, month, and day
- Calculates daily total using `reduce()`
- Formats date display ("Today" or full date)

### 4. **Authentication** (`app/login.tsx` & `app/register.tsx`)
Secure user authentication system.

**Features:**
- Email and password validation
- Beautiful animated UI with fade-in effects
- Error handling and user feedback
- Navigation between login and register
- Backend API integration with offline fallback

**How it works:**
- Validates email format and password strength
- Calls backend API for authentication
- Falls back to local storage if backend unavailable
- Stores auth token and user info in AsyncStorage

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Spoorthy1423/PocketExpense-
   cd PocketExpense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on specific platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
```bash
   node server.js
   ```

---

## 📊 State Management

The application uses **React's built-in state management** with `useState` hooks:

- **No Redux**: Simple component-level state management
- **Local State**: Each screen manages its own state
- **AsyncStorage**: Persistent storage for expenses, budgets, and user data
- **useFocusEffect**: Reloads data when screens come into focus

### State Flow Example
```typescript
// Component state
const [expenses, setExpenses] = useState([]);

// Load on screen focus
useFocusEffect(
  useCallback(() => {
    loadExpenses();
  }, [])
);

// AsyncStorage persistence
const loadExpenses = async () => {
  const stored = await getExpenses();
  setExpenses(stored);
};
```

---

## 🔧 Recent Improvements & Fixes

### ✅ Budget Delete Functionality (Fixed)
**Issue**: Budget delete button was missing from the UI, making it impossible to delete budgets.

**Solution**:
- Added complete budget card UI with delete button
- Implemented proper styling with color-coded status indicators
- Added confirmation dialog before deletion
- Fixed missing styles (`deleteButtonContainer`, `budgetAmountItem`)

**Result**: Users can now easily delete budgets with a single tap and confirmation.

### ✅ Login/Register Navigation (Fixed)
**Issue**: Login and Register screens were not accessible from the main app.

**Solution**:
- Added Login and Register buttons to the home screen header
- Implemented navigation using Expo Router
- Added proper styling and layout

**Result**: Users can now easily access authentication screens from the home screen.

---

## 🎨 UI/UX Features

- **Smooth Animations**: Fade-in animations using React Native Reanimated
- **Haptic Feedback**: Tactile feedback on tab navigation
- **Color Coding**: Visual indicators for budget status and categories
- **Progress Bars**: Visual representation of budget usage
- **Empty States**: Helpful messages when no data is available
- **Loading States**: Loading indicators during data fetch
- **Platform-Specific UI**: Different date picker styles for iOS and Android

---

## 📱 Screens Overview

### Home Screen
- Quick access to add expenses
- Login/Register navigation buttons
- Complete expenses list with filtering

### Daily View
- Date picker for selecting any date
- Daily expense total
- Filtered expense list for selected date

### Monthly View
- Monthly expense summary
- Trend analysis
- Calendar-based navigation

### Categories
- Category-wise breakdown
- Percentage visualization
- Filter expenses by category
- Horizontal scrollable cards

### Budget Management
- Add/Delete budgets
- Real-time budget tracking
- Visual progress indicators
- Budget status alerts

---

## 🔐 Authentication Flow

1. User enters email and password
2. App validates input format
3. Backend API call for authentication
4. On success: Store token and user info
5. Navigate to main app (tabs)
6. Fallback to local storage if backend unavailable

---

## 💾 Data Storage

### Local Storage (AsyncStorage)
- **Expenses**: All expense records
- **Budgets**: Monthly budget limits
- **User Data**: Authentication tokens and user info
- **Sync Queue**: Pending sync operations

### Backend Sync
- Automatic background synchronization
- Network status detection
- Queue management for offline operations
- Conflict resolution

---

## 🧪 Development Notes

### Performance Optimizations
- **useMemo**: Caches expensive calculations (category breakdown, filtering)
- **useCallback**: Prevents unnecessary function recreations
- **FlatList**: Efficient rendering of large lists
- **Lazy Loading**: Load data only when screens are focused

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Comprehensive error handling

---

## 🐛 Known Issues & Limitations

- Backend sync requires server to be running
- Offline mode uses local storage only
- Date picker UI differs between iOS and Android (by design)
- No data export functionality (coming soon)

---

## 🚧 Future Enhancements

- [ ] Data export (CSV, PDF)
- [ ] Recurring expenses
- [ ] Expense search functionality
- [ ] Multiple currency support
- [ ] Expense photo attachments
- [ ] Advanced analytics and charts
- [ ] Dark mode support
- [ ] Expense sharing between users
- [ ] Push notifications for budget alerts
- [ ] Expense templates
---
## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI components from [React Native Paper](https://callstack.github.io/react-native-paper/)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- Animations powered by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---
