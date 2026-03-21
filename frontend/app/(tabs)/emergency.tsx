import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function EmergencyProfile() {
  const router = useRouter();

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

          <Text style={styles.title}>Emergency Profile</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* 🚨 ALERT BAR */}
        <View style={styles.alertBar}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.alertText}>
            Emergency Information (Read-Only)
          </Text>
        </View>

        {/* 🧾 PATIENT DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Details</Text>

          <Text style={styles.item}><Text style={styles.label}>Name:</Text> Archana A</Text>
          <Text style={styles.item}><Text style={styles.label}>Age:</Text> 21</Text>
          <Text style={styles.item}><Text style={styles.label}>Blood Group:</Text> A+</Text>
        </View>

        {/* ⚕️ CRITICAL INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Critical Medical Information</Text>

          <Text style={styles.item}><Text style={styles.label}>Allergies:</Text> None reported</Text>
          <Text style={styles.item}><Text style={styles.label}>Conditions:</Text> None</Text>
          <Text style={styles.item}><Text style={styles.label}>Medications:</Text> Ibuprofen</Text>
        </View>

        {/* 📞 EMERGENCY CONTACT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>

          <Text style={styles.item}><Text style={styles.label}>Name:</Text> Ajeesh A</Text>
          <Text style={styles.item}><Text style={styles.label}>Relation:</Text> Father</Text>
          <Text style={styles.item}><Text style={styles.label}>Phone:</Text> 9947253693</Text>
        </View>

        {/* NOTE */}
        <Text style={styles.note}>
          This information is strictly for emergency use and is read-only.
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

  /* ALERT */
  alertBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e63946",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  alertText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },

  /* CARD */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1f2937",
  },

  item: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },

  label: {
    fontWeight: "600",
    color: "#1f2937",
  },

  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
  },
});