import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function EmergencyProfile() {
  return (
    <ScrollView style={styles.container}>
      
      <Text style={styles.title}>Emergency Profile</Text>

      {/* Basic Identity */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Patient Details</Text>
        <Text style={styles.item}>Name: Archana A</Text>
        <Text style={styles.item}>Age: 21</Text>
        <Text style={styles.item}>Blood Group: A+</Text>
      </View>

      {/* Critical Medical Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Critical Medical Information</Text>
        <Text style={styles.item}>Allergies: None reported</Text>
        <Text style={styles.item}>Chronic Conditions: None</Text>
        <Text style={styles.item}>Current Medications: Ibuprofen</Text>
      </View>

      {/* Emergency Contact */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <Text style={styles.item}>Name: Ajeesh A</Text>
        <Text style={styles.item}>Relation: Family</Text>
        <Text style={styles.item}>Phone: 9947253693</Text>
      </View>

      <Text style={styles.note}>
        This information is read-only and intended strictly for emergency use.
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
    color: "#e63946",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  item: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
  },
});