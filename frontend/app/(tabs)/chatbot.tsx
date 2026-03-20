import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ChatbotScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I am your MedDiary assistant. How can I help you?" },
  ]);

  const sendMessage = () => {
    if (!message) return;

    const newMessages = [
      ...messages,
      { from: "user", text: message },
      {
        from: "bot",
        text: "This is a demo response. Backend chatbot will answer later.",
      },
    ];

    setMessages(newMessages);
    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>MedDiary Assistant</Text>

        <View style={styles.chatArea}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={msg.from === "user" ? styles.userMsg : styles.botMsg}
            >
              <Text style={msg.from === "user" ? styles.userText : styles.botText}>
                {msg.text}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.inputArea}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            style={styles.input}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6ff",
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
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
    marginBottom: 20,
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  sendText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});