import { useState, useCallback } from "react";
import {
  ScrollView, StyleSheet, Text, View,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import { useMember, API_BASE } from "../../context/MemberContext";

type Med = {
  med_id: number;
  med_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
};

export default function EditMedications() {
  const router = useRouter();
  const { activeMember, userId } = useMember();

  const [medList, setMedList] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [type, setType] = useState<"regular" | "temporary">("regular");
  const [endDate, setEndDate] = useState(""); // only for temporary
  const [ddiWarning, setDdiWarning] = useState<string | null>(null);
  const [checkingDDI, setCheckingDDI] = useState(false);

  // ── Fetch from backend ──────────────────────────────────────
  const fetchMeds = useCallback(async () => {
    if (!activeMember) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/medications/${activeMember.member_id}`,
        { headers: { "x-user-id": String(userId) } }
      );
      const data = await res.json();
      setMedList(data);
    } catch {
      Alert.alert("Error", "Failed to load medications");
    } finally {
      setLoading(false);
    }
  }, [activeMember?.member_id]);

  useFocusEffect(useCallback(() => { fetchMeds(); }, [fetchMeds]));

  // ── Check DDI before adding medication ───────────────────────
  const checkDDI = async (newMedName: string) => {
    if (!activeMember || !newMedName.trim()) return;
    
    setCheckingDDI(true);
    try {
      // Get current medications + new one to check
      const currentMeds = medList.map(m => m.med_name.toLowerCase());
      const allMeds = [...currentMeds, newMedName.toLowerCase()];
      
      if (allMeds.length < 2) {
        setDdiWarning(null);
        return;
      }

      const res = await fetch(`${API_BASE}/api/ddi/check/${userId}`, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) },
      });
      const data = await res.json();
      
      if (data.highRiskCount > 0) {
        setDdiWarning(data.warningMessage);
      } else {
        setDdiWarning(null);
      }
    } catch (err) {
      console.error("DDI check error:", err);
    } finally {
      setCheckingDDI(false);
    }
  };

  // ── Add medication ──────────────────────────────────────────
  const addMedication = async () => {
    if (!name.trim()) { Alert.alert("Enter medication name"); return; }
    if (!activeMember) return;
    
    // Show confirmation if there's a DDI warning
    if (ddiWarning) {
      Alert.alert(
        "Drug Interaction Warning",
        `${ddiWarning}\n\nDo you want to continue adding this medication?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Anyway", onPress: () => proceedWithAdd() }
        ]
      );
    } else {
      proceedWithAdd();
    }
  };
  
  const proceedWithAdd = async () => {
    if (!activeMember) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId),
        },
        body: JSON.stringify({
          member_id: activeMember.member_id,
          med_name: name.trim(),
          dosage: dosage.trim() || null,
          frequency: frequency.trim() || null,
          start_date: new Date().toISOString().slice(0, 10),
          end_date: type === "temporary" && endDate ? endDate : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error); return; }
      setName(""); setDosage(""); setFrequency(""); setEndDate("");
      setDdiWarning(null);
      await fetchMeds();
    } catch {
      Alert.alert("Error", "Failed to add medication");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete medication ───────────────────────────────────────
  const deleteMedication = async (medId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/medications/${medId}`, {
        method: "DELETE",
        headers: { "x-user-id": String(userId) },
      });
      if (!res.ok) { Alert.alert("Error", "Failed to delete"); return; }
      setMedList((prev) => prev.filter((m) => m.med_id !== medId));
    } catch {
      Alert.alert("Error", "Failed to delete medication");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Medications</Text>
          <View style={{ width: 24 }} />
        </View>

        {activeMember && (
          <Text style={styles.memberLabel}>For {activeMember.name}</Text>
        )}

        {/* ADD FORM */}
        <View style={styles.card}>
          <TextInput
            placeholder="Medication name *"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (text.trim()) {
                checkDDI(text.trim());
              } else {
                setDdiWarning(null);
              }
            }}
          />
          {ddiWarning && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={18} color="#b91c1c" />
              <Text style={styles.warningText}>{ddiWarning}</Text>
            </View>
          )}
          <TextInput
            placeholder="Dosage (e.g. 500mg)"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
          />
          <TextInput
            placeholder="Frequency (e.g. twice daily)"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
          />

          {/* TYPE */}
          <View style={styles.typeRow}>
            {(["regular", "temporary"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && styles.typeSelected]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeText, type === t && styles.typeTextSelected]}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {type === "temporary" && (
            <TextInput
              placeholder="End date (YYYY-MM-DD)"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
            />
          )}

          <TouchableOpacity
            style={[styles.addBtn, saving && { opacity: 0.6 }]}
            onPress={addMedication}
            disabled={saving}
          >
            <Text style={styles.addText}>{saving ? "Adding..." : "Add Medication"}</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator color="#29A9F8" style={{ marginTop: 20 }} />
        ) : medList.length === 0 ? (
          <Text style={styles.empty}>No medications added yet</Text>
        ) : (
          medList.map((m) => (
            <View key={m.med_id} style={styles.medCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{m.med_name}</Text>
                {m.dosage && <Text style={styles.medSub}>Dosage: {m.dosage}</Text>}
                {m.frequency && <Text style={styles.medSub}>Frequency: {m.frequency}</Text>}
                <View style={[styles.tag, m.end_date ? styles.tempTag : styles.regularTag]}>
                  <Text style={styles.tagText}>
                    {m.end_date ? "TEMPORARY" : "REGULAR"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteMedication(m.med_id)}>
                <Ionicons name="trash" size={22} color="#e63946" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf6ff", padding: 20 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#1f2937" },
  memberLabel: { fontSize: 13, color: "#6b7280", marginBottom: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16,
    padding: 16, marginBottom: 20, elevation: 3,
  },
  input: {
    backgroundColor: "#f9fafb", padding: 14,
    borderRadius: 12, marginBottom: 12,
  },
  typeRow: { flexDirection: "row", marginBottom: 12 },
  typeBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: "#e5e7eb", alignItems: "center", marginHorizontal: 4,
  },
  typeSelected: { backgroundColor: "#29A9F8" },
  typeText: { color: "#374151", fontWeight: "600" },
  typeTextSelected: { color: "#fff" },
  addBtn: {
    backgroundColor: "#29A9F8", padding: 16,
    borderRadius: 14, alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  medCard: {
    backgroundColor: "#fff", padding: 16, borderRadius: 14,
    marginBottom: 12, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center", elevation: 2,
  },
  medName: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  medSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  tag: {
    marginTop: 6, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, alignSelf: "flex-start",
  },
  regularTag: { backgroundColor: "#dbeafe" },
  tempTag: { backgroundColor: "#fef3c7" },
  tagText: { fontSize: 11, fontWeight: "600", color: "#1f2937" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 30 },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#fde2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "flex-start",
    gap: 8,
  },
  warningText: { color: "#b91c1c", fontWeight: "500", flex: 1, fontSize: 13 },
});