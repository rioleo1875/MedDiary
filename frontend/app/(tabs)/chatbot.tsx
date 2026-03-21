import { useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function ChatbotScreen() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I am your MedDiary assistant. How can I help you?",
    },
  ]);

  // 🔹 Rule-based data (SRS compliant)
  const data = {
    name: "Archana A",
    blood: "A+",
    medications: ["Ibuprofen", "Vitamin D"],
    test: "Blood test done in Feb 2026",
    emergency: "Ajeesh A",
  };

  // 🔹 Rule-based chatbot (NO AI)
  const getResponse = (text: string) => {
    const query = text.toLowerCase();

    if (query.includes("blood")) {
      return `Your blood group is ${data.blood}.`;
    }

    if (query.includes("medicine") || query.includes("medication")) {
      return `You are taking ${data.medications.join(", ")}.`;
    }

    if (query.includes("test")) {
      return `Recent test: ${data.test}.`;
    }

    if (query.includes("emergency")) {
      return `Emergency contact: ${data.emergency}.`;
    }

    if (query.includes("name")) {
      return `Your name is ${data.name}.`;
    }

    return "I can answer questions related to your medical records.";
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessages = [
      ...messages,
      { from: "user", text: message },
      { from: "bot", text: getResponse(message) },
    ];

    setMessages(newMessages);
    setMessage("");

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>

          {/* 🔥 HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>MedDiary Assistant</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* 🔥 CHAT AREA */}
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={msg.from === "user" ? styles.userMsg : styles.botMsg}
              >
                <Text
                  style={
                    msg.from === "user"
                      ? styles.userText
                      : styles.botText
                  }
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* 🔥 INPUT */}
          <View style={styles.inputArea}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />

            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6ff",
    paddingHorizontal: 16,
  },

  /* 🔥 HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },

  /* CHAT */
  chatArea: {
    flex: 1,
    marginTop: 10,
  },

  botMsg: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },

  botText: {
    color: "#1f2937",
  },

  userMsg: {
    backgroundColor: "#29A9F8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },

  userText: {
    color: "#ffffff",
  },

  /* INPUT */
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 5,
  },

  input: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginRight: 8,
  },

  sendBtn: {
    backgroundColor: "#29A9F8",
    padding: 14,
    borderRadius: 12,
  },
});