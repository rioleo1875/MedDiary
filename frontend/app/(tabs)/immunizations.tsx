import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import ChatBubble from "../../components/ChatBubble";

export default function ImmunizationScreen() {
  const router = useRouter();

  const vaccines = [
    { name: "COVID-19", date: "2023" },
    { name: "Hepatitis B", date: "2020" },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >

          {/* 🔥 HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>Immunizations</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* 📋 LIST */}
          {vaccines.length === 0 ? (
            <Text style={styles.empty}>
              No immunization records available
            </Text>
          ) : (
            vaccines.map((v, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.name}>{v.name}</Text>
                <Text style={styles.info}>Date: {v.date}</Text>
              </View>
            ))
          )}

        </ScrollView>

        <ChatBubble />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6ff",
    padding: 20,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },

  /* CARD */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  name: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1f2937",
  },

  info: {
    color: "#6b7280",
    marginTop: 4,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
  },
});