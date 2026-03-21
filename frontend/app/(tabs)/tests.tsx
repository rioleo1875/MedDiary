import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import ChatBubble from "../../components/ChatBubble";

export default function TestScreen() {
  const router = useRouter();

  const tests = [
    {
      name: "Hemoglobin",
      value: 11.2,
      normalRange: "12–16 g/dL",
      lastUpdated: "05 Feb 2026",
    },
  ];

  // 🔹 FR5: Rule-based classification
  const getStatus = (value: number) => {
    if (value < 12) return { label: "Abnormal", color: "#e63946" };
    if (value < 13) return { label: "Borderline", color: "#f59e0b" };
    return { label: "Normal", color: "#16a34a" };
  };

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

            <Text style={styles.title}>Test Results</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* 📋 TEST LIST */}
          {tests.length === 0 ? (
            <Text style={styles.empty}>
              No test results available
            </Text>
          ) : (
            tests.map((t, i) => {
              const status = getStatus(t.value);

              return (
                <View key={i} style={styles.card}>

                  {/* NAME */}
                  <Text style={styles.name}>{t.name}</Text>

                  {/* VALUE */}
                  <Text style={styles.value}>
                    {t.value}
                  </Text>

                  {/* RANGE */}
                  <Text style={styles.info}>
                    Normal Range: {t.normalRange}
                  </Text>

                  {/* LAST UPDATED (FR15) */}
                  <Text style={styles.updated}>
                    Last Updated: {t.lastUpdated}
                  </Text>

                  {/* STATUS BADGE (FR5) */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: status.color },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {status.label}
                    </Text>
                  </View>

                </View>
              );
            })
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
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
  },

  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
  },

  info: {
    color: "#6b7280",
    marginTop: 4,
  },

  updated: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
  },

  /* STATUS */
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
  },
});