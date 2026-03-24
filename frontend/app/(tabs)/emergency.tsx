import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useMember, API_BASE } from "../../context/MemberContext";

type Contact = {
  contact_id: number;
  name: string;
  user_email: string;
  relationship: string;
};

export default function EmergencyProfile() {
  const router = useRouter();
  const { activeMember, userId } = useMember();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/emergency/my-contacts`, {
        headers: { "x-user-id": String(userId) },
      });
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load emergency contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Emergency Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ALERT */}
        <View style={styles.alertBar}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.alertText}>
            Emergency Information (Read-Only)
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Name: </Text>
            {activeMember?.name ?? "—"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Age: </Text>
            {activeMember?.age ?? "—"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Blood Group: </Text>
            {activeMember?.blood_group ?? "—"}
          </Text>
        </View>

        {/* CRITICAL MEDICAL INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Critical Medical Information</Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Allergies: </Text>
            {activeMember?.allergies ?? "None reported"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Emergency Contact: </Text>
            {activeMember?.emergency_contact_name ?? "Not set"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Contact Phone: </Text>
            {activeMember?.emergency_contact_phone ?? "Not set"}
          </Text>
        </View>

          {/* EMERGENCY CONTACTS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>MedDiary Emergency Contacts</Text>
          <Text style={styles.subNote}>
            These are MedDiary users you've added who can access your medical
            summary.
          </Text>

          {loading ? (
            <ActivityIndicator color="#29A9F8" style={{ marginTop: 10 }} />
          ) : contacts.length === 0 ? (
            <Text style={styles.item}>No MedDiary emergency contacts added yet.</Text>
          ) : (
            contacts.map((c) => (
              <View key={c.contact_id} style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {c.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactSub}>{c.user_email}</Text>
                  <Text style={styles.contactSub}>Relation: {c.relationship}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.note}>
          This information is strictly for emergency use and is read-only.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf6ff", padding: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: { fontSize: 18, fontWeight: "600", color: "#1f2937" },

  alertBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e63946",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  alertText: { color: "#fff", marginLeft: 8, fontWeight: "600" },

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

  subNote: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },

  item: { fontSize: 14, color: "#374151", marginBottom: 6 },
  label: { fontWeight: "600", color: "#1f2937" },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#29A9F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contactAvatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  contactName: { fontWeight: "600", fontSize: 14, color: "#1f2937" },
  contactSub: { fontSize: 12, color: "#6b7280" },

  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
    marginBottom: 40,
  },
});