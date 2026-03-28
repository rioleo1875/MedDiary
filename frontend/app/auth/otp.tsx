import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { API_BASE } from "../../context/MemberContext";
import { useAuth } from "../../context/AuthContext";

export default function OtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams(); 
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

const verifyOtp = async () => {
  if (otp.length !== 6) {
    alert("Enter valid OTP");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (data.success) {
      console.log('OTP Screen: OTP verification successful, calling login...');
      try {
        await login(email as string, data.user);
        console.log('OTP Screen: Login completed, navigating to tabs...');
        router.replace("/(tabs)");
      } catch (error) {
        console.error('OTP Screen: Login failed:', error);
        alert("Login failed. Please try again.");
      }
    } else {
      alert("Invalid OTP");
      setOtp("");
    }

  } catch (error) {
    alert("Error verifying OTP");
  } finally {
    setLoading(false);
  }
};

const handleResendOtp = async () => {
  if (!canResend) return;

  setLoading(true);
  setTimer(60);
  setCanResend(false);

  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      alert("OTP resent to your email");
      setOtp("");
    } else {
      alert("Failed to resend OTP");
    }
  } catch (error) {
    alert("Error resending OTP");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Text style={styles.logo}>
          <Text style={styles.med}>Med</Text>
          <Text style={styles.diary}>Diary</Text>
        </Text>

        <Text style={styles.tagline}>
          Your Personal Health Companion
        </Text>
      </View>

      {/* OTP Section */}
      <View style={styles.inputSection}>

        <Text style={styles.subtitle}>
          Enter the verification code sent to your email
        </Text>

        <TouchableOpacity
          activeOpacity={1}
          style={styles.otpContainer}
          onPress={() => inputRef.current?.focus()}
        >
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={styles.otpBox}>
              <Text style={styles.otpText}>{otp[index] || ""}</Text>
            </View>
          ))}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOtp} disabled={!canResend || loading}>
          <Text style={styles.resend}>
            {canResend ? "Resend OTP" : `Resend in ${timer}s`}
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
    paddingHorizontal: 35,
    paddingTop: 120,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 80,
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
    alignItems: "center",
  },

  subtitle: {
    marginBottom: 25,
    color: "#6b7280",
    textAlign: "center",
  },

  input: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginBottom: 25,
    width: "100%",
    textAlign: "center",
    fontSize: 20,
    letterSpacing: 6,

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
    width: "100%",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },

  resend: {
    marginTop: 20,
    color: "#29A9F8",
    fontWeight: "600",
  },

  otpContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  marginBottom: 25,
  marginTop: 10,
},

  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },

  otpBox: {
  width: 50,
  height: 60,
  borderRadius: 12,
  backgroundColor: "#ffffff",
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },

  elevation: 3,
},

  otpText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },

});