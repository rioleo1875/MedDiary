import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function MedicalSummary() {

  // 🔹 This simulates OCR-extracted structured data
  const medicalData = {
    name: "Archana A",
    age: 21,
    bloodGroup: "A+",
    medications: [
      { name: "Ibuprofen", dosage: "200 mg" },
      { name: "Vitamin D", dosage: "1000 IU" }
    ],
    test: {
      name: "Blood Test",
      date: "Feb 2026",
      hemoglobin: 11.2,
    }
  };

  // 🔹 Rule-based summary generator (NO AI)
  const generateSummary = () => {
    let summary = "";

    // Patient Info
    summary += `Patient ${medicalData.name}, aged ${medicalData.age}, has blood group ${medicalData.bloodGroup}. `;

    // Test Analysis (rule-based)
    if (medicalData.test.hemoglobin < 12) {
      summary += `Recent lab results indicate a hemoglobin level of ${medicalData.test.hemoglobin} g/dL, which is slightly below the normal range. `;
    } else {
      summary += `Recent lab results are within normal range. `;
    }

    // Medications
    if (medicalData.medications.length > 0) {
      const meds = medicalData.medications.map(m => m.name).join(", ");
      summary += `The patient is currently taking ${meds}. `;
    }

    summary += `No critical conditions detected based on available records.`;

    return summary;
  };

  const summaryText = generateSummary();

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Medical Summary</Text>

      {/* Generated Summary Card */}
      <View style={styles.card}>
        <Text style={styles.section}>Summary</Text>
        <Text style={styles.summaryText}>{summaryText}</Text>
      </View>

      <Text style={styles.note}>
        This summary is generated using extracted medical data and rule-based evaluation. It is for informational purposes only.
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1f2937",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  section: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

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