import AsyncStorage from "@react-native-async-storage/async-storage";
const AUTH_TOKEN_KEY = "AUTH_TOKEN";
const USER_KEY = "USER_INFO";
export type User = {
  id: string; 
  email: string; 
  name: string; 
};
export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }
    try {
      const response = await fetch("http://localhost:8082/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (apiError) {
      console.log("Backend not available, using local auth");
      const user: User = {
        id: "1", 
        email: email,
        name: email.split("@")[0], 
      };
      const token = "demo_token_" + Date.now();
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
};
export const register = async (email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    if (!email || !password || !name) {
      return { success: false, error: "All fields are required" };
    }
    try {
      const response = await fetch("http://localhost:8082/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch (apiError) {
      console.log("Backend not available, using local auth");
      const user: User = {
        id: Date.now().toString(), 
        email: email,
        name: name,
      };
      const token = "demo_token_" + Date.now();
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
};
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null; 
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token !== null; 
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};