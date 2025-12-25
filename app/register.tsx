import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { register } from "../components/services/auth";
export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setIsLoading(true); 
    try {
      const result = await register(email, password, name);
      if (result.success && result.user) {
        Alert.alert("Success", `Welcome, ${result.user.name}! Account created successfully.`);
        router.replace("/(tabs)"); 
      } else {
        Alert.alert("Registration Failed", result.error || "Could not create account");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false); 
    }
  };
  const handleLogin = () => {
    router.back(); 
  };
  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.content}
      >
        {}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </Animated.View>
        {}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </Animated.View>
        {}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </Animated.View>
        {}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password (min 6 characters)"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry 
            autoCapitalize="none"
            autoComplete="password"
          />
        </Animated.View>
        {}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading} 
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        {}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf5ff", 
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
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
    marginBottom: 48,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: "#1f2937",
  },
  button: {
    backgroundColor: "#9333ea",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#d1d5db",
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: "#6b7280",
    fontSize: 14,
  },
  loginLink: {
    color: "#9333ea",
    fontSize: 14,
    fontWeight: "600",
  },
});