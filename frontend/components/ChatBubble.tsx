import { useRouter } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ChatBubble() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.chatBubble}
      onPress={() => router.push("/(tabs)/chatbot")}
    >
      <Ionicons name="chatbubbles-sharp" size={28} color="#ffffff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatBubble: {
    position: "absolute",
    bottom: 25,
    left: 20,

    backgroundColor: "#29A9F8",
    width: 60,
    height: 60,
    borderRadius: 30,

    justifyContent: "center",
    alignItems: "center",

    elevation: 6,
  },
});