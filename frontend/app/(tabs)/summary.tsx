import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";

const API_URL = "YOUR_NGROK_OR_BACKEND_URL";

export default function GenerateSummary() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams(); 

  const handleGeneratePDF = async () => {
    try {
      const url = `${API_URL}/summary/generate/${memberId}`;

      
      await Linking.openURL(url);

    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to generate summary");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <Text style={styles.title}>Medical Summary</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* BUTTON CARD */}
        <View style={styles.card}>
          <Text style={styles.infoText}>
            Generate a complete medical summary PDF for this member.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleGeneratePDF}>
            <Text style={styles.buttonText}>Generate PDF</Text>
          </TouchableOpacity>
        </View>

        {/* NOTE */}
        <Text style={styles.note}>
          This summary is generated using stored medical data and rule-based evaluation.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6ff",
    padding: 20,
    justifyContent: "center",
  },

  header: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  infoText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 15,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#29A9F8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 15,
    textAlign: "center",
  },
});