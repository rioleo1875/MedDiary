import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import ChatBubble from "../../components/ChatBubble";
import { useMember, API_BASE } from "../../context/MemberContext";
import { useAuth } from "../../context/AuthContext";

export default function ImmunizationScreen() {
  const router = useRouter();
  const { activeMember } = useMember();
  const { userId } = useAuth();
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVaccineName, setNewVaccineName] = useState("");
  const [newVaccineDate, setNewVaccineDate] = useState("");

  // Fetch immunizations from backend
  const fetchImmunizations = async () => {
    if (!activeMember) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/immunizations/member/${activeMember.member_id}`, {
        headers: { "x-user-id": String(userId) },
      });
      const data = await response.json();
      setVaccines(data || []);
    } catch (error) {
      console.error("Failed to fetch immunizations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImmunizations();
  }, [activeMember]);

  // Add new immunization
  const handleAddImmunization = async () => {
    if (!newVaccineName.trim() || !newVaccineDate.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!activeMember) return;

    try {
      const response = await fetch(`${API_BASE}/api/immunizations/member/${activeMember.member_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId),
        },
        body: JSON.stringify({
          name: newVaccineName.trim(),
          date: newVaccineDate.trim(),
        }),
      });

      if (response.ok) {
        setNewVaccineName("");
        setNewVaccineDate("");
        setShowAddModal(false);
        fetchImmunizations(); // Refresh the list
      } else {
        Alert.alert("Error", "Failed to add immunization");
      }
    } catch (error) {
      console.error("Failed to add immunization:", error);
      Alert.alert("Error", "Failed to add immunization");
    }
  };

  // Delete immunization
  const handleDeleteImmunization = async (index: number) => {
    if (!activeMember) return;

    try {
      const response = await fetch(`${API_BASE}/api/immunizations/member/${activeMember.member_id}/${index}`, {
        method: "DELETE",
        headers: { "x-user-id": String(userId) },
      });

      if (response.ok) {
        fetchImmunizations(); // Refresh the list
      } else {
        Alert.alert("Error", "Failed to delete immunization");
      }
    } catch (error) {
      console.error("Failed to delete immunization:", error);
      Alert.alert("Error", "Failed to delete immunization");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>Immunizations</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* LIST */}
          {loading ? (
            <Text style={styles.empty}>Loading immunizations...</Text>
          ) : vaccines.length === 0 ? (
            <Text style={styles.empty}>
              No immunization records available
            </Text>
          ) : (
            vaccines.map((v, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.textContainer}>
                    <Text style={styles.name}>{v.name}</Text>
                    <Text style={styles.info}>Date: {v.date}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteImmunization(i)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Immunization</Text>
        </TouchableOpacity>

        {/* ADD MODAL */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Immunization</Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.modalBody}>
                <TextInput
                  placeholder="Vaccine name"
                  style={styles.input}
                  value={newVaccineName}
                  onChangeText={setNewVaccineName}
                />

                <TextInput
                  placeholder="Date (e.g., 2023, Jan 2023, 2023-01-15)"
                  style={styles.input}
                  value={newVaccineDate}
                  onChangeText={setNewVaccineDate}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleAddImmunization}>
                  <Text style={styles.saveButtonText}>Save Immunization</Text>
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

  /* CARD */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  name: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1f2937",
  },

  info: {
    color: "#6b7280",
    marginTop: 4,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
  },

  /* ADD BUTTON */
  addButton: {
    backgroundColor: "#29A9F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /* CARD CONTENT */
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
  },

  deleteButton: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },

  modalBody: {
    padding: 16,
  },

  input: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  saveButton: {
    backgroundColor: "#29A9F8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});