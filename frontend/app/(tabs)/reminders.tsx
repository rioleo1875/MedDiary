import { useState, useCallback } from "react";
import {
  ScrollView, StyleSheet, Text, View,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import ChatBubble from "../../components/ChatBubble";
import { useMember, API_BASE } from "../../context/MemberContext";

type Reminder = {
  reminder_id: number;
  med_id: number;
  med_name: string;
  hour: number;
  minute: number;
  label: string | null;
};

type Med = {
  med_id: number;
  med_name: string;
};

export default function ReminderScreen() {
  const router = useRouter();
  const { activeMember, userId } = useMember();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [label, setLabel] = useState("");

  // ── Fetch reminders + medications ───────────────────────────
  const fetchData = useCallback(async () => {
    if (!activeMember) return;
    setLoading(true);
    try {
      const [remRes, medRes] = await Promise.all([
        fetch(`${API_BASE}/api/reminders/${activeMember.member_id}`, {
          headers: { "x-user-id": String(userId) },
        }),
        fetch(`${API_BASE}/api/medications/${activeMember.member_id}`, {
          headers: { "x-user-id": String(userId) },
        }),
      ]);
      const remData = await remRes.json();
      const medData = await medRes.json();
      setReminders(remData);
      setMeds(medData);
      if (medData.length > 0 && !selectedMedId) {
        setSelectedMedId(medData[0].med_id);
      }
    } catch {
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [activeMember?.member_id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  // ── Validation ──────────────────────────────────────────────
  const handleHour = (t: string) => setHour(t.replace(/[^0-9]/g, "").slice(0, 2));
  const handleMinute = (t: string) => setMinute(t.replace(/[^0-9]/g, "").slice(0, 2));

  const isValidTime = () => {
    const h = Number(hour); const m = Number(minute);
    return h >= 1 && h <= 12 && m >= 0 && m <= 59;
  };

  // Convert 12h to 24h for backend
  const to24Hour = (h: number, per: "AM" | "PM") => {
    if (per === "AM") return h === 12 ? 0 : h;
    return h === 12 ? 12 : h + 12;
  };

  // ── Add reminder ────────────────────────────────────────────
  const addReminder = async () => {
    if (!selectedMedId) { Alert.alert("Select a medication"); return; }
    if (!isValidTime()) { Alert.alert("Enter a valid time (HH: 1-12, MM: 0-59)"); return; }
    if (!activeMember) return;
    setSaving(true);
    try {
      const hour24 = to24Hour(Number(hour), period);
      const res = await fetch(`${API_BASE}/api/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId),
        },
        body: JSON.stringify({
          med_id: selectedMedId,
          member_id: activeMember.member_id,
          hour: hour24,
          minute: Number(minute),
          label: label.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error); return; }
      setHour(""); setMinute(""); setLabel("");
      await fetchData();
    } catch {
      Alert.alert("Error", "Failed to add reminder");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete reminder ─────────────────────────────────────────
  const deleteReminder = async (reminderId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/reminders/${reminderId}`, {
        method: "DELETE",
        headers: { "x-user-id": String(userId) },
      });
      if (!res.ok) { Alert.alert("Error", "Failed to delete"); return; }
      setReminders((prev) => prev.filter((r) => r.reminder_id !== reminderId));
    } catch {
      Alert.alert("Error", "Failed to delete reminder");
    }
  };

  // ── Format display time ─────────────────────────────────────
  const formatTime = (h: number, m: number) => {
    const per = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${per}`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.title}>Reminders</Text>
            <View style={{ width: 24 }} />
          </View>

          {activeMember && (
            <Text style={styles.memberLabel}>For {activeMember.name}</Text>
          )}

          {loading ? (
            <ActivityIndicator color="#29A9F8" size="large" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* MEDICATION PICKER */}
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>Select Medication</Text>
                {meds.length === 0 ? (
                  <Text style={styles.empty}>No medications found. Add medications first.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {meds.map((m) => (
                      <TouchableOpacity
                        key={m.med_id}
                        style={[
                          styles.medChip,
                          selectedMedId === m.med_id && styles.medChipSelected,
                        ]}
                        onPress={() => setSelectedMedId(m.med_id)}
                      >
                        <Text style={[
                          styles.medChipText,
                          selectedMedId === m.med_id && styles.medChipTextSelected,
                        ]}>
                          {m.med_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* TIME INPUT */}
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>Set Time</Text>
                <View style={styles.timeRow}>
                  <TextInput
                    placeholder="HH"
                    style={styles.small}
                    keyboardType="number-pad"
                    value={hour}
                    onChangeText={handleHour}
                  />
                  <Text style={styles.colon}>:</Text>
                  <TextInput
                    placeholder="MM"
                    style={styles.small}
                    keyboardType="number-pad"
                    value={minute}
                    onChangeText={handleMinute}
                  />
                  <TouchableOpacity
                    style={styles.ampm}
                    onPress={() => setPeriod(period === "AM" ? "PM" : "AM")}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>{period}</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Label (optional, e.g. After breakfast)"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={label}
                  onChangeText={setLabel}
                />

                <TouchableOpacity
                  style={[styles.button, saving && { opacity: 0.6 }]}
                  onPress={addReminder}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? "Adding..." : "Add Reminder"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* REMINDER LIST */}
              <Text style={styles.section}>Scheduled Reminders</Text>
              {reminders.length === 0 ? (
                <Text style={styles.empty}>No reminders added</Text>
              ) : (
                reminders.map((r) => (
                  <View key={r.reminder_id} style={styles.reminderCard}>
                    <View>
                      <Text style={styles.remMed}>{r.med_name}</Text>
                      <Text style={styles.remTime}>{formatTime(r.hour, r.minute)}</Text>
                      {r.label && <Text style={styles.remLabel}>{r.label}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => deleteReminder(r.reminder_id)}>
                      <Ionicons name="trash" size={20} color="#e63946" />
                    </TouchableOpacity>
                  </View>
                ))
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
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#1f2937" },
  memberLabel: { fontSize: 13, color: "#6b7280", marginBottom: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16,
    padding: 16, marginBottom: 16, elevation: 3,
  },
  sectionLabel: { fontWeight: "600", color: "#1f2937", marginBottom: 12 },
  medChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: "#f3f4f6", borderRadius: 20, marginRight: 8,
  },
  medChipSelected: { backgroundColor: "#29A9F8" },
  medChipText: { color: "#374151", fontWeight: "500" },
  medChipTextSelected: { color: "#fff" },
  timeRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  small: {
    backgroundColor: "#f9fafb", padding: 12,
    borderRadius: 10, width: 65, textAlign: "center", marginRight: 8,
  },
  colon: { fontSize: 20, fontWeight: "600", marginRight: 8, color: "#1f2937" },
  ampm: { backgroundColor: "#29A9F8", padding: 12, borderRadius: 10 },
  input: {
    backgroundColor: "#f9fafb", padding: 14,
    borderRadius: 12, marginBottom: 12,
  },
  button: {
    backgroundColor: "#29A9F8", padding: 16,
    borderRadius: 12, alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  section: { fontWeight: "600", marginBottom: 10, color: "#1f2937" },
  reminderCard: {
    backgroundColor: "#fff", padding: 14, borderRadius: 12,
    marginBottom: 10, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center", elevation: 2,
  },
  remMed: { fontWeight: "600", color: "#1f2937" },
  remTime: { color: "#29A9F8", fontWeight: "700", fontSize: 16, marginTop: 2 },
  remLabel: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 10 },
});