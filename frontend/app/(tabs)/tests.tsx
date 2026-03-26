import {
  ScrollView, StyleSheet, Text, View,
  TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import ChatBubble from "../../components/ChatBubble";
import { API_BASE, useMember } from "../../context/MemberContext";

type TestResult = {
  test_id: number;
  test_name: string;
  value: number;
  unit: string | null;
  normal_min: number;
  normal_max: number;
  status: string;
  test_date: string;
  edited_by_user: number;
};

type GroupedDate = { date: string; results: TestResult[] };

export default function TestScreen() {
  const router = useRouter();
  const { activeMember, userId } = useMember();

  const [grouped, setGrouped] = useState<GroupedDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [editingTest, setEditingTest] = useState<TestResult | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [saving, setSaving] = useState(false);

  // Add test modal
  const [showAddTest, setShowAddTest] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestValue, setNewTestValue] = useState("");
  const [newTestUnit, setNewTestUnit] = useState("");
  const [addingTest, setAddingTest] = useState(false);

  // ── Fetch existing results ──────────────────────────────────
  const fetchTests = useCallback(async () => {
    if (!activeMember) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/tests/member/${activeMember.member_id}`,
        { headers: { "x-user-id": String(userId) } }
      );
      const data = await res.json();
      setGrouped(data.groupedByDate ?? []);
    } catch {
      Alert.alert("Error", "Failed to load test results");
    } finally {
      setLoading(false);
    }
  }, [activeMember?.member_id]);

  useFocusEffect(useCallback(() => { fetchTests(); }, [fetchTests]));

  // ── Add Test ───────────────────────────────────────────────
  const handleAddTest = async () => {
    if (!activeMember || !newTestName || !newTestValue) {
      Alert.alert("Missing Info", "Please fill in test name and value.");
      return;
    }

    setAddingTest(true);
    try {
      // Use hardcoded test dictionary since API endpoint doesn't exist
      const testDict: Record<string, { aliases: string[]; normal_min: number; normal_max: number }> = {
        fbs: { aliases: ["fbs", "fasting blood sugar", "fasting glucose", "glucose", "blood sugar", "sugar"], normal_min: 70, normal_max: 100 },
        rbs: { aliases: ["rbs", "random blood sugar", "random glucose"], normal_min: 70, normal_max: 140 },
        hba1c: { aliases: ["hba1c", "a1c", "glycated hemoglobin"], normal_min: 4, normal_max: 5.6 },
        tsh: { aliases: ["tsh", "thyroid stimulating hormone", "tsh 3rd generation"], normal_min: 0.4, normal_max: 4.5 },
        t3: { aliases: ["t3", "triiodothyronine"], normal_min: 80, normal_max: 200 },
        t4: { aliases: ["t4", "thyroxine"], normal_min: 5, normal_max: 12 },
      };
      
      // Find matching test in dictionary
      const testKey = Object.keys(testDict).find(key => {
        const testEntry = testDict[key];
        return testEntry?.aliases?.some((alias: string) => 
          alias.toLowerCase() === newTestName.toLowerCase()
        );
      });
      
      let normalMin = 0;
      let normalMax = 100;
      
      if (testKey && testDict[testKey]) {
        normalMin = testDict[testKey].normal_min;
        normalMax = testDict[testKey].normal_max;
      }
      
      const res = await fetch(`${API_BASE}/api/tests/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": String(userId) },
        body: JSON.stringify({
          member_id: activeMember.member_id,
          test_name: newTestName,
          value: newTestValue, // Send as string, not number
          unit: newTestUnit || null,
          normal_min: normalMin,
          normal_max: normalMax,
          test_date: new Date().toISOString().split('T')[0]
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        Alert.alert("Error", error.error || "Failed to add test result");
        return;
      }
      
      Alert.alert("Success", "Test result added and stored!");
      setShowAddTest(false);
      setNewTestName("");
      setNewTestValue("");
      setNewTestUnit("");
      await fetchTests();
    } catch (err) {
      console.error("Add test error:", err);
      Alert.alert("Error", `Failed to add test result: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAddingTest(false);
    }
  };

  // ── Edit & Delete functions ─────────────────────────────────
  const openEdit = (test: TestResult) => {
    setEditingTest(test);
    setEditValue(String(test.value));
    setEditUnit(test.unit ?? "");
  };

  const saveEdit = async () => {
    if (!editingTest) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/tests/${editingTest.test_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": String(userId) },
        body: JSON.stringify({ value: parseFloat(editValue), unit: editUnit || null }),
      });
      if (!res.ok) {
        const error = await res.json();
        Alert.alert("Error", error.error || "Failed to update");
        return;
      }
      Alert.alert("Updated", "Test result updated");
      setEditingTest(null);
      await fetchTests();
    } catch {
      Alert.alert("Error", "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (testId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/tests/${testId}`, {
        method: "DELETE",
        headers: { "x-user-id": String(userId) },
      });
      if (!res.ok) {
        Alert.alert("Error", "Failed to delete test result");
        return;
      }
      Alert.alert("Deleted", "Test result deleted");
      await fetchTests();
    } catch {
      Alert.alert("Error", "Failed to delete");
    }
  };

  const statusColor = (s: string) =>
    s === "abnormal" ? "#e63946" : s === "moderate" ? "#f59e0b" : "#16a34a";
  const statusLabel = (s: string) =>
    s === "abnormal" ? "Abnormal" : s === "moderate" ? "Moderate" : "Normal";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.title}>Test Results</Text>
            <View style={{ width: 24 }} />
          </View>

          {activeMember && (
            <Text style={styles.memberLabel}>Viewing {activeMember.name}'s results</Text>
          )}

          <TouchableOpacity
            style={[styles.addTestBtn, addingTest && { opacity: 0.6 }]}
            onPress={() => setShowAddTest(true)} disabled={addingTest}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addTestText}>Add Test Result</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator color="#29A9F8" size="large" style={{ marginTop: 40 }} />
          ) : grouped.length === 0 ? (
            <Text style={styles.empty}>No test results yet. Add a test result to get started.</Text>
          ) : (
            grouped.map((group) => (
              <View key={group.date}>
                <Text style={styles.dateHeader}>
                  {new Date(group.date).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </Text>
                {group.results.map((t) => (
                  <View key={t.test_id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.name}>{t.test_name}</Text>
                      <View style={styles.actions}>
                        <TouchableOpacity onPress={() => openEdit(t)} style={{ marginRight: 12 }}>
                          <Ionicons name="pencil" size={16} color="#29A9F8" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteTest(t.test_id)}>
                          <Ionicons name="trash" size={16} color="#e63946" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.value}>
                      {t.value}{t.unit ? ` ${t.unit}` : ""}
                    </Text>
                    <Text style={styles.range}>
                      Normal: {t.normal_min} – {t.normal_max}{t.unit ? ` ${t.unit}` : ""}
                    </Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.dot, { backgroundColor: statusColor(t.status) }]} />
                      <Text style={[styles.statusText, { color: statusColor(t.status) }]}>
                        {statusLabel(t.status)}
                      </Text>
                      {t.edited_by_user === 1 && (
                        <Text style={styles.editedTag}> · Edited</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>

        {/* EDIT MODAL */}
        <Modal visible={!!editingTest} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Edit: {editingTest?.test_name}</Text>
              <TextInput
                style={styles.modalInput} value={editValue}
                onChangeText={setEditValue} keyboardType="numeric" placeholder="Value"
              />
              <TextInput
                style={styles.modalInput} value={editUnit}
                onChangeText={setEditUnit} placeholder="Unit (e.g. mg/dL)"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingTest(null)}>
                  <Text style={{ color: "#6b7280", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={saveEdit} disabled={saving}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ADD TEST MODAL */}
        <Modal visible={showAddTest} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Add Test Result</Text>
              <TextInput
                style={styles.modalInput} value={newTestName}
                onChangeText={setNewTestName} placeholder="Test Name (e.g. Blood Glucose)"
              />
              <TextInput
                style={styles.modalInput} value={newTestValue}
                onChangeText={setNewTestValue} keyboardType="numeric" placeholder="Value"
              />
              <TextInput
                style={styles.modalInput} value={newTestUnit}
                onChangeText={setNewTestUnit} placeholder="Unit (e.g. mg/dL)"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddTest(false)}>
                  <Text style={{ color: "#6b7280", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, addingTest && { opacity: 0.6 }]}
                  onPress={handleAddTest} disabled={addingTest}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {addingTest ? "Adding..." : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ChatBubble />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf6ff", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  memberLabel: { fontSize: 13, color: "#6b7280", marginBottom: 16 },
  addTestBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#16a34a", padding: 14, borderRadius: 12, marginBottom: 20,
  },
  addTestText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  dateHeader: { fontSize: 13, fontWeight: "700", color: "#6b7280", marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "700", color: "#1f2937", flex: 1 },
  actions: { flexDirection: "row" },
  value: { fontSize: 22, fontWeight: "bold", color: "#111827", marginTop: 6 },
  range: { color: "#6b7280", marginTop: 4, fontSize: 12 },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusText: { fontWeight: "600", fontSize: 12 },
  editedTag: { fontSize: 11, color: "#9ca3af" },
  empty: { textAlign: "center", marginTop: 40, color: "#6b7280" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937", marginBottom: 16 },
  modalInput: { backgroundColor: "#f9fafb", padding: 14, borderRadius: 12, marginBottom: 12 },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center" },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#29A9F8", alignItems: "center" },
});
