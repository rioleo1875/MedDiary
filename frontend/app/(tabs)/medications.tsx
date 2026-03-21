import { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ChatBubble from "../../components/ChatBubble";
import { familyMembers } from "../../constants/familyData";
import { getSelectedMember } from "../../constants/selectedMember";

export default function MedicationsScreen() {
  const router = useRouter();
  const [meds, setMeds] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const memberId = getSelectedMember();
      const member = familyMembers.find((m) => m.id === memberId);

      if (member) {
        setMeds(member.medications || []);
      } else {
        setMeds([]);
      }
    }, [])
  );

  const regular = meds.filter((m) => m.type === "regular");
  const temporary = meds.filter((m) => m.type === "temporary");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>Medications</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* 🔥 MAIN CARD */}
          <View style={styles.card}>

            {/* HEADERS */}
            <View style={styles.topRow}>
              <Text style={styles.columnTitle}>Regular Meds</Text>
              <Text style={styles.columnTitle}>Temporary Meds</Text>
            </View>

            {/* SCROLLABLE AREA */}
            <ScrollView
              style={styles.scrollArea}
              showsVerticalScrollIndicator={true}
            >
              {Array.from({
                length: Math.max(regular.length, temporary.length),
              }).map((_, i) => (
                <View key={i} style={styles.row}>

                  {/* LEFT */}
                  <View style={styles.column}>
                    {regular[i] && (
                      <View style={styles.pill}>
                        <Text style={styles.pillText}>
                          {regular[i].name}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* RIGHT */}
                  <View style={styles.column}>
                    {temporary[i] && (
                      <View style={styles.pill}>
                        <Text style={styles.pillText}>
                          {temporary[i].name}
                        </Text>
                      </View>
                    )}
                  </View>

                </View>
              ))}
            </ScrollView>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(tabs)/edit-medications")}
          >
            <Text style={styles.buttonText}>Edit Medications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(tabs)/reminders")}
          >
            <Text style={styles.buttonText}>Set Reminders</Text>
          </TouchableOpacity>

          {/* WARNING */}
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={18} color="#e63946" />
            <Text style={styles.warningText}>
              The drugs Warfarin and Ibuprofen have a high risk of interaction.
            </Text>
          </View>

        </ScrollView>

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

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  columnTitle: {
    width: "48%",
    textAlign: "center",
    fontWeight: "700",
    color: "#1f2937",
  },

  scrollArea: {
    maxHeight: 260,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  column: {
    width: "48%",
  },

  pill: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  pillText: {
    color: "#1f2937",
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#29A9F8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },

  warningBox: {
    flexDirection: "row",
    backgroundColor: "#fdecea",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  warningText: {
    color: "#b91c1c",
    marginLeft: 8,
    flex: 1,
  },
});