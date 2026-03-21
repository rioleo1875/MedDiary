import { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import {
  medications,
  saveMedications,
  loadMedications,
} from "../../constants/medicationData";

export default function EditMedications() {
  const router = useRouter();

  const [medList, setMedList] = useState(medications);
  const [name, setName] = useState("");
  const [type, setType] = useState<"regular" | "temporary">("regular");

  // 🔥 Load data when screen opens
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadMedications();
        setMedList([...medications]);
      };
      init();
    }, [])
  );

  // 🔹 Add medication
  const addMedication = async () => {
    if (!name.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name,
      type,
    };

    medications.push(newItem);
    await saveMedications();

    setMedList([...medications]);
    setName("");
  };

  // 🔹 Delete medication
  const deleteMedication = async (id: string) => {
    const updated = medications.filter((m) => m.id !== id);

    medications.length = 0;
    medications.push(...updated);

    await saveMedications();
    setMedList(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <Text style={styles.title}>Edit Medications</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* INPUT */}
        <TextInput
          placeholder="Medication Name"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        {/* TYPE SELECT */}
        <View style={styles.typeRow}>
          {["regular", "temporary"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeBtn,
                type === t && styles.typeSelected,
              ]}
              onPress={() => setType(t as any)}
            >
              <Text
                style={[
                  styles.typeText,
                  type === t && styles.typeTextSelected,
                ]}
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity style={styles.addBtn} onPress={addMedication}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>

        {/* LIST */}
        {medList.map((m) => (
          <View key={m.id} style={styles.card}>
            <View>
              <Text style={styles.name}>{m.name}</Text>

              {/* 🔥 TYPE BADGE */}
              <View
                style={[
                  styles.tag,
                  m.type === "regular"
                    ? styles.regularTag
                    : styles.tempTag,
                ]}
              >
                <Text style={styles.tagText}>
                  {m.type.toUpperCase()}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => deleteMedication(m.id)}>
              <Ionicons name="trash" size={22} color="#e63946" />
            </TouchableOpacity>
          </View>
        ))}
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
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },

  /* INPUT */
  input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },

  /* TYPE BUTTONS */
  typeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  typeBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    marginHorizontal: 5,
  },

  typeSelected: {
    backgroundColor: "#29A9F8",
  },

  typeText: {
    color: "#374151",
    fontWeight: "600",
  },

  typeTextSelected: {
    color: "#ffffff",
  },

  /* ADD BUTTON */
  addBtn: {
    backgroundColor: "#29A9F8",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },

  addText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },

  /* LIST CARD */
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },

  /* TAG */
  tag: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  regularTag: {
    backgroundColor: "#dbeafe",
  },

  tempTag: {
    backgroundColor: "#fef3c7",
  },

  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1f2937",
  },
});