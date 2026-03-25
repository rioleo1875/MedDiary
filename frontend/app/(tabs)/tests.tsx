import {
  ScrollView, StyleSheet, Text, View,
  TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import * as DocumentPicker from "expo-document-picker";
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
  const [uploading, setUploading] = useState(false);

  // Edit modal
  const [editingTest, setEditingTest] = useState<TestResult | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [saving, setSaving] = useState(false);

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

  // ── Upload report ───────────────────────────────────────────
  const handleUpload = async () => {
    if (!activeMember) { Alert.alert("No Member", "Select a family member first."); return; }
    try {
      console.log('Tests: Starting file upload for member:', activeMember.member_id);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      console.log('Tests: Selected file:', file.name, file.mimeType);
      
      const formData = new FormData();
      formData.append("report", {
        uri: file.uri, name: file.name,
        type: file.mimeType || "application/pdf",
      } as any);

      setUploading(true);
      console.log('Tests: Uploading to OCR endpoint...');
      const res = await fetch(
        `${API_BASE}/api/ocr/scan/${activeMember.member_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data", "x-user-id": String(userId) },
          body: formData,
        }
      );
      
      const data = await res.json();
      console.log('Tests: OCR response:', data);
      
      if (data.message === "Report processed") {
        Alert.alert("Success", "Report analyzed and saved!");
        await fetchTests();
      } else {
        // More specific error messages
        if (data.error?.includes("extract text")) {
          Alert.alert("OCR Error", "Could not extract text from the PDF. Please ensure it's a clear, text-based PDF or try a different file.");
        } else if (data.error?.includes("network") || data.error?.includes("connection")) {
          Alert.alert("Connection Error", "Network issue. Please check your connection and try again.");
        } else {
          Alert.alert("Processing Error", data.error || "Could not process report. Please try again.");
        }
      }
    } catch (err) {
      console.error('Tests: Upload error:', err);
      Alert.alert("Upload failed", "An error occurred while uploading. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────
  const openEdit = (test: TestResult) => {
    setEditingTest(test);
    setEditValue(String(test.value));
    setEditUnit(test.unit ?? "");
  };

  const saveEdit = async (confirm = false) => {
    if (!editingTest) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/tests/${editingTest.test_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": String(userId) },
        body: JSON.stringify({ value: parseFloat(editValue), unit: editUnit || null, confirm }),
      });
      const data = await res.json();

      if (data.requiresConfirmation) {
        Alert.alert("Unusual Value", data.warning, [
          { text: "Cancel", style: "cancel" },
          { text: "Save Anyway", onPress: () => saveEdit(true) },
        ]);
        return;
      }
      if (!res.ok) { Alert.alert("Error", data.error); return; }
      Alert.alert("Updated", "Test result updated");
      setEditingTest(null);
      await fetchTests();
    } catch {
      Alert.alert("Error", "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────
  const deleteTest = (testId: number) => {
    Alert.alert("Delete", "Remove this test result?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await fetch(`${API_BASE}/api/tests/${testId}`, {
              method: "DELETE", headers: { "x-user-id": String(userId) },
            });
            await fetchTests();
          } catch { Alert.alert("Error", "Failed to delete"); }
        },
      },
    ]);
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
            style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
            onPress={handleUpload} disabled={uploading}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadText}>
              {uploading ? "Processing..." : "Upload Report (PDF / Image)"}
            </Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator color="#29A9F8" size="large" style={{ marginTop: 40 }} />
          ) : grouped.length === 0 ? (
            <Text style={styles.empty}>No test results yet. Upload a report to get started.</Text>
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
                  onPress={() => saveEdit(false)} disabled={saving}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {saving ? "Saving..." : "Save"}
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
  uploadBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#29A9F8", padding: 14, borderRadius: 12, marginBottom: 20,
  },
  uploadText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
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