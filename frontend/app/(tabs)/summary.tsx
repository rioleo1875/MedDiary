import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function MedicalSummary() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Medical Summary</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Patient Details</Text>
        <Text>Name: Archana A</Text>
        <Text>Blood Group: A+</Text>
        <Text>Age: 21</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Medications</Text>
        <Text>• Ibuprofen – 200 mg</Text>
        <Text>• Vitamin D – 1000 IU</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Recent Test Results</Text>
        <Text>• Blood Test – Feb 2026</Text>
      </View>

      <Text style={styles.note}>
        This summary is generated from existing medical records and is for
        informational purposes only.
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
  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
  },
});
