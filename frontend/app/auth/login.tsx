import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!email || !email.includes("@")) {
      alert("Enter valid email address");
      return;
    }

    router.push("/auth/otp");
  };

  return (
    <View style={styles.container}>

      {/* Top Logo Section */}
      <View style={styles.logoSection}>
        <Text style={styles.logo}>
          <Text style={styles.med}>Med</Text>
          <Text style={styles.diary}>Diary</Text>
        </Text>

        <Text style={styles.tagline}>
          Your Personal Health Companion
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.bottomText}>New to MedDiary?</Text>
        <TouchableOpacity onPress={() => router.push("../auth/create-account")}>
  <Text style={styles.createAccount}>
    Create Account
  </Text>
</TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#eaf6ff",
    justifyContent: "space-between",
    paddingVertical: 120,
    paddingHorizontal: 35,
  },

  logoSection: {
    alignItems: "center",
  },

  logo: {
    fontSize: 60,
    fontWeight: "800",
  },

  med: {
    color: "#29A9F8",
  },

  diary: {
    color: "#1f2937",
  },

  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: "#6b7280",
  },

  inputSection: {
    width: "100%",
  },

  input: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginBottom: 25,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  button: {
    backgroundColor: "#29A9F8",
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },

  bottomSection: {
    alignItems: "center",
  },

  bottomText: {
    color: "#6b7280",
    fontSize: 16,
  },

  createAccount: {
    marginTop: 6,
    color: "#29A9F8",
    fontWeight: "600",
    fontSize: 16,
  },

});