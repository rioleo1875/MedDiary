import {
  ScrollView, StyleSheet, Text, View, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useMember, API_BASE } from "../../context/MemberContext";

type Contact = {
  contact_id: number;
  name: string;
  user_email: string;
  relationship: string;
};

type AccessUser = {
  contact_id: number;
  user_id: number;
  name: string;
  user_email: string;
  relationship: string;
};

export default function EmergencyProfile() {
  const router = useRouter();
  const { activeMember, userId, refreshMembers } = useMember();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accessList, setAccessList] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Add contact form
  const [showAddModal, setShowAddModal] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit allergies
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [allergyText, setAllergyText] = useState("");
  const [savingAllergy, setSavingAllergy] = useState(false);

  // ── Fetch contacts & access list ────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsRes, accessRes] = await Promise.all([
        fetch(`${API_BASE}/api/emergency/my-contacts`, {
          headers: { "x-user-id": String(userId) },
        }),
        fetch(`${API_BASE}/api/emergency/access-list`, {
          headers: { "x-user-id": String(userId) },
        }),
      ]);
      setContacts(await contactsRes.json());
      setAccessList(await accessRes.json());
    } catch {
      Alert.alert("Error", "Failed to load emergency data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  // ── Add emergency contact ───────────────────────────────────
  const addContact = async () => {
    if (!contactEmail.trim() || !relationship.trim()) {
      Alert.alert("Fill in both email and relationship");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/api/emergency/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": String(userId) },
        body: JSON.stringify({
          email: contactEmail.trim(),
          relationship: relationship.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert("Error", data.error); return; }
      Alert.alert("Added", `${data.contact.name} added as emergency contact`);
      setContactEmail(""); setRelationship("");
      setShowAddModal(false);
      await fetchData();
    } catch {
      Alert.alert("Error", "Failed to add contact");
    } finally {
      setAdding(false);
    }
  };

  // ── Remove emergency contact ────────────────────────────────
  const removeContact = (contactId: number, name: string) => {
    Alert.alert("Remove", `Remove ${name} as emergency contact?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive", onPress: async () => {
          try {
            await fetch(`${API_BASE}/api/emergency/${contactId}`, {
              method: "DELETE", headers: { "x-user-id": String(userId) },
            });
            await fetchData();
          } catch { Alert.alert("Error", "Failed to remove contact"); }
        },
      },
    ]);
  };

  // ── View another user's emergency summary ───────────────────
  const viewSummary = (targetUserId: number) => {
    const url = `${API_BASE}/api/summary/emergency/${targetUserId}?userId=${userId}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open summary")
    );
  };

  // ── Save allergies ──────────────────────────────────────────
  const saveAllergies = async () => {
    if (!activeMember) return;
    setSavingAllergy(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/family/members/${activeMember.member_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-user-id": String(userId) },
          body: JSON.stringify({
            name: activeMember.name,
            age: activeMember.age,
            gender: activeMember.gender,
            blood_group: activeMember.blood_group,
            relation: activeMember.relation,
            allergies: allergyText.trim() || null,
          }),
        }
      );
      if (!res.ok) { Alert.alert("Error", "Failed to save allergies"); return; }
      Alert.alert("Saved", "Allergies updated");
      setShowAllergyModal(false);
      await refreshMembers(); // refresh context so activeMember updates
    } catch {
      Alert.alert("Error", "Failed to save");
    } finally {
      setSavingAllergy(false);
    }
  };

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

        {/* ALERT BAR */}
        <View style={styles.alertBar}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.alertText}>Emergency Information</Text>
        </View>

        {/* PATIENT DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <Text style={styles.item}><Text style={styles.label}>Name: </Text>{activeMember?.name ?? "—"}</Text>
          <Text style={styles.item}><Text style={styles.label}>Age: </Text>{activeMember?.age ?? "—"}</Text>
          <Text style={styles.item}><Text style={styles.label}>Blood Group: </Text>{activeMember?.blood_group ?? "—"}</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.item}>
              <Text style={styles.label}>Allergies: </Text>
              {activeMember?.allergies ?? "None reported"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setAllergyText(activeMember?.allergies ?? "");
                setShowAllergyModal(true);
              }}
            >
              <Ionicons name="pencil" size={18} color="#29A9F8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MY EMERGENCY CONTACTS */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>My Emergency Contacts</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subNote}>
            MedDiary users who can access your medical summary in an emergency.
          </Text>

          {loading ? (
            <ActivityIndicator color="#29A9F8" style={{ marginTop: 10 }} />
          ) : contacts.length === 0 ? (
            <Text style={styles.item}>No emergency contacts added yet.</Text>
          ) : (
            contacts.map((c) => (
              <View key={c.contact_id} style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {c.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactSub}>{c.user_email}</Text>
                  <Text style={styles.contactSub}>Relation: {c.relationship}</Text>
                </View>
                <TouchableOpacity onPress={() => removeContact(c.contact_id, c.name)}>
                  <Ionicons name="trash-outline" size={18} color="#e63946" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* USERS I CAN ACCESS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Summaries I Can Access</Text>
          <Text style={styles.subNote}>
            Users who have added you as their emergency contact.
          </Text>

          {loading ? (
            <ActivityIndicator color="#29A9F8" style={{ marginTop: 10 }} />
          ) : accessList.length === 0 ? (
            <Text style={styles.item}>No one has added you as an emergency contact yet.</Text>
          ) : (
            accessList.map((u) => (
              <View key={u.contact_id} style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {u.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{u.name}</Text>
                  <Text style={styles.contactSub}>{u.user_email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.summaryBtn}
                  onPress={() => viewSummary(u.user_id)}
                >
                  <Ionicons name="document-text-outline" size={14} color="#fff" />
                  <Text style={styles.summaryBtnText}>Summary</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <Text style={styles.note}>
          This information is for emergency use only.
        </Text>

      </ScrollView>

      {/* ADD CONTACT MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Their MedDiary email"
              placeholderTextColor="#9ca3af"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Relationship (e.g. Spouse, Sibling)"
              placeholderTextColor="#9ca3af"
              value={relationship}
              onChangeText={setRelationship}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={{ color: "#6b7280", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, adding && { opacity: 0.6 }]}
                onPress={addContact} disabled={adding}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {adding ? "Adding..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ALLERGY EDIT MODAL */}
      <Modal visible={showAllergyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Allergies</Text>
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: "top" }]}
              placeholder="e.g. Penicillin, Peanuts, Dust"
              placeholderTextColor="#9ca3af"
              value={allergyText}
              onChangeText={setAllergyText}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAllergyModal(false)}
              >
                <Text style={{ color: "#6b7280", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, savingAllergy && { opacity: 0.6 }]}
                onPress={saveAllergies} disabled={savingAllergy}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {savingAllergy ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf6ff", padding: 20 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 15,
  },
  title: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  alertBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#e63946", padding: 12, borderRadius: 10, marginBottom: 20,
  },
  alertText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    marginBottom: 16, elevation: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10, color: "#1f2937" },
  subNote: { fontSize: 12, color: "#9ca3af", marginBottom: 12 },
  item: { fontSize: 14, color: "#374151", marginBottom: 6 },
  label: { fontWeight: "600", color: "#1f2937" },
  rowBetween: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  addBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#29A9F8", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  addBtnText: { color: "#fff", fontWeight: "600", marginLeft: 4, fontSize: 13 },
  contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  contactAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#29A9F8", justifyContent: "center",
    alignItems: "center", marginRight: 12,
  },
  contactAvatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  contactName: { fontWeight: "600", fontSize: 14, color: "#1f2937" },
  contactSub: { fontSize: 12, color: "#6b7280" },
  summaryBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#29A9F8", paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 16,
  },
  summaryBtnText: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 },
  note: { fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 40 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: "#fff", borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 24,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937", marginBottom: 16 },
  modalInput: {
    backgroundColor: "#f9fafb", padding: 14,
    borderRadius: 12, marginBottom: 12,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: "#f3f4f6", alignItems: "center",
  },
  saveBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: "#29A9F8", alignItems: "center",
  },
});