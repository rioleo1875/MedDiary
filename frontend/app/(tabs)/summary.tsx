import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function MedicalSummary() {
  const router = useRouter();

  // 🔹 Simulated OCR extracted structured data (FR4 → input)
  const medicalData = {
    name: "Archana A",
    age: 21,
    bloodGroup: "A+",
    medications: [
      { name: "Ibuprofen", dosage: "200 mg" },
      { name: "Vitamin D", dosage: "1000 IU" },
    ],
    test: {
      name: "Blood Test",
      date: "Feb 2026",
      hemoglobin: 11.2,
    },
    allergies: "None reported",
  };

  // 🔹 RULE-BASED SUMMARY (FR6 — NO AI)
  const generateSummary = () => {
    let summary = "";

    // Patient Info
    summary += `Patient ${medicalData.name}, aged ${medicalData.age}, has blood group ${medicalData.bloodGroup}. `;

    // Test Evaluation (FR5 logic reused)
    if (medicalData.test.hemoglobin < 12) {
      summary += `Recent laboratory analysis shows hemoglobin level of ${medicalData.test.hemoglobin} g/dL, which is below the normal range. `;
    } else {
      summary += `Recent laboratory results are within normal limits. `;
    }

    // Medications
    if (medicalData.medications.length > 0) {
      const meds = medicalData.medications
        .map((m) => `${m.name}`)
        .join(", ");
      summary += `Current medications include ${meds}. `;
    }

    // Allergies
    summary += `Reported allergies: ${medicalData.allergies}. `;

    // Conclusion
    summary += `No critical medical risks identified based on available records.`;

    return summary;
  };

  const summaryText = generateSummary();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* 🔥 HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <Text style={styles.title}>Medical Summary</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* 🧠 SUMMARY CARD */}
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Generated Summary</Text>
          </View>

          <Text style={styles.summaryText}>{summaryText}</Text>
        </View>

        {/* ⚠️ NOTE */}
        <Text style={styles.note}>
          This summary is generated using extracted medical data and
          rule-based evaluation. It is intended for informational use only.
        </Text>

      </ScrollView>
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
    padding: 18,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  /* BADGE */
  badge: {
    backgroundColor: "#29A9F8",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* TEXT */
  summaryText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },

  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
  },
});