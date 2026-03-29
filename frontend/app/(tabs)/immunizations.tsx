import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

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
        setSelectedImage(null);
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

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission required", "Camera permission is required to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      await processImageOCR(result.assets[0].uri);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert("Permission required", "Gallery permission is required to select photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      await processImageOCR(result.assets[0].uri);
    }
  };

  // Process image with OCR
  const processImageOCR = async (imageUri: string) => {
    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'immunization_card.jpg',
      } as any);

      const response = await fetch(`${API_BASE}/api/immunizations/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-id': String(userId),
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.vaccines && data.vaccines.length > 0) {
          // Auto-fill first detected vaccine
          const firstVaccine = data.vaccines[0];
          setNewVaccineName(firstVaccine.name || '');
          setNewVaccineDate(firstVaccine.date || '');
          Alert.alert("Success", `Detected ${data.vaccines.length} vaccine(s) from image`);
        } else {
          Alert.alert("No vaccines detected", "Could not find vaccine information in the image. Please try again or enter manually.");
        }
      } else {
        Alert.alert("OCR Error", "Failed to process image. Please try again.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      Alert.alert("OCR Error", "Failed to process image. Please try again.");
    } finally {
      setOcrLoading(false);
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
                {/* OCR Section */}
                <View style={styles.ocrSection}>
                  <Text style={styles.ocrTitle}>📸 Scan Immunization Card</Text>
                  <Text style={styles.ocrSubtitle}>Take a photo or select from gallery to auto-fill vaccine details</Text>
                  
                  <View style={styles.cameraButtons}>
                    <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={styles.cameraButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                      <Ionicons name="images" size={20} color="#fff" />
                      <Text style={styles.cameraButtonText}>Gallery</Text>
                    </TouchableOpacity>
                  </View>

                  {ocrLoading && (
                    <View style={styles.ocrLoading}>
                      <Text style={styles.ocrLoadingText}>🔍 Scanning image...</Text>
                    </View>
                  )}

                  {selectedImage && !ocrLoading && (
                    <View style={styles.selectedImageContainer}>
                      <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                      <TouchableOpacity 
                        style={styles.clearImageButton} 
                        onPress={() => setSelectedImage(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Manual Input Section */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
                  <View style={styles.dividerLine} />
                </View>

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

  /* OCR Section */
  ocrSection: {
    marginBottom: 20,
  },

  ocrTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },

  ocrSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },

  cameraButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },

  cameraButton: {
    backgroundColor: "#29A9F8",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },

  galleryButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },

  cameraButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  ocrLoading: {
    alignItems: "center",
    padding: 16,
  },

  ocrLoadingText: {
    color: "#6b7280",
    fontSize: 16,
  },

  selectedImageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
  },

  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },

  clearImageButton: {
    position: "absolute",
    top: -8,
    right: 60,
  },

  /* Divider */
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
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
