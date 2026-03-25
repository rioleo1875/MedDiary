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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";

export default function ChatbotScreen() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I am your MedDiary assistant. How can I help you?",
    },
  ]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    // Add user message
    const userMessage = { from: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      // Send to backend
      const response = await fetch(`${API_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, { from: "bot", text: data.reply }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: "Sorry, I'm having trouble connecting. Please try again later." 
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>MedDiary Assistant</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* CHAT AREA */}
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
            
            {loading && (
              <View style={styles.botMsg}>
                <ActivityIndicator color="#29A9F8" size="small" />
              </View>
            )}
          </ScrollView>

          {/* INPUT */}
          <View style={styles.inputArea}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              style={styles.input}
              editable={!loading}
            />

            <TouchableOpacity 
              style={styles.sendBtn} 
              onPress={sendMessage}
              disabled={loading}
            >
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