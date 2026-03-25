
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ChatBubble from "../../components/ChatBubble";
import { useMember, API_BASE } from "../../context/MemberContext";

export default function Medications() {
  const router = useRouter();
  const { activeMember, userId } = useMember();

  const [regularMeds, setRegularMeds] = useState<any[]>([]);
  const [tempMeds, setTempMeds] = useState<any[]>([]);
  const [interaction, setInteraction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingInteraction, setCheckingInteraction] = useState(false);

  const fetchMedications = async () => {
    if (!activeMember) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/medications/${activeMember.member_id}`,
        { headers: { "x-user-id": String(userId) } }
      );
      const data = await res.json();

      setRegularMeds(data.filter((m: any) => !m.end_date));
      setTempMeds(data.filter((m: any) => m.end_date));

     
      await checkInteractions();
    } catch (err) {
      Alert.alert("Error", "Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const checkInteractions = async () => {
    if (!activeMember) {
      Alert.alert("No Member", "Please select a family member first.");
      return;
    }
    
    try {
      setCheckingInteraction(true);
      const res = await fetch(`${API_BASE}/api/ddi/check/${activeMember.member_id}`, {
        method: "POST",
        headers: { "x-user-id": String(userId) },
      });
      const data = await res.json();
      setInteraction(data.warningMessage || "No interactions detected");
    } catch (err) {
      console.error("DDI check error:", err);
      Alert.alert("Error", "Failed to check drug interactions");
    } finally {
      setCheckingInteraction(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, [activeMember?.member_id])
  );

  const renderMed = (med: any) => (
    <View key={med.med_id} style={styles.pill}>
      <Text style={styles.pillText}>{med.med_name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.title}>Medications</Text>
            <View style={{ width: 24 }} />
          </View>

          {activeMember && (
            <Text style={styles.memberLabel}>
              Viewing {activeMember.name}'s medications
            </Text>
          )}

          {loading ? (
            <ActivityIndicator color="#29A9F8" size="large" style={{ marginTop: 40 }} />
          ) : (
            <>
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Regular Meds</Text>
                    {regularMeds.length === 0 ? (
                      <Text style={styles.empty}>None</Text>
                    ) : (
                      regularMeds.map(renderMed)
                    )}
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Temporary Meds</Text>
                    {tempMeds.length === 0 ? (
                      <Text style={styles.empty}>None</Text>
                    ) : (
                      tempMeds.map(renderMed)
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/(tabs)/edit-medications" as any)}
              >
                <Text style={styles.buttonText}>Edit Medications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/(tabs)/reminders" as any)}
              >
                <Text style={styles.buttonText}>Set Reminders</Text>
              </TouchableOpacity>

              {interaction && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={18} color="#b91c1c" />
                  <Text style={styles.warningText}>{interaction}</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <ChatBubble />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf6ff", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1f2937" },
  memberLabel: { fontSize: 13, color: "#6b7280", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { width: "48%" },
  sectionTitle: { fontWeight: "600", marginBottom: 10, color: "#1f2937" },
  pill: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  pillText: { fontSize: 13, color: "#1f2937" },
  empty: { fontSize: 13, color: "#9ca3af" },
  button: {
    backgroundColor: "#29A9F8",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#fde2e2",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "flex-start",
    gap: 8,
  },
  warningText: { color: "#b91c1c", fontWeight: "500", flex: 1 },
});