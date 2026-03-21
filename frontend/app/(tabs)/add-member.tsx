import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { familyMembers, saveFamily } from "../../constants/familyData"; // ✅ FIXED

export default function AddMemberScreen() {
  const router = useRouter();

  const { member } = useLocalSearchParams();
  const parsedMember = member ? JSON.parse(member as string) : null;

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [blood, setBlood] = useState("");
  const [relation, setRelation] = useState("");
  const [customRelation, setCustomRelation] = useState("");

  useEffect(() => {
    if (parsedMember) {
      setName(parsedMember.name);
      setAge(String(parsedMember.age));
      setGender(parsedMember.gender);
      setBlood(parsedMember.blood);
      setRelation(parsedMember.relation || "");
    }
  }, []);

  const handleSave = async () => {
    const finalRelation =
      relation === "Other" ? customRelation : relation;

    if (!name || !age || !gender || !blood || !finalRelation) {
      alert("Fill all fields");
      return;
    }

    let updatedMembers = [];

    if (parsedMember) {
      updatedMembers = familyMembers.map((m) =>
        m.id === parsedMember.id
          ? {
              ...m,
              name,
              age: Number(age),
              gender,
              blood,
              relation: finalRelation,
            }
          : m
      );
    } else {
      const newMember = {
        id: Date.now().toString(),
        name,
        age: Number(age),
        gender,
        blood,
        relation: finalRelation,
        medications: [],
        reminders: [],
      };

      updatedMembers = [...familyMembers, newMember];
    }

    // 🔥 Sync global
    familyMembers.length = 0;
    familyMembers.push(...updatedMembers);

    // ✅ FIXED: use centralized save
    await saveFamily();

    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {parsedMember ? "Edit Member" : "Add Member"}
          </Text>

          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>

          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Age"
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />

          {/* Gender */}
          <View style={styles.row}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.selectBtn,
                  gender === g && styles.selected,
                ]}
                onPress={() => setGender(g)}
              >
                <Text style={gender === g && styles.selectedText}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Relation */}
          <View style={styles.wrap}>
            {[
              "Father",
              "Mother",
              "Brother",
              "Sister",
              "Spouse",
              "Child",
              "Self",
              "Other",
            ].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.wrapBtn,
                  relation === r && styles.selected,
                ]}
                onPress={() => setRelation(r)}
              >
                <Text style={relation === r && styles.selectedText}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {relation === "Other" && (
            <TextInput
              placeholder="Specify relation"
              style={styles.input}
              value={customRelation}
              onChangeText={setCustomRelation}
            />
          )}

          {/* Blood */}
          <View style={styles.wrap}>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
              <TouchableOpacity
                key={b}
                style={[
                  styles.bloodBtn,
                  blood === b && styles.selected,
                ]}
                onPress={() => setBlood(b)}
              >
                <Text style={blood === b && styles.selectedText}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {parsedMember ? "Update Member" : "Save Member"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf6ff", padding: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: { fontSize: 18, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  selectBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },

  wrapBtn: {
    width: "48%",
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  bloodBtn: {
    width: "23%",
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  selected: {
    backgroundColor: "#29A9F8",
  },

  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#29A9F8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});