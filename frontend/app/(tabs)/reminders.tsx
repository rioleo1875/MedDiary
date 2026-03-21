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
import ChatBubble from "../../components/ChatBubble";
import {
  reminders,
  loadReminders,
  saveReminders,
} from "../../constants/reminderData";

export default function ReminderScreen() {
  const router = useRouter();

  const [list, setList] = useState(reminders);
  const [med, setMed] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await loadReminders();
        setList([...reminders]);
      };
      init();
    }, [])
  );

  // ✅ STRICT INPUT CONTROL
  const handleHour = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
    setHour(cleaned);
  };

  const handleMinute = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
    setMinute(cleaned);
  };

  // 🔹 Validate time
  const isValidTime = () => {
    const h = Number(hour);
    const m = Number(minute);
    return h >= 1 && h <= 12 && m >= 0 && m <= 59;
  };

  // 🔹 FORMAT TIME (05 instead of 5)
  const format = (val: string) => val.padStart(2, "0");

  // 🔹 ADD REMINDER
  const addReminder = async () => {
    if (!med || !hour || !minute || !isValidTime()) {
      alert("Enter valid time");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      med,
      hour: format(hour),
      minute: format(minute),
      period,
    };

    reminders.push(newItem);
    await saveReminders();

    setList([...reminders]);

    setMed("");
    setHour("");
    setMinute("");
  };

  // 🔹 DELETE REMINDER
  const deleteReminder = async (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);

    reminders.length = 0;
    reminders.push(...updated);

    await saveReminders();
    setList(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>Reminders</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* MED NAME */}
          <TextInput
            placeholder="Medication"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={med}
            onChangeText={setMed}
          />

          {/* TIME INPUT */}
          <View style={styles.timeRow}>
            <TextInput
              placeholder="HH"
              style={styles.small}
              keyboardType="number-pad"
              value={hour}
              onChangeText={handleHour}
            />

            <TextInput
              placeholder="MM"
              style={styles.small}
              keyboardType="number-pad"
              value={minute}
              onChangeText={handleMinute}
            />

            <TouchableOpacity
              style={styles.ampm}
              onPress={() =>
                setPeriod(period === "AM" ? "PM" : "AM")
              }
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {period}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ADD BUTTON */}
          <TouchableOpacity style={styles.button} onPress={addReminder}>
            <Text style={styles.buttonText}>Add Reminder</Text>
          </TouchableOpacity>

          {/* LIST */}
          <Text style={styles.section}>Scheduled Reminders</Text>

          {list.length === 0 ? (
            <Text style={styles.empty}>No reminders added</Text>
          ) : (
            list.map((r) => (
              <View key={r.id} style={styles.card}>
                <View>
                  <Text style={styles.name}>{r.med}</Text>
                  <Text style={styles.time}>
                    {r.hour}:{r.minute} {r.period}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteReminder(r.id)}
                >
                  <Ionicons
                    name="trash"
                    size={20}
                    color="#e63946"
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
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

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  small: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    width: 70,
    marginRight: 8,
    textAlign: "center",
  },

  ampm: {
    backgroundColor: "#29A9F8",
    padding: 12,
    borderRadius: 10,
  },

  button: {
    backgroundColor: "#29A9F8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  section: {
    fontWeight: "600",
    marginBottom: 10,
  },

  empty: {
    textAlign: "center",
    color: "#6b7280",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontWeight: "600",
  },

  time: {
    color: "#6b7280",
    marginTop: 4,
  },
});